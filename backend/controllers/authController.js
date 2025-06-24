const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');

process.env.AZURE_CLIENT_ID = '9ccaec98-5039-48e2-94fc-18001030bc15';
process.env.AZURE_CLIENT_SECRET = 'Vwq8Q~qakjY5Uroq6Pa3iy6eQcaq3Cwmn5ebDbf4';
process.env.AZURE_TENANT_ID = '576932a4-0981-4b24-9b56-497fae646195';
process.env.AZURE_REDIRECT_URI = 'http://localhost:5173/callback';

// Debug environment variables
// console.log('Azure Config Check:');
// console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID ? 'Set' : 'Not set');
// console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? 'Set' : 'Not set');
// console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID ? 'Set' : 'Not set');

// Azure AD configuration
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || 'fb3e75a7-554f-41f8-9da3-2b162c255349',
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || '534253fc-dfb6-462f-b5ca-cbe81939f5ee'}`
    }
};

// Validate required environment variables
if (!process.env.AZURE_CLIENT_SECRET) {
    console.error('AZURE_CLIENT_SECRET is not set in environment variables');
    process.exit(1);
}

const msalInstance = new ConfidentialClientApplication(msalConfig);

const registerUser = async (req, res) => {
    try {
        const { userType, userId, password, serviceNo, name, designation, section, group, contactNo, role, email } = req.body;

        const userExists = await User.findOne({ userId });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            userType,
            userId,
            password: hashedPassword,
            serviceNo,
            name,
            designation,
            section,
            group,
            contactNo,
            role,
            email
        });

        res.status(201).json({
            _id: user.id,
            userType: user.userType,
            userId: user.userId,
            serviceNo: user.serviceNo,
            name: user.name,
            designation: user.designation,
            section: user.section,
            group: user.group,
            contactNo: user.contactNo,
            role: user.role,
            email: user.email,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { userId, password, userType } = req.body;
        const user = await User.findOne({ userId, userType });
        console.log(user);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                userType: user.userType,
                userId: user.userId,
                serviceNo: user.serviceNo,
                name: user.name,
                designation: user.designation,
                section: user.section,
                group: user.group,
                contactNo: user.contactNo,
                role: user.role,
                branches: user.branches,
                email: user.email,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Azure AD Login - Fixed version
const azureLogin = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ message: 'Access token is required' });
        }

        // Get user info from Microsoft Graph using the access token
        const userInfo = await getUserInfoFromGraph(accessToken);
        console.log(userInfo);

        // Check if user exists in our database
        let user = await User.findOne({ 
            $or: [
                { email: userInfo.mail || userInfo.userPrincipalName },
                { userId: userInfo.userPrincipalName },
                { azureId: userInfo.id }
            ]
        });
        console.log('User:', user);

        if (!user) {
            // Generate a temporary password for Azure users (they won't use it)
            const tempPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(tempPassword, salt);

            // Create new user from Azure AD info with default values for required fields
            user = await User.create({
                userType: 'SLT',
                userId: userInfo.userPrincipalName,
                password: hashedPassword, // Required field - using temp password
                email: userInfo.mail || userInfo.userPrincipalName,
                name: userInfo.displayName || 'Azure User',
                serviceNo: userInfo.employeeId || 'N/A', // Default value if not provided
                designation: userInfo.jobTitle || 'N/A', // Default value if not provided
                section: userInfo.department || 'N/A', // Default value if not provided
                group: userInfo.companyName || 'N/A', // Default value if not provided
                contactNo: userInfo.mobilePhone || userInfo.businessPhones?.[0] || 'N/A', // Default value if not provided
                role: 'User', // Default role
                azureId: userInfo.id,
                isAzureUser: true,
                lastAzureSync: new Date()
            });
        } else {
            // Update existing user with latest Azure info
            user.name = userInfo.displayName || user.name;
            user.email = userInfo.mail || userInfo.userPrincipalName;
            user.designation = userInfo.jobTitle || user.designation;
            user.section = userInfo.department || user.section;
            user.group = userInfo.companyName || user.group;
            user.contactNo = userInfo.mobilePhone || userInfo.businessPhones?.[0] || user.contactNo;
            user.azureId = userInfo.id;
            user.isAzureUser = true;
            user.lastAzureSync = new Date();
            await user.save();
        }

        res.json({
            _id: user.id,
            userType: user.userType,
            userId: user.userId,
            serviceNo: user.serviceNo,
            name: user.name,
            designation: user.designation,
            section: user.section,
            group: user.group,
            contactNo: user.contactNo,
            role: user.role,
            branches: user.branches,
            email: user.email,
            isAzureUser: true,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Azure login error:', error);
        res.status(500).json({ message: 'Azure authentication failed', error: error.message });
    }
};

// Get Azure login URL
const getAzureLoginUrl = async (req, res) => {
    try {
        const authCodeUrlParameters = {
            scopes: ['https://graph.microsoft.com/User.Read'],
            redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5173/callback',
        };

        const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
        res.json({ authUrl });
    } catch (error) {
        console.error('Error generating Azure login URL:', error);
        res.status(500).json({ message: 'Failed to generate login URL' });
    }
};

// Helper function to get user info from Microsoft Graph
const getUserInfoFromGraph = async (accessToken) => {
    try {
        const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user info from Graph:', error);
        throw new Error('Failed to fetch user information from Microsoft Graph');
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, loginUser, azureLogin, getAzureLoginUrl };
