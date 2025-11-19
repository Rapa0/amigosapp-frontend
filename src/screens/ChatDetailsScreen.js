import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import axiosClient from '../api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ChatDetailsScreen({ route, navigation }) {
    const { usuario } = route.params;
    const [eliminando, setEliminando] = useState(false);

    const eliminarChat = () => {
        Alert.alert(
            "Eliminar Chat",
            `¿Estás seguro de eliminar a ${usuario.nombre}? Desaparecerá de tus chats.`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: procesarEliminacion
                }
            ]
        );
    };

    const procesarEliminacion = async () => {
        setEliminando(true);
        try {
            await axiosClient.post('/app/eliminarmatch', { idUsuario: usuario._id });
            
            navigation.reset({
                index: 0,
                routes: [{ name: 'Mensajes' }],
            });
            
        } catch (error) {
            console.log(error);
            Alert.alert("Aviso", "El chat ya no está disponible.", [
                { text: "OK", onPress: () => navigation.popToTop() }
            ]);
        } finally {
            setEliminando(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image 
                source={{ uri: usuario.imagen || 'https://via.placeholder.com/300' }} 
                style={styles.image} 
            />
            
            <View style={styles.infoContainer}>
                <Text h2 style={styles.name}>{usuario.nombre}, {usuario.edad}</Text>
                <Text style={styles.email}>{usuario.email}</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.sectionTitle}>Sobre mí</Text>
                <Text style={styles.desc}>
                    {usuario.descripcion || "Sin descripción."}
                </Text>

                <View style={styles.divider} />

                <Button 
                    title={eliminando ? "Eliminando..." : "Eliminar Chat y Match"}
                    icon={!eliminando && <Icon name="trash-2" type="feather" color="white" style={styles.trashIcon} />}
                    buttonStyle={styles.deleteBtn} 
                    containerStyle={styles.btnContainer}
                    onPress={eliminarChat}
                    disabled={eliminando}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: 'white' },
    image: { width: SCREEN_WIDTH, height: 400, resizeMode: 'cover' },
    infoContainer: { padding: 20, marginTop: -20, backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25 },
    name: { textAlign: 'center', marginBottom: 5 },
    email: { textAlign: 'center', color: 'gray', marginBottom: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 5 },
    desc: { fontSize: 16, color: '#555', lineHeight: 24 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    deleteBtn: { backgroundColor: '#FF5864', borderRadius: 10, paddingVertical: 15 },
    btnContainer: { marginTop: 20 },
    trashIcon: { marginRight: 10 }
});