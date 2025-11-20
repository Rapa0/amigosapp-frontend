import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, 
    Image, ActivityIndicator, Modal, TextInput, StatusBar, Text
} from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
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
    const cargarHistorial = async () => {
        try {
            const res = await axiosClient.get(`/app/mensajes/${usuario._id}`);
            setMensajes(res.data);
        } catch (error) {
            console.log("Error cargando historial", error);
        }
    };
    cargarHistorial();

    socketRef.current = io(SOCKET_URL, {
        transports: ['websocket'],
        jsonp: false
    });

    socketRef.current.emit('entrar_chat', authState.user._id);

    socketRef.current.on('nuevo_mensaje', (mensaje) => {
        const esDeEsteChat = 
            (mensaje.remitente === usuario._id && mensaje.receptor === authState.user._id) ||
            (mensaje.remitente === authState.user._id && mensaje.receptor === usuario._id);

        if (esDeEsteChat) {
            setMensajes(prev => [...prev, mensaje]);
        }
    });

    return () => {
        if (socketRef.current) socketRef.current.disconnect();
    };
  }, [usuario._id, authState.user._id]);

  useEffect(() => {
    if (flatListRef.current && mensajes.length > 0) {
      setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
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
          console.log('Error foto chat:', error);
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
        <View style={[
            styles.messageRow, 
            esMio ? styles.rowMio : styles.rowOtro
        ]}>
            {!esMio && (
                 <Avatar 
                    source={{ uri: usuario.imagen }} 
                    rounded 
                    size={28} 
                    containerStyle={styles.avatarMsg} 
                 />
            )}

            <View style={[
                styles.burbuja, 
                esMio ? styles.burbujaMia : styles.burbujaOtro,
                item.tipo === 'imagen' && styles.burbujaImagen
            ]}>
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
        </View>
      );
  };

  return (
    <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="chevron-left" type="feather" size={32} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.userInfoArea} 
                onPress={() => navigation.navigate('ChatDetails', { usuario })}
            >
                <Avatar source={{ uri: usuario.imagen }} rounded size={40} />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.userName}>{usuario.nombre}</Text>
                    <Text style={styles.userStatus}>Tocame para ver info</Text>
                </View>
            </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined} 
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={mensajes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.inputWrapper}>
                <TouchableOpacity onPress={seleccionarFoto} style={styles.attachButton}>
                    <Icon name="image" type="feather" color="#6C63FF" size={24} />
                </TouchableOpacity>

                <View style={styles.textInputContainer}>
                    <TextInput 
                        placeholder="Escribe un mensaje..." 
                        value={nuevoMensaje}
                        onChangeText={setNuevoMensaje}
                        style={styles.textInput}
                        placeholderTextColor="#999"
                        multiline
                    />
                </View>
                
                <TouchableOpacity 
                    onPress={enviarTexto} 
                    style={[styles.sendButton, nuevoMensaje.trim() ? styles.sendActive : styles.sendInactive]}
                    disabled={!nuevoMensaje.trim()}
                >
                    <Icon name="send" type="feather" color="white" size={20} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

        <Modal visible={!!imagenSeleccionada} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <View style={styles.previewCard}>
                    <Text style={styles.previewHeader}>Enviar Foto</Text>
                    {imagenSeleccionada && (
                        <Image source={{ uri: imagenSeleccionada.uri }} style={styles.previewImage} />
                    )}
                    <TextInput 
                        placeholder="Añadir comentario..."
                        value={comentarioImagen}
                        onChangeText={setComentarioImagen}
                        style={styles.previewInput}
                        placeholderTextColor="#999"
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setImagenSeleccionada(null)}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.confirmButton} 
                            onPress={confirmarEnvioFoto}
                            disabled={subiendoFoto}
                        >
                            {subiendoFoto ? <ActivityIndicator color="white" /> : <Text style={styles.confirmText}>Enviar</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <Modal visible={!!imagenFullScreen} transparent={true} animationType="fade">
            <View style={styles.fsContainer}>
                <TouchableOpacity style={styles.fsClose} onPress={() => setImagenFullScreen(null)}>
                    <Icon name="x" type="feather" color="white" size={30} />
                </TouchableOpacity>
                {imagenFullScreen && (
                    <Image source={{ uri: imagenFullScreen }} style={styles.fsImage} resizeMode="contain" />
                )}
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
    mainContainer: { 
        flex: 1, 
        backgroundColor: '#F5F6FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
    },
    keyboardAvoid: {
        flex: 1
    },
    
    headerContainer: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10,
        backgroundColor: 'white', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width:0, height:2}
    },
    backButton: { padding: 5 },
    userInfoArea: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
    headerTextContainer: { marginLeft: 10 },
    userName: { fontSize: 17, fontWeight: 'bold', color: '#333' },
    userStatus: { fontSize: 12, color: '#6C63FF' },

    messagesList: { paddingHorizontal: 15, paddingBottom: 20, paddingTop: 20, flexGrow: 1 },
    messageRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '80%' },
    rowMio: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
    rowOtro: { alignSelf: 'flex-start', justifyContent: 'flex-start' },
    
    avatarMsg: { marginRight: 8, alignSelf: 'flex-end' },

    burbuja: { padding: 12, borderRadius: 20 },
    burbujaMia: { 
        backgroundColor: '#6C63FF', 
        borderBottomRightRadius: 4 
    },
    burbujaOtro: { 
        backgroundColor: 'white', 
        borderBottomLeftRadius: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    burbujaImagen: { padding: 5, borderRadius: 15 },
    
    textoMio: { color: 'white', fontSize: 16 },
    textoOtro: { color: '#333', fontSize: 16 },
    imagenChat: { width: 200, height: 200, borderRadius: 10 },

    inputWrapper: {
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingTop: 10,
        paddingHorizontal: 10,
        paddingBottom: 40, // 20 a 40
        backgroundColor: 'white', 
        borderTopWidth: 1, 
        borderTopColor: '#eee'
    },
    attachButton: { padding: 10 },
    textInputContainer: {
        flex: 1, backgroundColor: '#F0F2F5', borderRadius: 25, 
        paddingHorizontal: 15, marginHorizontal: 5, minHeight: 45, justifyContent: 'center'
    },
    textInput: { fontSize: 16, color: '#333', maxHeight: 100 },
    sendButton: { 
        width: 45, height: 45, borderRadius: 22.5, 
        justifyContent: 'center', alignItems: 'center', marginLeft: 5 
    },
    sendActive: { backgroundColor: '#6C63FF', elevation: 2 },
    sendInactive: { backgroundColor: '#E0E0E0' },

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    previewCard: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 10 },
    previewHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    previewImage: { width: '100%', height: 250, borderRadius: 15, marginBottom: 15 },
    previewInput: { width: '100%', backgroundColor: '#F5F6FA', borderRadius: 10, padding: 10, marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' },
    cancelText: { color: '#FF5864', fontWeight: 'bold', fontSize: 16, padding: 10 },
    confirmButton: { backgroundColor: '#6C63FF', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20 },
    confirmText: { color: 'white', fontWeight: 'bold' },

    fsContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
    fsImage: { width: '100%', height: '100%' },
    fsClose: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 }
});