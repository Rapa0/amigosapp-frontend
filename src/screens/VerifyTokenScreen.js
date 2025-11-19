import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import axiosClient from '../api/client';

export default function VerifyTokenScreen({ route, navigation }) {
    const { email } = route.params;
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    const verificar = async () => {
        if(token.length < 6) return Alert.alert('Error', 'El código debe ser de 6 caracteres');
        setLoading(true);
        try {
            await axiosClient.post('/auth/comprobar-token', { email, token });
            navigation.navigate('NewPassword', { email, token });
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Código incorrecto');
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Verificar Código</Text>
            <Text style={styles.desc}>Ingresa el código de 6 caracteres enviado a {email}</Text>
            <Input 
                placeholder="Código (ej: A1B2C3)" 
                value={token} 
                onChangeText={t => setToken(t.toUpperCase())} 
                maxLength={6}
                textAlign="center"
                style={styles.inputToken}
            />
            <Button title="Verificar" onPress={verificar} loading={loading} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'white' },
    title: { textAlign: 'center', marginBottom: 10 },
    desc: { textAlign: 'center', marginBottom: 20, color: 'gray' },
    inputToken: { fontSize: 24, letterSpacing: 5 }
});