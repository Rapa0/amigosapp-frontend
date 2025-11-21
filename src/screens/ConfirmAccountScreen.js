import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Text, Icon } from '@rneui/themed';
import axiosClient from '../api/client';

export default function ConfirmAccountScreen({ route, navigation }) {
    const { email } = route.params;
    const [codigo, setCodigo] = useState('');
    const [loading, setLoading] = useState(false);

    const verificarCodigo = async () => {
        const codigoLimpio = codigo.replace(/[^0-9]/g, '').substring(0, 6);

        if (codigoLimpio.length < 6) return Alert.alert("Error", "Ingresa los 6 números");
        
        setLoading(true);
        try {
            await axiosClient.post('/auth/verificar', { 
                email: email, 
                codigo: codigoLimpio 
            });
            
            Alert.alert("¡Éxito!", "Cuenta verificada.", [
                { text: "Ir al Login", onPress: () => navigation.navigate('Login') }
            ]);

        } catch (error) {
            console.log(error.response?.data);
            Alert.alert("Error", error.response?.data?.msg || "Código incorrecto");
        }
        setLoading(false);
    };

    return (
        <View style={styles.background}>
            <View style={styles.circleOne} />
            <View style={styles.circleTwo} />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
                
                <View style={styles.headerContainer}>
                    <Icon name="mark-email-read" type="material" size={60} color="#6C63FF" />
                    <Text h2 style={styles.title}>Verificar Correo</Text>
                    <Text style={styles.subtitle}>Enviado a: {email}</Text>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        placeholder="Ingresa el código" 
                        value={codigo} 
                        onChangeText={t => setCodigo(t.replace(/[^0-9]/g, ''))} 
                        maxLength={6}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        textAlign="center"
                        inputContainerStyle={styles.inputStyle}
                        inputStyle={styles.inputText} 
                    />
                    
                    <Button 
                        title="VERIFICAR" 
                        onPress={verificarCodigo} 
                        loading={loading}
                        containerStyle={styles.btnContainer}
                        buttonStyle={styles.btnVerify} 
                    />

                    <Button 
                        title="Cancelar" 
                        type="clear"
                        onPress={() => navigation.navigate('Login')} 
                        titleStyle={styles.btnCancelTitle}
                        containerStyle={styles.btnCancelContainer}
                    />
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: 'white' },
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
    
    circleOne: { position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6C63FF', opacity: 0.1 },
    circleTwo: { position: 'absolute', bottom: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#FF6584', opacity: 0.1 },

    headerContainer: { alignItems: 'center', marginBottom: 40 },
    title: { fontWeight: 'bold', color: '#333', marginTop: 10 },
    subtitle: { color: 'gray', fontSize: 14, marginTop: 5 },

    formContainer: { width: '100%' },
    
    inputStyle: { 
        backgroundColor: '#F5F6FA', 
        borderRadius: 15, 
        paddingHorizontal: 10, 
        borderBottomWidth: 0, 
        height: 60 
    },
    inputText: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#333',
    },
    
    btnContainer: { marginTop: 20, borderRadius: 30, shadowColor: '#6C63FF', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
    btnVerify: { backgroundColor: '#6C63FF', paddingVertical: 14 },
    
    btnCancelTitle: { color: 'gray' },
    btnCancelContainer: { marginTop: 10 }
});