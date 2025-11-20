import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import axiosClient from '../api/client';
import PhotoGalleryViewer from '../components/PhotoGalleryViewer';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ChatDetailsScreen({ route, navigation }) {
    const { usuario } = route.params;
    const [eliminando, setEliminando] = useState(false);

    const eliminarChat = () => {
        Alert.alert(
            "Eliminar Chat",
            `¿Estás seguro de eliminar a ${usuario.nombre}? Desaparecerá de tus chats y volverá a 'Descubrir' si coinciden de nuevo.`,
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
            Alert.alert("Aviso", "El chat ya no está disponible.", [
                { text: "OK", onPress: () => navigation.popToTop() }
            ]);
        } finally {
            setEliminando(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer} 
                showsVerticalScrollIndicator={false}
                bounces={false}
            >

                <View style={styles.imageWrapper}>
                    <PhotoGalleryViewer 
                        user={usuario} 
                        height={SCREEN_HEIGHT * 0.55} 
                        style={styles.galleryStyle}
                    />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text h2 style={styles.name}>{usuario.nombre}, {usuario.edad}</Text>
                        {usuario.genero && (
                             <View style={styles.genderTag}>
                                <Icon name="person" type="material" size={14} color="gray" style={styles.genderIcon}/>
                                <Text style={styles.genderText}>{usuario.genero}</Text>
                             </View>
                        )}
                    </View>

                    <Text style={styles.email}>{usuario.email}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Sobre mí</Text>
                    <Text style={styles.desc}>
                        {usuario.descripcion || "Sin descripción."}
                    </Text>

                    <View style={styles.spacer} />
                </View>
            </ScrollView>

            <View style={styles.fixedBottomContainer}>
                <Button 
                    title={eliminando ? "Eliminando..." : "Eliminar Chat y Match"}
                    icon={!eliminando && <Icon name="trash-2" type="feather" color="white" style={styles.trashIcon} />}
                    buttonStyle={styles.deleteBtn} 
                    containerStyle={styles.btnContainer}
                    onPress={eliminarChat}
                    disabled={eliminando}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: 'white' },

    scrollContainer: { paddingBottom: 120 }, 

    imageWrapper: { position: 'relative' },
    galleryStyle: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },

    infoContainer: { 
        padding: 25, 
        marginTop: 10 
    },
    
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    name: { color: '#333', fontSize: 28, fontWeight: 'bold', flex: 1 },
    
    genderTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
    genderIcon: { marginRight: 4 },
    genderText: { color: 'gray', fontSize: 12, fontWeight: 'bold' },

    email: { color: 'gray', fontSize: 14, marginBottom: 15 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    desc: { fontSize: 16, color: '#555', lineHeight: 24 },

    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 20 },
    spacer: { height: 40 },

    fixedBottomContainer: {
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40, 
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        elevation: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 5
    },
    
    deleteBtn: { 
        backgroundColor: '#FF5864', 
        borderRadius: 30, 
        paddingVertical: 15,
        elevation: 5,
        shadowColor: '#FF5864', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
    },
    btnContainer: { width: '100%' },
    trashIcon: { marginRight: 10 }
});