import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { ListItem, Avatar, Text, Icon } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/client';

export default function ChatListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const cargarDatos = async () => {
      try {
        const resMatches = await axiosClient.get('/app/matches');
        const resSolicitudes = await axiosClient.get('/app/solicitudes');
        
        setMatches(resMatches.data);
        setSolicitudes(resSolicitudes.data);
      } catch (error) {
          console.log(error);
      } finally {
          setLoadingInit(false);
      }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const onRefresh = async () => {
      setRefreshing(true);
      await cargarDatos();
      setRefreshing(false);
  };

  const responderSolicitud = async (idCandidato, accion) => {
      try {
          await axiosClient.post('/app/solicitudes', { idCandidato, accion });
          cargarDatos(); 
          if (accion === 'aceptar') Alert.alert('¡Nuevo Amigo!', 'Ahora puedes chatear.');
      } catch (error) {
          Alert.alert('Error al procesar solicitud');
      }
  };

  const confirmarEliminarChat = (idUsuario, nombre) => {
      Alert.alert(
          "Eliminar Chat",
          `¿Quieres eliminar a ${nombre}? Volverá a aparecer en 'Descubrir' si coinciden de nuevo.`,
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Eliminar", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await axiosClient.post('/app/eliminarmatch', { idUsuario });
                          cargarDatos();
                      } catch (error) {
                          Alert.alert("Error", "No se pudo eliminar");
                      }
                  }
              }
          ]
      );
  };

  const renderSolicitud = ({ item }) => (
      <View style={styles.solicitudCard}>
          <Image source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} style={styles.solicitudImg} />
          <Text style={styles.solicitudName}>{item.nombre}, {item.edad}</Text>
          <View style={styles.solicitudBtns}>
              <TouchableOpacity onPress={() => responderSolicitud(item._id, 'rechazar')} style={styles.btnRechazar}>
                  <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => responderSolicitud(item._id, 'aceptar')} style={styles.btnAceptar}>
                  <Icon name="check" size={20} color="white" />
              </TouchableOpacity>
          </View>
      </View>
  );

  return (
    <View style={styles.container}>
      
      {solicitudes.length > 0 && (
          <View style={styles.solicitudesContainer}>
              <Text style={styles.sectionTitle}>Te quieren conocer ({solicitudes.length})</Text>
              <FlatList 
                horizontal
                data={solicitudes}
                keyExtractor={item => item._id}
                renderItem={renderSolicitud}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
          </View>
      )}

      <Text style={styles.sectionTitle}>Tus Chats</Text>
      
      {loadingInit && matches.length === 0 ? (
           <ActivityIndicator size="large" color="#6200EE" style={styles.loader} />
      ) : matches.length === 0 ? (
          <View style={styles.emptyContainer}>
              <Icon name="chat-bubble-outline" type="material" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No tienes chats activos aún.</Text>
          </View>
      ) : (
        <FlatList
            data={matches}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
            <TouchableOpacity 
                onPress={() => navigation.navigate('Chat', { usuario: item })}
                onLongPress={() => confirmarEliminarChat(item._id, item.nombre)} 
            >
                <ListItem bottomDivider>
                <Avatar source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} rounded size="medium" />
                <ListItem.Content>
                    <ListItem.Title style={styles.chatName}>{item.nombre}</ListItem.Title>
                    <ListItem.Subtitle numberOfLines={1} style={styles.subtitle}>Toca para chatear...</ListItem.Subtitle>
                </ListItem.Content>
                <ListItem.Chevron />
                </ListItem>
            </TouchableOpacity>
            )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 15, marginBottom: 10, color: '#333' },
  
  solicitudesContainer: { height: 180, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  solicitudCard: { 
      width: 110, height: 150, backgroundColor: 'white', borderRadius: 10, marginRight: 10, 
      alignItems: 'center', padding: 5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width:0, height:1}
  },
  solicitudImg: { width: 70, height: 70, borderRadius: 35, marginBottom: 5 },
  solicitudName: { fontWeight: 'bold', fontSize: 12, textAlign: 'center', marginBottom: 5 },
  solicitudBtns: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  btnAceptar: { backgroundColor: '#4FCC94', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  btnRechazar: { backgroundColor: '#FF5864', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },

  chatName: { fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: 'gray', marginTop: 10 },
  listContainer: { paddingHorizontal: 10 },
  subtitle: { color: 'gray' },
  loader: { marginTop: 50 }
});