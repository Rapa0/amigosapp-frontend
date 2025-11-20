import React, { useState, useRef, useContext, useCallback } from 'react';
import { 
    View, StyleSheet, Text, Image, ActivityIndicator, Dimensions, 
    TouchableOpacity, Alert, Modal, TextInput, TouchableWithoutFeedback, Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Icon, Button } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

const CardItem = ({ card, onPressImage, onOpenInfo }) => {
    const [indiceFoto, setIndiceFoto] = useState(0);
    const todasLasFotos = [card.imagen, ...(card.galeria || [])].filter(Boolean);
    const fotoAMostrar = todasLasFotos[indiceFoto] || 'https://via.placeholder.com/300';

    const cambiarFoto = (evento) => {
        const toqueX = evento.nativeEvent.locationX;
        if (toqueX > CARD_WIDTH / 2) {
            setIndiceFoto((prev) => (prev + 1) % todasLasFotos.length);
        } else {
            setIndiceFoto((prev) => (prev - 1 + todasLasFotos.length) % todasLasFotos.length);
        }
    };

    return (
        <View style={styles.card}>
            <Pressable style={styles.imageContainer} onPress={cambiarFoto}>
                <Image source={{ uri: fotoAMostrar }} style={styles.image} />
                
                {todasLasFotos.length > 1 && (
                    <View style={styles.indicatorContainer}>
                        {todasLasFotos.map((_, i) => (
                            <View key={i} style={[styles.barrita, i === indiceFoto ? styles.barritaActiva : null]} />
                        ))}
                    </View>
                )}
            </Pressable>

            <View style={styles.infoContainer}>
                <View style={styles.textWrapper}>
                    <Text style={styles.name}>{card.nombre}, {card.edad}</Text>
                    <Text numberOfLines={2} style={styles.desc}>{card.descripcion}</Text>
                </View>
                <Icon name="info" type="feather" color="gray" size={24} />
            </View>
        </View>
    );
};
// ---------------------------------------------------------

