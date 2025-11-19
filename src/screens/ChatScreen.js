import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, 
    Image, ActivityIndicator, Modal, TextInput, StatusBar 
} from 'react-native';
import { Icon, Avatar, Text } from '@rneui/themed';
import io from 'socket.io-client';
import { launchImageLibrary } from 'react-native-image-picker';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const SOCKET_URL = 'https://amigosapp-backend.onrender.com'; 

export default function ChatScreen({ route, navigation }) {
  const { usuario } = route.params;
  const { authState } = useContext(AuthContext);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [comentarioImagen, setComentarioImagen] = useState('');
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  
  const [imagenFullScreen, setImagenFullScreen] = useState(null);

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

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [mensajes]);

  const enviarTexto = () => {
    if (nuevoMensaje.trim() === '') return;
    emitirMensaje(nuevoMensaje, 'texto');
    setNuevoMensaje('');
  };

  const seleccionarFoto = () => {
    const options = { mediaType: 'photo', quality: 0.7 };
    launchImageLibrary(options, (response) => {
        if (response.didCancel || !response.assets) return;
        setImagenSeleccionada(response.assets[0]);
        setComentarioImagen('');
    });
  };

  const confirmarEnvioFoto = async () => {
      if (!imagenSeleccionada) return;
      setSubiendoFoto(true);

      const formData = new FormData();
      formData.append('imagen', {
          uri: imagenSeleccionada.uri,
          type: imagenSeleccionada.type,
          name: imagenSeleccionada.fileName || 'chat_img.jpg',
      });

      try {
          const res = await axiosClient.post('/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          emitirMensaje(res.data.url, 'imagen');

          if (comentarioImagen.trim().length > 0) {
              emitirMensaje(comentarioImagen, 'texto');
          }

          setImagenSeleccionada(null);
          setComentarioImagen('');

      } catch (error) {
          console.log(error);
      }
      setSubiendoFoto(false);
  };

  const emitirMensaje = (contenido, tipo) => {
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
                <TouchableOpacity onPress={() => setImagenFullScreen(item.mensaje)}>
                    <Image 
                        source={{ uri: item.mensaje }} 
                        style={styles.imagenChat} 
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            ) : (
                <Text style={esMio ? styles.textoMio : styles.textoOtro}>{item.mensaje}</Text>
            )}
        </View>
      );
  };

  return (
    <View style={styles.outerContainer}>
        <View style={styles.customHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" color="#333" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.headerProfile} 
                onPress={() => navigation.navigate('ChatDetails', { usuario })}
            >
                <Avatar source={{ uri: usuario.imagen }} rounded size={35} />
                <Text style={styles.headerName}>{usuario.nombre}</Text>
            </TouchableOpacity>

            <View style={styles.headerSpacer} /> 
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.keyboardAvoidingContainer} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} 
        >
            <FlatList
                ref={flatListRef}
                data={mensajes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.flatListContent}
            />
            
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={seleccionarFoto} style={styles.iconButton}>
                    <Icon name="camera-alt" type="material" color="gray" size={24} />
                </TouchableOpacity>

                <TextInput 
                    placeholder="Mensaje..." 
                    value={nuevoMensaje}
                    onChangeText={setNuevoMensaje}
                    style={styles.textInput}
                    placeholderTextColor="#999"
                />
                
                <TouchableOpacity onPress={enviarTexto} style={styles.iconButton}>
                    <Icon name="send" type="material" color="#6200EE" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

        <Modal visible={!!imagenSeleccionada} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>Enviar Imagen</Text>
                    {imagenSeleccionada && (
                        <Image source={{ uri: imagenSeleccionada.uri }} style={styles.previewImage} />
                    )}
                    
                    <TextInput 
                        placeholder="Escribe un comentario (opcional)..."
                        value={comentarioImagen}
                        onChangeText={setComentarioImagen}
                        style={styles.previewInput}
                        placeholderTextColor="#999"
                    />

                    <View style={styles.previewButtons}>
                        <TouchableOpacity onPress={() => setImagenSeleccionada(null)} style={styles.btnCancel}>
                            <Text style={styles.textCancel}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={confirmarEnvioFoto} 
                            style={styles.btnSend}
                            disabled={subiendoFoto}
                        >
                            {subiendoFoto ? <ActivityIndicator color="white" /> : <Text style={styles.textSend}>Enviar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <Modal visible={!!imagenFullScreen} transparent={true} animationType="fade">
            <View style={styles.fullScreenContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setImagenFullScreen(null)}>
                    <Icon name="close" color="white" size={30} />
                </TouchableOpacity>
                {imagenFullScreen && (
                    <Image source={{ uri: imagenFullScreen }} style={styles.fullScreenImage} resizeMode="contain" />
                )}
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    outerContainer: { 
        flex: 1, 
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    
    customHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white',
    },
    headerProfile: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    headerName: { marginLeft: 10, fontSize: 18, fontWeight: 'bold', color: '#333' },
    backButton: { padding: 10 },
    headerSpacer: { width: 40 },

    keyboardAvoidingContainer: {
        flex: 1, 
    },

    burbuja: { margin: 10, padding: 10, borderRadius: 15, maxWidth: '75%' },
    burbujaMia: { alignSelf: 'flex-end', backgroundColor: '#6200EE', borderBottomRightRadius: 2 },
    burbujaOtro: { alignSelf: 'flex-start', backgroundColor: 'white', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#eee' },
    textoMio: { color: 'white', fontSize: 16 },
    textoOtro: { color: '#333', fontSize: 16 },
    imagenChat: { width: 200, height: 200, borderRadius: 10 },

    inputContainer: { 
        flexDirection: 'row', padding: 10, backgroundColor: 'white', alignItems: 'center', 
        borderTopWidth: 1, borderTopColor: '#eee' 
    },
    textInput: {
        flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 15,
        paddingVertical: 8, marginHorizontal: 10, color: '#333', fontSize: 16
    },
    iconButton: { padding: 5 },
    flatListContent: { paddingVertical: 10 }, 

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    previewBox: { width: '85%', backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 10 },
    previewTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    previewImage: { width: '100%', height: 250, borderRadius: 10, resizeMode: 'cover', marginBottom: 15 },
    previewInput: { width: '100%', borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 20, paddingVertical: 5, fontSize: 16 },
    previewButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
    btnCancel: { padding: 10 },
    btnSend: { backgroundColor: '#6200EE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    textCancel: { color: 'red' },
    textSend: { color: 'white', fontWeight: 'bold' },

    fullScreenContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
    fullScreenImage: { width: '100%', height: '100%' },
    closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5 }
});