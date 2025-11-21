import React, { createContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import axiosClient from '../api/client';
import { storeData, getData, removeData } from '../utils/storage';
import axios from 'axios';
import io from 'socket.io-client';

export const AuthContext = createContext();

const SOCKET_URL = 'https://amigosapp-backend.onrender.com'; 

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: null,
        user: null,
        isLoading: true,
    });
    
    const [notificaciones, setNotificaciones] = useState(0);
    const socket = useRef(null);

    useEffect(() => {
        despertarServidor();
        loadAuth();
    }, []);

    useEffect(() => {
        if (authState.user) {
            contarSolicitudes();

            socket.current = io(SOCKET_URL);
            socket.current.emit('entrar_chat', authState.user._id);

            socket.current.on('nueva_notificacion', () => setNotificaciones(prev => prev + 1));
            socket.current.on('nuevo_mensaje', () => setNotificaciones(prev => prev + 1));
        } else {
            if(socket.current) socket.current.disconnect();
        }
    }, [authState.user]);

    const contarSolicitudes = async () => {
        try {
            const res = await axiosClient.get('/app/solicitudes');
            setNotificaciones(res.data.length);
        } catch (error) { console.log(error); }
    };

    const limpiarNotificaciones = () => setNotificaciones(0);

    const despertarServidor = async () => {
        try {
            const rootUrl = axiosClient.defaults.baseURL.replace('/api', '');
            await axios.get(rootUrl);
        } catch (error) {}
    };

    const loadAuth = async () => {
        try {
            const token = await getData('token');
            const user = await getData('user');
            
            if (token && user) {
                axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
                setAuthState({ token, user: JSON.parse(user), isLoading: false });
            } else {
                setAuthState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await axiosClient.post('/auth/login', { email, password });
            await storeData('token', data.token);
            await storeData('user', JSON.stringify(data.usuario));
            axiosClient.defaults.headers.common.Authorization = `Bearer ${data.token}`;
            setAuthState({ token: data.token, user: data.usuario, isLoading: false });
        } catch (e) {
            Alert.alert('Error', e.response?.data?.msg || 'Error al iniciar sesión');
        }
    };

    const register = async (nombre, email, password, imagen) => {
        try {
            await axiosClient.post('/auth/registrar', { nombre, email, password, imagen });
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
        setAuthState({ token: null, user: null, isLoading: false });
        setNotificaciones(0);
    };

    return (
        <AuthContext.Provider value={{ authState, setAuthState, login, register, logout, notificaciones, limpiarNotificaciones, cargarNotificaciones: contarSolicitudes }}>
            {children}
        </AuthContext.Provider>
    );
};