import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem, Avatar, Text } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import axiosClient from '../api/client';

export default function ChatListScreen({ navigation }) {
  const [matches, setMatches] = useState([]);

  useFocusEffect(
    useCallback(() => {
      obtenerMatches();
    }, [])
  );

  const obtenerMatches = async () => {
    try {
      const res = await axiosClient.get('/app/matches');
      setMatches(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.header}>Tus Matches</Text>
      {matches.length === 0 && <Text style={styles.empty}>Aún no tienes matches. ¡Ve a dar likes!</Text>}
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { usuario: item })}>
            <ListItem bottomDivider>
              <Avatar source={{ uri: item.imagen || 'https://via.placeholder.com/150' }} rounded />
              <ListItem.Content>
                <ListItem.Title style={styles.name}>{item.nombre}</ListItem.Title>
                <ListItem.Subtitle>{item.email}</ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { textAlign: 'center', padding: 20, color: '#6200EE' },
  empty: { textAlign: 'center', marginTop: 50, color: 'gray' },
  name: { fontWeight: 'bold' }
});