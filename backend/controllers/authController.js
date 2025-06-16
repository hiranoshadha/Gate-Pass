const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try {
        const { userType, userId, password, serviceNo, name, designation, section, group, contactNo, role } = req.body;

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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, loginUser };
