import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet, Text, Image, ActivityIndicator, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Icon, Button } from '@rneui/themed';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function FindFriendsScreen({ navigation }) {
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const { logout } = useContext(AuthContext);
  
  const [fotoIndices, setFotoIndices] = useState({}); 

  useEffect(() => { cargarCandidatos(); }, []);

  const cargarCandidatos = async () => {
    try {
      const res = await axiosClient.get('/app/candidatos');
      setCandidatos(res.data);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const onSwipedRight = async (cardIndex) => {
    const persona = candidatos[cardIndex];
    try { await axiosClient.post('/app/like', { idCandidato: persona._id }); } 
    catch (e) { console.log(e); }
  };

  const siguienteFoto = (usuarioId, maxFotos) => {
    setFotoIndices(prev => {
        const actual = prev[usuarioId] || 0;
        const siguiente = (actual + 1) % maxFotos;
        return { ...prev, [usuarioId]: siguiente };
    });
  };

  const enviarMensajeDirecto = (persona) => {
      Alert.alert("Mensaje Directo", `Escribe algo para ${persona.nombre}:`, [
          { text: "Cancelar" },
          { text: "Enviar", onPress: () => {
              onSwipedRight(candidatos.indexOf(persona));
              swiperRef.current.swipeRight();
              Alert.alert("Enviado", "Si le gustas, verás el chat en tu lista.");
          }}
      ], 'plain-text');
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
                        
                        const todasLasFotos = [card.imagen, ...(card.galeria || [])].filter(Boolean);
                        const indiceActual = fotoIndices[card._id] || 0;
                        const fotoAMostrar = todasLasFotos[indiceActual] || 'https://via.placeholder.com/300';

                        return (
                            <TouchableOpacity 
                                activeOpacity={1} 
                                onPress={() => siguienteFoto(card._id, todasLasFotos.length)}
                                style={styles.card}
                            >
                                <Image source={{ uri: fotoAMostrar }} style={styles.image} />
                                
                                {todasLasFotos.length > 1 && (
                                    <View style={styles.indicatorContainer}>
                                        {todasLasFotos.map((_, i) => (
                                            <View key={i} style={[styles.barrita, i === indiceActual ? styles.barritaActiva : null]} />
                                        ))}
                                    </View>
                                )}

                                <View style={styles.infoContainer}>
                                    <View style={styles.textWrapper}>
                                        <Text style={styles.name}>{card.nombre}, {card.edad}</Text>
                                        <Text numberOfLines={2} style={styles.desc}>{card.descripcion}</Text>
                                    </View>
                                    <Icon name="info" type="feather" color="gray" size={24} />
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    onSwipedRight={onSwipedRight}
                    onSwipedAll={cargarCandidatos}
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

                <TouchableOpacity style={[styles.roundButton, styles.btnSuper]} onPress={() => enviarMensajeDirecto(candidatos[0])}>
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
            <Button title="Recargar" onPress={cargarCandidatos} type="clear" />
            <Button title="Cerrar Sesión" onPress={logout} buttonStyle={styles.logoutBtn} />
        </View>
      )}
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
    width: SCREEN_WIDTH * 0.9,   
    borderRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    justifyContent: 'flex-start',
    alignSelf: 'center' 
  },
  
  image: { 
    width: '100%', 
    height: '78%', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    resizeMode: 'cover' 
  },
  
  indicatorContainer: {
      position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between'
  },
  barrita: { flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 2, borderRadius: 2 },
  barritaActiva: { backgroundColor: 'white' },

  infoContainer: {
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingBottom: 5
  },
  textWrapper: {
      flex: 1
  },
  name: { fontSize: 26, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 15, color: 'gray', marginTop: 4 },

  buttonsContainer: {
      position: 'absolute', 
      bottom: SCREEN_HEIGHT * 0.04, 
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      height: 100,
      zIndex: 2 
  },
  roundButton: {
      width: 65, height: 65, borderRadius: 35,
      backgroundColor: 'white',
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, elevation: 5
  },
  btnNope: { borderWidth: 1, borderColor: 'white' }, 
  btnSuper: { width: 50, height: 50, borderRadius: 25, marginTop: -10, elevation: 3 },
  btnLike: { borderWidth: 1, borderColor: 'white' },
  logoutBtn: { backgroundColor: 'red', marginTop: 20 }
});