import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
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
            <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" type="material" color="#333" size={28} />
            </TouchableOpacity>

            <Text h3 style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.desc}>Ingresa tu correo para buscar tu cuenta.</Text>
            
            <Input 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                inputContainerStyle={styles.inputStyle}
                leftIcon={<Icon name="email" type="material" color="gray" size={20} />}
            />
            
            <Button 
                title="Enviar" 
                onPress={enviarCodigo} 
                loading={loading} 
                buttonStyle={styles.btnSend}
                containerStyle={styles.btnContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: 'center', 
        backgroundColor: 'white' 
    },
    btnBack: {
        position: 'absolute',
        top: 50, 
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F5F6FA' 
    },
    title: { 
        textAlign: 'center', 
        marginBottom: 10, 
        fontWeight: 'bold', 
        color: '#333' 
    },
    desc: { 
        textAlign: 'center', 
        marginBottom: 40, 
        color: 'gray', 
        fontSize: 16 
    },
    inputStyle: {
        backgroundColor: '#F5F6FA', 
        borderRadius: 15, 
        paddingHorizontal: 10, 
        borderBottomWidth: 0
    },
    btnSend: {
        backgroundColor: '#6C63FF',
        borderRadius: 30,
        paddingVertical: 14
    },
    btnContainer: {
        marginTop: 20,
        borderRadius: 30,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    }
});