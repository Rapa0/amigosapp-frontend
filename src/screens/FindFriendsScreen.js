import React, { useState, useRef, useContext, useCallback } from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    ActivityIndicator, 
    Dimensions, 
    TouchableOpacity, 
    Alert,
    Modal, 
    TextInput, 
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Icon, Button } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import PhotoGalleryViewer from '../components/PhotoGalleryViewer';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

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

  if (loading) return (
      <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Buscando personas cercanas...</Text>
      </View>
  );

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
                        
                        return (
                            <View style={styles.card}>
                                <PhotoGalleryViewer 
                                    user={card} 
                                    height={'75%'} 
                                    imageStyle={styles.cardTopRadius}
                                    style={styles.cardTopRadius}
                                />

                                <View style={styles.infoContainer}>
                                    <View style={styles.textWrapper}>
                                        <Text style={styles.name}>{card.nombre}, {card.edad}</Text>
                                        <Text numberOfLines={2} style={styles.desc}>{card.descripcion}</Text>
                                    </View>
                                    <View style={styles.iconInfo}>
                                        <Icon name="info" type="feather" color="#6C63FF" size={20} />
                                    </View>
                                </View>
                            </View>
                        );
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
                                label: { borderColor: '#FF5864', color: '#FF5864', borderWidth: 4, fontSize: 24, borderRadius: 10 },
                                wrapper: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-start', marginTop: 20, marginLeft: -20 }
                            }
                        },
                        right: {
                            title: 'LIKE',
                            style: {
                                label: { borderColor: '#4FCC94', color: '#4FCC94', borderWidth: 4, fontSize: 24, borderRadius: 10 },
                                wrapper: { flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', marginTop: 20, marginLeft: 20 }
                            }
                        }
                    }}
                />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={[styles.roundButton, styles.btnNope]} onPress={() => swiperRef.current.swipeLeft()}>
                    <Icon name="close" type="material" color="#FF5864" size={30} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.roundButton, styles.btnSuper]} onPress={() => abrirModalMensajeDirecto(candidatos[0])}>
                    <Icon name="star" type="material" color="#3AB4CC" size={22} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.roundButton, styles.btnLike]} onPress={() => swiperRef.current.swipeRight()}>
                    <Icon name="favorite" type="material" color="#4FCC94" size={30} />
                </TouchableOpacity>
            </View>
        </>
      ) : (
        <View style={styles.center}>
            <View style={styles.emptyIconBg}>
                <Icon name="search" type="feather" size={50} color="#6C63FF" />
            </View>
            <Text style={styles.emptyTitle}>¡Vaya!</Text>
            <Text style={styles.emptyText}>No hay más personas cerca por ahora.</Text>
            
            <Button 
                title="Recargar Perfiles" 
                onPress={reiniciarYRecargar} 
                buttonStyle={styles.btnReload}
                titleStyle={styles.btnReloadTitle}
                icon={<Icon name="refresh" type="feather" color="white" style={styles.btnReloadIcon} />}
            />
            
            <TouchableOpacity onPress={logout} style={styles.linkLogout}>
                <Text style={styles.textLogout}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
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
                                <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.btnCancelText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.btnSend, mensajeDirecto.trim() === '' && styles.btnSendDisabled]} 
                                    onPress={enviarSuperLikeConMensaje}
                                    disabled={mensajeDirecto.trim() === '' || enviandoSuperLike}
                                >
                                    {enviandoSuperLike ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.btnSendText}>ENVIAR</Text>}
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
  container: { flex: 1, backgroundColor: "#F8F9FC" },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },

  deckContainer: { 
      height: SCREEN_HEIGHT * 0.65, 
      width: SCREEN_WIDTH, 
      marginTop: SCREEN_HEIGHT * 0.08, 
      zIndex: 1 
  },
  swiperContainerInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  
  card: {
    height: SCREEN_HEIGHT * 0.62, 
    width: SCREEN_WIDTH * 0.9,   
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
    justifyContent: 'flex-start', alignSelf: 'center', overflow: 'hidden'
  },
  
  cardTopRadius: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },

  infoContainer: { 
      flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
      paddingHorizontal: 20, paddingBottom: 5, backgroundColor: 'white' 
  },
  textWrapper: { flex: 1 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 15, color: 'gray', marginTop: 4 },
  iconInfo: { backgroundColor: '#F0F0FF', padding: 8, borderRadius: 20 },


  buttonsContainer: { 
      position: 'absolute', 
      bottom: 110, 
      left: 0, 
      right: 0, 
      flexDirection: 'row', 
      justifyContent: 'space-evenly', 
      alignItems: 'center', 
      height: 100, 
      zIndex: 2 
  },
  roundButton: {
      width: 65, height: 65, borderRadius: 35, backgroundColor: 'white',
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, elevation: 6
  },
  btnNope: { borderWidth: 1, borderColor: '#FFE5E5' }, 
  btnSuper: { width: 50, height: 50, borderRadius: 25, marginTop: -10, elevation: 4 },
  btnLike: { borderWidth: 1, borderColor: '#E5FFF0' },

  emptyIconBg: { 
      width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F0FF', 
      justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  emptyText: { fontSize: 16, color: 'gray', marginBottom: 30, textAlign: 'center' },
  btnReload: { 
      backgroundColor: '#6C63FF', borderRadius: 30, paddingHorizontal: 30, paddingVertical: 15,
      shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5
  },
  btnReloadTitle: { fontWeight: 'bold', fontSize: 16 },
  btnReloadIcon: { marginRight: 10 },
  linkLogout: { marginTop: 25 },
  textLogout: { color: '#FF6584', fontWeight: 'bold', fontSize: 15 },
  loadingText: { marginTop: 15, color: '#6C63FF', fontWeight: '600' },

  modalOverlay: { flex: 1 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 10 },
  modalHeader: { marginBottom: 15, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#3AB4CC' },
  modalSubtitle: { fontSize: 14, color: 'gray' },
  textInput: { width: '100%', height: 120, backgroundColor: '#F8F9FC', borderRadius: 10, padding: 15, textAlignVertical: 'top', fontSize: 16, color: '#333' },
  charCount: { alignSelf: 'flex-end', color: '#aaa', fontSize: 12, marginTop: 5, marginBottom: 20 },
  modalButtonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btnCancel: { padding: 15 },
  btnCancelText: { color: '#aaa', fontWeight: 'bold' },
  btnSend: { backgroundColor: '#3AB4CC', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, elevation: 2 },
  btnSendDisabled: { backgroundColor: '#b0e0e6' }, 
  btnSendText: { color: 'white', fontWeight: 'bold' }
});