import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import axiosClient from '../api/client';

export default function NewPasswordScreen({ route, navigation }) {
    const { email, token } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass1, setShowPass1] = useState(false);
    const [showPass2, setShowPass2] = useState(false);

    const guardarPassword = async () => {
        if(password.length < 6) {
            return Alert.alert('Error', 'La contraseña debe tener mínimo 6 caracteres');
        }
        if(password !== confirmPassword) {
            return Alert.alert('Error', 'Las contraseñas no coinciden');
        }

        setLoading(true);
        try {
            await axiosClient.post('/auth/nuevo-password', { email, token, password });
            Alert.alert('Éxito', 'Contraseña restablecida. Inicia sesión ahora.', [
                { text: 'OK', onPress: () => navigation.popToTop() }
            ]);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Error al guardar');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Nueva Contraseña</Text>
            
            <Input 
                placeholder="Nueva Contraseña (Min 6)" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={!showPass1}
                rightIcon={{ 
                    type: 'material', 
                    name: showPass1 ? 'visibility' : 'visibility-off',
                    onPress: () => setShowPass1(!showPass1) 
                }}
            />
            
            <Input 
                placeholder="Confirmar Contraseña" 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry={!showPass2}
                rightIcon={{ 
                    type: 'material', 
                    name: showPass2 ? 'visibility' : 'visibility-off',
                    onPress: () => setShowPass2(!showPass2) 
                }}
            />
            
            <Button title="Restablecer Password" onPress={guardarPassword} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'white' },
    title: { textAlign: 'center', marginBottom: 20 }
});