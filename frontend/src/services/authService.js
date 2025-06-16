import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const authService = {
    login: async (userId, password, userType) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                userId,
                password,
                userType
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};
