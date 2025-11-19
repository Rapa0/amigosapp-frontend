import React, { useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Text, Avatar, ListItem, Icon } from '@rneui/themed';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/client';

export default function ProfileScreen({ navigation }) {
  const { authState, logout } = useContext(AuthContext);
  const user = authState.user;

  const confirmarEliminar = () => {
      Alert.alert(
          "Eliminar Cuenta",
          "¿Estás seguro? Esta acción no se puede deshacer.",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Eliminar", 
                  style: "destructive", 
                  onPress: async () => {
                      try {
                          await axiosClient.delete('/auth/perfil');
                          logout();
                      } catch (error) {
                          Alert.alert("Error", "No se pudo eliminar la cuenta");
                      }
                  }
              }
          ]
      );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            <Avatar 
                size="xlarge" 
                rounded 
                source={{ uri: user?.imagen || 'https://via.placeholder.com/150' }} 
                containerStyle={styles.avatar}
            />
            <Text h3>{user?.nombre}, {user?.edad || '?'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.descripcion ? <Text style={styles.desc}>"{user.descripcion}"</Text> : null}
        </View>

        <View style={styles.menu}>
            <ListItem bottomDivider onPress={() => navigation.navigate('EditProfile')}>
                <Icon name="edit" type="material" color="gray" key="icon" />
                <ListItem.Content key="content">
                    <ListItem.Title>Editar Perfil</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron key="chevron" />
            </ListItem>

            <Button 
                title="Cerrar Sesión" 
                onPress={logout} 
                type="outline"
                containerStyle={styles.btn}
            />

            <Button 
                title="Eliminar Cuenta" 
                onPress={confirmarEliminar} 
                buttonStyle={styles.deleteBtn} 
                containerStyle={styles.btn}
            />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: 'white' },
    header: { alignItems: 'center', padding: 30, backgroundColor: '#f9f9f9' },
    email: { color: 'gray', fontSize: 16, marginBottom: 10 },
    desc: { fontStyle: 'italic', textAlign: 'center', marginTop: 5, color: '#555' },
    avatar: { marginBottom: 15 },
    menu: { padding: 20 },
    btn: { marginTop: 20 },
    deleteBtn: { backgroundColor: 'red' }
});