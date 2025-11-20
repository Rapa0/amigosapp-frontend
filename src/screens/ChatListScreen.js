import React, { useState, useCallback, useContext } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert, Image, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { Text, Icon } from '@rneui/themed';
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
          `¿Quieres eliminar a ${nombre}?`,
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
        style={styles.reqCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('RequestDetail', { solicitud: item })}
      >
          <View style={styles.reqImageContainer}>
            <Image source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} style={styles.reqImg} />
            {item.mensajeInicial && (
                <View style={styles.reqBadge}>
                    <Icon name="chat" type="material" size={12} color="white" />
                </View>
            )}
          </View>
          
          <Text style={styles.reqName} numberOfLines={1}>{item.nombre}, {item.edad}</Text>
          <View style={styles.reqButton}>
            <Text style={styles.reqButtonText}>Ver</Text>
          </View>
      </TouchableOpacity>
  );

  const renderChat = ({ item }) => (
    <TouchableOpacity 
        style={styles.chatRow}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('Chat', { usuario: item })}
        onLongPress={() => confirmarEliminarChat(item._id, item.nombre)} 
    >
        <Image source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} style={styles.chatAvatar} />
        
        <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{item.nombre}</Text>
            <Text style={styles.chatPreview} numberOfLines={1}>Toca para escribirle...</Text>
        </View>

        <Icon name="chevron-right" type="material" color="#E0E0E0" size={24} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        {solicitudes.length > 0 && (
            <View>
                <Text style={styles.headerTitle}>Solicitudes ({solicitudes.length})</Text>
                <FlatList 
                    horizontal
                    data={solicitudes}
                    keyExtractor={item => item._id}
                    renderItem={renderSolicitud}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.reqList}
                />
            </View>
        )}

        <Text style={styles.headerTitle}>Mensajes</Text>
        
        {loadingInit && matches.length === 0 ? (
            <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : matches.length === 0 ? (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <Icon name="chat-bubble-outline" type="material" size={40} color="#aaa" />
                </View>
                <Text style={styles.emptyText}>Aún no tienes matches.</Text>
                <Text style={styles.emptySubText}>Ve a Descubrir para conocer gente.</Text>
            </View>
        ) : (
            <FlatList
                data={matches}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={renderChat}
                contentContainerStyle={styles.chatListContent}
                showsVerticalScrollIndicator={false}
            />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  contentContainer: { flex: 1 },
  
  headerTitle: { 
      fontSize: 20, fontWeight: '800', color: '#1F2937', 
      marginLeft: 20, marginTop: 20, marginBottom: 15 
  },

  reqList: { paddingHorizontal: 15, paddingBottom: 10 },
  reqCard: { 
      width: 100, height: 135, backgroundColor: 'white', 
      borderRadius: 16, marginRight: 12,
      alignItems: 'center', justifyContent: 'center', padding: 8,
      shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3
  },
  reqImageContainer: { position: 'relative', marginBottom: 8 },
  reqImg: { width: 60, height: 60, borderRadius: 30 },
  reqBadge: { 
      position: 'absolute', bottom: 0, right: 0, 
      backgroundColor: '#3AB4CC', borderRadius: 10, width: 20, height: 20, 
      justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' 
  },
  reqName: { fontWeight: '700', fontSize: 13, color: '#333', marginBottom: 8 },
  reqButton: { 
      backgroundColor: '#F0F0FF', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 10 
  },
  reqButtonText: { color: '#6C63FF', fontSize: 11, fontWeight: 'bold' },

  chatListContent: { paddingHorizontal: 15, paddingBottom: 100 },
  chatRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: 'white', padding: 15, borderRadius: 16, marginBottom: 10,
      shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2
  },
  chatAvatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#eee' },
  chatInfo: { flex: 1, marginLeft: 15 },
  chatName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 3 },
  chatPreview: { fontSize: 14, color: '#9CA3AF' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyIconCircle: { 
      width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', 
      justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySubText: { fontSize: 14, color: '#999', marginTop: 5 },
  loader: { marginTop: 50 }
});