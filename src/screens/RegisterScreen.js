import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Input, Button, Text, Avatar, Icon } from '@rneui/themed';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/client';

export default function RegisterScreen({ navigation }) {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [fotoLocal, setFotoLocal] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { register } = useContext(AuthContext);

    const seleccionarFoto = () => {
        const options = { mediaType: 'photo', quality: 0.5 };
        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorMessage) return;
            if (response.assets && response.assets.length > 0) {
                setFotoLocal(response.assets[0]);
            }
        });
    };

    const handleRegister = async () => {
        if(!nombre || !email || !password) {
            return Alert.alert("Faltan datos", "Por favor llena nombre, email y contraseña");
        }

        if (!fotoLocal) {
            return Alert.alert("Falta foto", "Debes subir una foto de perfil para registrarte.");
        }
        
        setLoading(true);
        let urlImagenFinal = '';

        const formData = new FormData();
        formData.append('imagen', {
            uri: fotoLocal.uri,
            type: fotoLocal.type,
            name: fotoLocal.fileName || 'perfil.jpg',
        });

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            urlImagenFinal = res.data.url;
        } catch (error) {
            setLoading(false);
            return Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
        }

        const emailLimpio = email.trim().toLowerCase();
        const success = await register(nombre, emailLimpio, password, urlImagenFinal);
        setLoading(false);
        
        if (success) {
            navigation.replace('ConfirmAccount', { email: emailLimpio });
        }
    };

    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" type="material" color="#333" size={28} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text h4 style={styles.title}>Crear Cuenta</Text>

                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={seleccionarFoto}>
                        {fotoLocal ? (
                            <Avatar size={120} rounded source={{ uri: fotoLocal.uri }} containerStyle={styles.avatarBorder} />
                        ) : (
                            <Avatar 
                                size={120} 
                                rounded 
                                icon={{ name: 'camera-alt', type: 'material', color: 'white' }} 
                                containerStyle={styles.avatarPlaceholder} 
                            />
                        )}
                        <Text style={styles.fotoText}>{fotoLocal ? 'Cambiar Foto' : 'Subir Foto (Obligatorio)'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <Input 
                        placeholder="Nombre" 
                        value={nombre} 
                        onChangeText={setNombre} 
                        inputContainerStyle={styles.inputStyle}
                        leftIcon={<Icon name="person-outline" size={20} color="gray" />}
                    />
                    <Input 
                        placeholder="Email" 
                        value={email} 
                        onChangeText={setEmail} 
                        autoCapitalize="none" 
                        inputContainerStyle={styles.inputStyle}
                        leftIcon={<Icon name="mail-outline" size={20} color="gray" />}
                    />
                    <Input 
                        placeholder="Password" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword} 
                        inputContainerStyle={styles.inputStyle}
                        leftIcon={<Icon name="lock-outline" size={20} color="gray" />}
                        rightIcon={{ 
                            type: 'material', 
                            name: showPassword ? 'visibility' : 'visibility-off',
                            color: 'gray',
                            onPress: () => setShowPassword(!showPassword) 
                        }}
                    />
                    
                    <Button 
                        title="Registrarse" 
                        onPress={handleRegister} 
                        loading={loading} 
                        buttonStyle={styles.btnRegister}
                        containerStyle={styles.btnContainer}
                    />

                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.btnCancelNative}
                    >
                        <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: 'white' },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
    backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8, backgroundColor: '#F5F6FA', borderRadius: 20 },
    title: { textAlign: 'center', marginBottom: 30, fontWeight: 'bold', color: '#333' },
    avatarContainer: { alignItems: 'center', marginBottom: 30 },
    avatarPlaceholder: { backgroundColor: '#BDBDBD' },
    avatarBorder: { borderWidth: 3, borderColor: '#F5F6FA' },
    fotoText: { marginTop: 10, color: '#6C63FF', fontWeight: '600' },
    formContainer: { width: '100%' },
    inputStyle: { backgroundColor: '#F5F6FA', borderRadius: 15, paddingHorizontal: 10, borderBottomWidth: 0 },
    btnContainer: { marginTop: 20, borderRadius: 30 },
    btnRegister: { backgroundColor: '#6C63FF', paddingVertical: 14, borderRadius: 30, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    btnCancelNative: { marginTop: 15, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    btnCancelText: { color: '#555', fontSize: 16, fontWeight: 'bold' }
});