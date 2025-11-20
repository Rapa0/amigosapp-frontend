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
                size={120}
                rounded 
                source={{ uri: user?.imagen || 'https://via.placeholder.com/150' }} 
                containerStyle={styles.avatar}
            />
            <Text h3 style={styles.name}>{user?.nombre}, {user?.edad || '?'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.descripcion ? <Text style={styles.desc}>"{user.descripcion}"</Text> : null}
        </View>

        <View style={styles.menu}>
            <ListItem 
                onPress={() => navigation.navigate('EditProfile')}
                containerStyle={styles.menuItem}
            >
                <View style={styles.iconBox}>
                    <Icon name="edit" type="material" color="white" size={20} />
                </View>
                <ListItem.Content>
                    <ListItem.Title style={styles.menuText}>Editar Perfil</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color="#ccc" />
            </ListItem>

            <Button 
                title="Cerrar Sesión" 
                onPress={logout} 
                icon={<Icon name="logout" type="material" color="#6C63FF" style={styles.btnIcon} />}
                containerStyle={styles.btnContainer}
                buttonStyle={styles.btnLogout}
                titleStyle={styles.btnLogoutText} 
            />

            <Button 
                title="Eliminar Cuenta" 
                onPress={confirmarEliminar} 
                buttonStyle={styles.deleteBtn} 
                containerStyle={styles.btnContainer}
                icon={<Icon name="delete-outline" type="material" color="white" style={styles.btnIcon} />}
            />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        backgroundColor: 'white',
        justifyContent: 'center',
        paddingBottom: 100 
    },
    header: { 
        alignItems: 'center', 
        paddingHorizontal: 30,
        marginBottom: 30,
        marginTop: 20
    },
    avatar: { 
        marginBottom: 20,
        borderWidth: 4,
        borderColor: '#F5F6FA', 
    },
    name: { 
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: 'bold'
    },
    email: { 
        color: 'gray', 
        fontSize: 14, 
        marginBottom: 15 
    },
    desc: { 
        fontStyle: 'italic', 
        textAlign: 'center', 
        color: '#666',
        paddingHorizontal: 20,
        lineHeight: 22,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 10,
        overflow: 'hidden'
    },
    menu: { 
        width: '100%',
        paddingHorizontal: 25,
        alignItems: 'center'
    },
    menuItem: {
        width: '100%',
        borderRadius: 20,
        backgroundColor: '#fff',
        marginBottom: 20,
        paddingVertical: 15,
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    iconBox: {
        backgroundColor: '#6C63FF',
        padding: 8,
        borderRadius: 10
    },
    menuText: {
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
        fontSize: 16
    },
    btnContainer: { 
        width: '100%', 
        marginTop: 15,
        borderRadius: 30
    },
    btnLogout: {
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB', 
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    btnLogoutText: {
        color: '#6C63FF',
        fontWeight: 'bold',
        fontSize: 16
    },
    deleteBtn: { 
        backgroundColor: '#FF6584',
        borderRadius: 30, 
        paddingVertical: 15,
        elevation: 5,
        shadowColor: '#FF6584',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    btnIcon: {
        marginRight: 10
    }
});