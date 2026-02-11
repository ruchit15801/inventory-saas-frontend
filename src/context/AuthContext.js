import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { initializeSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const fetchUser = async () => {
        try {
            setLoading(false);
        } catch (error) {
            logout();
        }
    };

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            initializeSocket(token);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { user, token } = response.data.data;
            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        disconnectSocket();
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
