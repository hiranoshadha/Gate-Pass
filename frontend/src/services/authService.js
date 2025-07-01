import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if crypto is available
const isCryptoAvailable = () => {
    return typeof window !== 'undefined' && 
           (window.crypto || window.msCrypto) && 
           typeof (window.crypto?.getRandomValues || window.msCrypto?.getRandomValues) === 'function';
};

// Create axios instance with better configuration
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false, // Set to false to avoid CORS issues
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('Response error:', error);
        
        if (error.code === 'ERR_BLOCKED_BY_CLIENT') {
            throw new Error('Request blocked by browser extension or ad blocker. Please disable ad blockers and try again.');
        }
        
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check if the backend server is running.');
        }
        
        return Promise.reject(error);
    }
);

// Azure AD configuration
const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'fb3e75a7-554f-41f8-9da3-2b162c255349',
        authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || '534253fc-dfb6-462f-b5ca-cbe81939f5ee'}`,
        redirectUri: 'http://localhost:5173/callback',
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                console.log(message);
            }
        }
    }
};

let msalInstance = null;
let msalInitialized = false;

// Initialize MSAL instance only if crypto is available
const initializeMsal = async () => {
    if (!isCryptoAvailable()) {
        console.warn('Crypto API not available. Azure authentication will not work.');
        throw new Error('Crypto API not available for Azure authentication');
    }
    
    if (!msalInitialized && !msalInstance) {
        try {
            msalInstance = new PublicClientApplication(msalConfig);
            await msalInstance.initialize();
            msalInitialized = true;
        } catch (error) {
            console.error('MSAL initialization failed:', error);
            throw error;
        }
    }
};

export const authService = {
    login: async (userId, password, userType) => {
        try {
            console.log('Attempting login with:', { userId, userType });
            
            const response = await apiClient.post('/auth/login', {
                userId,
                password,
                userType
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific error types
            if (error.message.includes('blocked by browser extension')) {
                throw error; // Re-throw the custom message
            }
            
            if (error.response) {
                // Server responded with error status
                throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
            } else if (error.request) {
                // Request was made but no response received
                throw new Error('No response from server. Please check if the backend is running.');
            } else {
                // Something else happened
                throw new Error(error.message || 'Login failed');
            }
        }
    },

    azureLogin: async () => {
        try {
            // Check crypto availability first
            if (!isCryptoAvailable()) {
                throw new Error('Azure login requires a secure context (HTTPS) or modern browser with crypto support');
            }

            // Initialize MSAL before using it
            await initializeMsal();

            if (!msalInstance) {
                throw new Error('MSAL instance not initialized');
            }

            const loginRequest = {
                scopes: ['https://graph.microsoft.com/User.Read'],
                prompt: 'select_account'
            };

            const loginResponse = await msalInstance.loginPopup(loginRequest);
            
            // Send the access token to backend for verification and user creation
            const response = await apiClient.post('/auth/azure-login', {
                accessToken: loginResponse.accessToken
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            console.error('Azure login error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Azure login failed');
        }
    },

    logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        
        try {
            if (msalInstance && msalInitialized) {
                await msalInstance.logoutPopup();
            }
        } catch (error) {
            console.error('MSAL logout error:', error);
            // Continue with logout even if MSAL logout fails
        }
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    // Helper method to check if Azure login is available
    isAzureLoginAvailable: () => {
        return isCryptoAvailable();
    }
};
