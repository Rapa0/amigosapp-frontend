import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Input, Icon, Text } from '@rneui/themed';
import io from 'socket.io-client';
import { launchImageLibrary } from 'react-native-image-picker';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const SOCKET_URL = 'http://192.168.10.113:4000'; 

export default function ChatScreen({ route }) {
  const { usuario } = route.params;
  const { authState } = useContext(AuthContext);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    axiosClient.get(`/app/mensajes/${usuario._id}`).then(res => setMensajes(res.data));

    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('entrar_chat', authState.user._id);

    socketRef.current.on('nuevo_mensaje', (mensaje) => {
        if (mensaje.remitente === usuario._id || mensaje.remitente === authState.user._id) {
            setMensajes(prev => [...prev, mensaje]);
        }
    });

    return () => socketRef.current.disconnect();
  }, [usuario._id, authState.user._id]);

  const enviarTexto = () => {
    if (nuevoMensaje.trim() === '') return;
    enviarSocket(nuevoMensaje, 'texto');
    setNuevoMensaje('');
  };

  const seleccionarYEnviarFoto = () => {
    const options = { mediaType: 'photo', quality: 0.5 };
    launchImageLibrary(options, async (response) => {
        if (response.didCancel || !response.assets) return;
        
        setSubiendoFoto(true);
        const foto = response.assets[0];
        const formData = new FormData();
        formData.append('imagen', {
            uri: foto.uri,
            type: foto.type,
            name: foto.fileName || 'chat_img.jpg',
        });

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            enviarSocket(res.data.url, 'imagen');
        } catch (error) {
            console.log('Error foto chat:', error);
        }
        setSubiendoFoto(false);
    });
  };

  const enviarSocket = (contenido, tipo) => {
      const payload = {
          remitente: authState.user._id,
          receptor: usuario._id,
          mensaje: contenido,
          tipo: tipo
      };
      socketRef.current.emit('enviar_mensaje', payload);
  };

  const renderItem = ({ item }) => {
      const esMio = item.remitente === authState.user._id;
      
      return (
        <View style={[styles.burbuja, esMio ? styles.burbujaMia : styles.burbujaOtro]}>
            {item.tipo === 'imagen' ? (
                <Image 
                    source={{ uri: item.mensaje }} 
                    style={styles.imagenChat} 
                    resizeMode="cover"
                />
            ) : (
                <Text style={esMio ? styles.textoMio : styles.textoOtro}>{item.mensaje}</Text>
            )}
        </View>
      );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.header}>
            <Text h4>{usuario.nombre}</Text>
        </View>

        <FlatList
            data={mensajes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
        />
        
        {subiendoFoto && <ActivityIndicator size="large" color="#6200EE" />}

        <View style={styles.inputContainer}>
            <TouchableOpacity onPress={seleccionarYEnviarFoto} style={styles.iconButton}>
                <Icon name="camera-alt" type="material" color="gray" size={24} />
            </TouchableOpacity>

            <Input 
                placeholder="Mensaje..." 
                value={nuevoMensaje}
                onChangeText={setNuevoMensaje}
                containerStyle={styles.inputTextContainer}
                inputContainerStyle={styles.inputSinBorde} 
            />
            
            <TouchableOpacity onPress={enviarTexto}>
                <Icon name="send" type="material" color="#6200EE" reverse size={20} />
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 15, backgroundColor: 'white', elevation: 2, alignItems: 'center' },
    burbuja: { margin: 10, padding: 10, borderRadius: 10, maxWidth: '80%' },
    burbujaMia: { alignSelf: 'flex-end', backgroundColor: '#6200EE' },
    burbujaOtro: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
    textoMio: { color: 'white' },
    textoOtro: { color: 'black' },
    imagenChat: { width: 200, height: 200, borderRadius: 10 },
    inputContainer: { flexDirection: 'row', padding: 5, backgroundColor: 'white', alignItems: 'center' },
    inputTextContainer: { flex: 1 },
    iconButton: { padding: 10 },
    inputSinBorde: { borderBottomWidth: 0 } 
});