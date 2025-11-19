import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import axiosClient from '../api/client';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const enviarCodigo = async () => {
        if(!email) return Alert.alert('Error', 'Ingresa tu email');
        setLoading(true);
        try {
            const { data } = await axiosClient.post('/auth/olvide-password', { email });
            Alert.alert('Aviso', data.msg, [
                { text: 'OK', onPress: () => navigation.navigate('VerifyToken', { email }) }
            ]);
            
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Hubo un error');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.desc}>Ingresa tu correo para buscar tu cuenta.</Text>
            <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <Button title="Enviar" onPress={enviarCodigo} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'white' },
    title: { textAlign: 'center', marginBottom: 10 },
    desc: { textAlign: 'center', marginBottom: 20, color: 'gray' }
});