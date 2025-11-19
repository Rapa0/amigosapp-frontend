import React, { useState, useContext } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { Input, Button, Text, ButtonGroup } from '@rneui/themed';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/client';
import { storeData } from '../utils/storage';

export default function CompleteProfileScreen() {
    const { authState, setAuthState } = useContext(AuthContext);
    const user = authState.user;

    const [edad, setEdad] = useState('');
    const [descripcion, setDescripcion] = useState('');
    
    const generos = ['Hombre', 'Mujer', 'Otro'];
    const [idxGenero, setIdxGenero] = useState(0);

    const preferencias = ['Hombre', 'Mujer', 'Ambos'];
    const [idxPref, setIdxPref] = useState(2);

    const [loading, setLoading] = useState(false);

    const guardarDatos = async () => {
        if (!edad || !descripcion) {
            return Alert.alert('Faltan datos', 'Por favor completa tu edad y una descripción.');
        }
        if (parseInt(edad, 10) < 18) {
            return Alert.alert('Error', 'Debes ser mayor de 18 años.');
        }

        setLoading(true);
        try {
            const datos = {
                edad: parseInt(edad, 10),
                descripcion,
                genero: generos[idxGenero],
                preferencia: preferencias[idxPref],
                nombre: user.nombre 
            };

            const { data } = await axiosClient.put('/auth/perfil', datos);
            
            await storeData('user', JSON.stringify(data.usuario));
            
            setAuthState({
                ...authState,
                user: data.usuario
            });
            
            Alert.alert('¡Perfil Listo!', 'Bienvenido a AmigosApp');

        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'No se pudo guardar el perfil');
        }
        setLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text h3 style={styles.title}>¡Bienvenido, {user.nombre}!</Text>
            <Text style={styles.subt}>Para continuar, necesitamos conocerte un poco más.</Text>
            
            <Input 
                label="Tu Edad (Obligatorio)" 
                placeholder="Ej: 25" 
                value={edad} 
                onChangeText={setEdad} 
                keyboardType="numeric" 
            />
            
            <Input 
                label="Sobre ti (Obligatorio)" 
                placeholder="Me gusta el cine, viajar..." 
                value={descripcion} 
                onChangeText={setDescripcion} 
                multiline 
                numberOfLines={3} 
            />

            <Text style={styles.label}>Me identifico como:</Text>
            <ButtonGroup
                buttons={generos}
                selectedIndex={idxGenero}
                onPress={setIdxGenero}
                containerStyle={styles.group}
                selectedButtonStyle={styles.selectedBtnPrimary}
            />

            <Text style={styles.label}>Me interesa conocer:</Text>
            <ButtonGroup
                buttons={preferencias}
                selectedIndex={idxPref}
                onPress={setIdxPref}
                containerStyle={styles.group}
                selectedButtonStyle={styles.selectedBtnSecondary}
            />

            <Button 
                title="Completar Registro" 
                onPress={guardarDatos} 
                loading={loading} 
                containerStyle={styles.btnContainer} 
                buttonStyle={styles.btnStyle}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: 'white', flexGrow: 1, justifyContent: 'center' },
    title: { textAlign: 'center', color: '#6200EE' },
    subt: { textAlign: 'center', marginBottom: 30, color: 'gray' },
    label: { fontSize: 16, color: 'gray', marginLeft: 10, marginTop: 10, fontWeight: 'bold' },
    group: { marginBottom: 15 },
    selectedBtnPrimary: { backgroundColor: '#6200EE' },
    selectedBtnSecondary: { backgroundColor: '#03DAC6' },
    btnContainer: { marginTop: 20 },
    btnStyle: { paddingVertical: 15 }
});