export default function FindFriendsScreen({ navigation }) {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const { logout } = useContext(AuthContext);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeDirecto, setMensajeDirecto] = useState('');
  const [candidatoActualSuperLike, setCandidatoActualSuperLike] = useState(null);
  const [enviandoSuperLike, setEnviandoSuperLike] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarCandidatos();
    }, [])
  );

  const cargarCandidatos = async () => {
    try {
      const res = await axiosClient.get('/app/candidatos');
      setCandidatos(res.data);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const reiniciarYRecargar = async () => {
      setLoading(true);
      try {
          await axiosClient.post('/app/reiniciar');
          await cargarCandidatos();
      } catch (error) {
          Alert.alert("Error", "No se pudo recargar");
          setLoading(false);
      }
  };

  const onSwipedRight = async (cardIndex) => {
    if (!candidatos[cardIndex]) return;
    const persona = candidatos[cardIndex];
    try { await axiosClient.post('/app/like', { idCandidato: persona._id }); } 
    catch (e) { console.log(e); }
  };

  const onSwipedAllCards = () => {
      setCandidatos([]); 
  };

  const abrirModalMensajeDirecto = (persona) => {
      if (!persona) return;
      setCandidatoActualSuperLike(persona);
      setMensajeDirecto('');
      setModalVisible(true);
  };

  const enviarSuperLikeConMensaje = async () => {
      if (!candidatoActualSuperLike) return;
      
      if (mensajeDirecto.trim().length === 0) {
          return Alert.alert("Escribe algo", "El mensaje no puede estar vacío.");
      }

      setEnviandoSuperLike(true);
      try {
          await axiosClient.post('/app/superlike', { 
              idCandidato: candidatoActualSuperLike._id, 
              mensaje: mensajeDirecto 
          });
          
          setModalVisible(false); 
          setTimeout(() => {
              swiperRef.current.swipeRight(); 
              Alert.alert("¡Enviado!", `Le has enviado un Super Like a ${candidatoActualSuperLike.nombre}.`);
          }, 300);
          
      } catch (e) {
          Alert.alert("Error", "No se pudo enviar el Super Like.");
      } finally {
          setEnviandoSuperLike(false);
          setMensajeDirecto('');
          setCandidatoActualSuperLike(null);
      }
  };

  if (loading) return <ActivityIndicator size="large" color="#6200EE" style={styles.center} />;

  return (
    <View style={styles.container}>
      {candidatos.length > 0 ? (
        <>
            <View style={styles.deckContainer}>
                <Swiper
                    ref={swiperRef}
                    cards={candidatos}
                    renderCard={(card) => {
                        if (!card) return null;
                        return <CardItem card={card} />;
                    }}
                    onSwipedRight={onSwipedRight}
                    onSwipedAll={onSwipedAllCards}
                    cardIndex={0}
                    backgroundColor={'transparent'}
                    stackSize={2}
                    cardVerticalMargin={0}
                    cardHorizontalMargin={0}
                    containerStyle={styles.swiperContainerInner}
                    animateCardOpacity
                    overlayLabels={{
                        left: {
                            title: 'NOPE',
                            style: {
                                label: { borderColor: '#FF5864', color: '#FF5864', borderWidth: 5, fontSize: 32, borderRadius: 10 },
                                wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 20, marginLeft: -20 }
                            }
                        },
                        right: {
                            title: 'LIKE',
                            style: {
                                label: { borderColor: '#4FCC94', color: '#4FCC94', borderWidth: 5, fontSize: 32, borderRadius: 10 },
                                wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 20, marginLeft: 20 }
                            }
                        }
                    }}
                />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.roundButton, styles.btnNope]} onPress={() => swiperRef.current.swipeLeft()}>
                    <Icon name="close" type="material" color="#FF5864" size={35} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.roundButton, styles.btnSuper]} onPress={() => abrirModalMensajeDirecto(candidatos[0])}>
                    <Icon name="star" type="material" color="#3AB4CC" size={25} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.roundButton, styles.btnLike]} onPress={() => swiperRef.current.swipeRight()}>
                    <Icon name="favorite" type="material" color="#4FCC94" size={35} />
                </TouchableOpacity>
            </View>
        </>
      ) : (
        <View style={styles.center}>
            <Text>No hay más personas cerca.</Text>
            <Button title="Recargar Perfiles" onPress={reiniciarYRecargar} type="clear" />
            <Button title="Cerrar Sesión" onPress={logout} buttonStyle={styles.logoutBtn} />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
        >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalBackground}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContainer}>
                            
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Super Like a {candidatoActualSuperLike?.nombre}</Text>
                                <Text style={styles.modalSubtitle}>¡Destaca con un mensaje!</Text>
                            </View>

                            <TextInput
                                style={styles.textInput}
                                placeholder="Escribe algo interesante..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={mensajeDirecto}
                                onChangeText={setMensajeDirecto}
                                maxLength={140}
                                autoFocus={true}
                            />
                            <Text style={styles.charCount}>{mensajeDirecto.length}/140</Text>

                            <View style={styles.modalButtonsRow}>
                                <TouchableOpacity 
                                    style={styles.btnCancel} 
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.btnCancelText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.btnSend, mensajeDirecto.trim() === '' && styles.btnSendDisabled]} 
                                    onPress={enviarSuperLikeConMensaje}
                                    disabled={mensajeDirecto.trim() === '' || enviandoSuperLike}
                                >
                                    {enviandoSuperLike ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.btnSendText}>ENVIAR</Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  deckContainer: { 
      height: SCREEN_HEIGHT * 0.70, 
      width: SCREEN_WIDTH,
      marginTop: SCREEN_HEIGHT * 0.12, 
      zIndex: 1 
  },
  swiperContainerInner: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center' 
  },

  card: {
    height: SCREEN_HEIGHT * 0.65, 
    width: CARD_WIDTH,   
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    overflow: 'hidden'
  },
  
  imageContainer: {
    width: '100%',
    height: '78%',
    position: 'relative'
  },
  image: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  
  indicatorContainer: {
      position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between'
  },
  barrita: { flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.4)', marginHorizontal: 2, borderRadius: 2 },
  barritaActiva: { backgroundColor: 'white' },

  infoContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 5 },
  textWrapper: { flex: 1 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 15, color: 'gray', marginTop: 4 },

  buttonsContainer: {
      position: 'absolute', 
      bottom: SCREEN_HEIGHT * 0.04, 
      left: 0, right: 0,
      flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
      height: 100, zIndex: 2 
  },
  roundButton: {
      width: 65, height: 65, borderRadius: 35, backgroundColor: 'white',
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, elevation: 5
  },
  btnNope: { borderWidth: 1, borderColor: 'white' }, 
  btnSuper: { width: 50, height: 50, borderRadius: 25, marginTop: -10, elevation: 3 },
  btnLike: { borderWidth: 1, borderColor: 'white' },
  logoutBtn: { backgroundColor: 'red', marginTop: 20 },

  modalOverlay: { flex: 1 },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10
  },
  modalHeader: { marginBottom: 15, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#3AB4CC' },
  modalSubtitle: { fontSize: 14, color: 'gray' },
  
  textInput: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333'
  },
  charCount: { alignSelf: 'flex-end', color: '#aaa', fontSize: 12, marginTop: 5, marginBottom: 20 },

  modalButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  
  btnCancel: { padding: 15 },
  btnCancelText: { color: '#aaa', fontWeight: 'bold' },

  btnSend: { 
    backgroundColor: '#3AB4CC', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 25,
    elevation: 2
  },
  btnSendDisabled: { backgroundColor: '#b0e0e6' }, 
  btnSendText: { color: 'white', fontWeight: 'bold' }
});