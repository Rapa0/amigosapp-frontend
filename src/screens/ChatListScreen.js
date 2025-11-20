import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { ListItem, Avatar, Text, Icon } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';

export default function ChatListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const { limpiarNotificaciones } = useContext(AuthContext);

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
      limpiarNotificaciones();
    }, [limpiarNotificaciones])
  );

  const onRefresh = async () => {
      setRefreshing(true);
      await cargarDatos();
      setRefreshing(false);
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
      <TouchableOpacity 
        style={styles.solicitudCard}
        onPress={() => navigation.navigate('RequestDetail', { solicitud: item })}
      >
          {item.mensajeInicial && (
              <View style={styles.messageBadge}>
                  <Icon name="message" type="material" size={12} color="white" />
              </View>
          )}

          <Image source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} style={styles.solicitudImg} />
          <Text style={styles.solicitudName} numberOfLines={1}>{item.nombre}, {item.edad}</Text>
          <Text style={styles.verPerfilBtn}>Ver Perfil</Text>
      </TouchableOpacity>
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
  
  solicitudesContainer: { height: 190, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  listContainer: { paddingHorizontal: 15, paddingVertical: 5 },

  solicitudCard: { 
      width: 140, 
      height: 160, 
      backgroundColor: 'white', 
      borderRadius: 15, 
      marginRight: 15, 
      alignItems: 'center', 
      paddingVertical: 15, 
      paddingHorizontal: 10,
      elevation: 3, 
      shadowColor: '#000', 
      shadowOpacity: 0.1, 
      shadowOffset: {width:0, height:2},
      position: 'relative',
  },
  solicitudImg: { 
      width: 80, 
      height: 80, 
      borderRadius: 40, 
      borderWidth: 3, 
      borderColor: '#6200EE', 
      marginBottom: 8 
  },
  solicitudName: { 
      fontWeight: 'bold', 
      fontSize: 15, 
      textAlign: 'center', 
      color: '#333',
      marginTop: 5 
  },
  verPerfilBtn: { 
      fontSize: 13, 
      color: '#6200EE', 
      fontWeight: 'bold', 
      marginTop: 5, 
      textDecorationLine: 'underline' 
  },
  
  messageBadge: { 
      position: 'absolute', top: 5, right: 5, backgroundColor: '#3AB4CC', 
      borderRadius: 10, padding: 4, elevation: 2 
  },

  chatName: { fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: 'gray', marginTop: 10 },
  subtitle: { color: 'gray' },
  loader: { marginTop: 50 }
});