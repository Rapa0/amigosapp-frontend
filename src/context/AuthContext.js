import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import axiosClient from '../api/client';
import { storeData, getData, removeData } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        const loadAuth = async () => {
            try {
                const token = await getData('token');
                const user = await getData('user');
                
                if (token && user) {
                    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
                    
                    setAuthState({
                        token,
                        user: JSON.parse(user),
                        isLoading: false
                    });
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.log(error);
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        };
        loadAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axiosClient.post('/auth/login', { email, password });
            
            await storeData('token', data.token);
            await storeData('user', JSON.stringify(data.usuario));
            
            axiosClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;

            setAuthState({
                token: data.token,
                user: data.usuario,
                isLoading: false
            });
        } catch (e) {
            Alert.alert('Error', e.response?.data?.msg || 'Error al iniciar sesión');
        }
    };

    const register = async (nombre, email, password, imagen) => {
        try {
            await axiosClient.post('/auth/registrar', { 
                nombre, 
                email, 
                password,
                imagen 
            });
            Alert.alert('Éxito', 'Cuenta creada. Ahora inicia sesión.');
            return true;
        } catch (e) {
            Alert.alert('Error', e.response?.data?.msg || 'Error al registrar');
            return false;
        }
    };

    const logout = async () => {
        await removeData('token');
        await removeData('user');
        delete axiosClient.defaults.headers.common.Authorization;
        
        setAuthState({
            token: null,
            user: null,
            isLoading: false
        });
    };

    return (
        <AuthContext.Provider value={{ authState, setAuthState, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};