import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Input, Button, Text, Avatar } from '@rneui/themed';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/client';

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [fotoLocal, setFotoLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  const seleccionarFoto = () => {
    const options = {
        mediaType: 'photo',
        quality: 0.5,
    };

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
        console.log('Error subiendo imagen:', error);
        setLoading(false);
        return Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
    }

    const success = await register(nombre, email, password, urlImagenFinal);
    setLoading(false);
    
    if (success) navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>Crear Cuenta</Text>

      <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={seleccionarFoto}>
            {fotoLocal ? (
                <Avatar size="xlarge" rounded source={{ uri: fotoLocal.uri }} />
            ) : (
                <Avatar 
                    size="xlarge" 
                    rounded 
                    icon={{ name: 'camera', type: 'font-awesome' }} 
                    containerStyle={styles.avatarPlaceholder} 
                />
            )}
            <Text style={styles.fotoText}>{fotoLocal ? 'Cambiar Foto' : 'Subir Foto (Obligatorio)'}</Text>
          </TouchableOpacity>
      </View>

      <Input placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      
      <Button title="Registrarse" onPress={handleRegister} loading={loading} containerStyle={styles.btn} />
      <Button title="Cancelar" type="clear" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  title: { textAlign: 'center', marginBottom: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  fotoText: { marginTop: 5, color: '#2089dc', fontWeight: 'bold' },
  btn: { marginTop: 10 },
  avatarPlaceholder: { backgroundColor: 'gray' }
});