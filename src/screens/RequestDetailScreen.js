import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import axiosClient from '../api/client';
import { AuthContext } from '../context/AuthContext';
import PhotoGalleryViewer from '../components/PhotoGalleryViewer';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function RequestDetailScreen({ route, navigation }) {
    const { solicitud } = route.params; 
    const [procesando, setProcesando] = useState(false);
    const { cargarNotificaciones } = useContext(AuthContext);

    const responder = async (accion) => {
        setProcesando(true);
        try {
            if (accion === 'rechazar') {
                 await axiosClient.post('/app/solicitudes', { idCandidato: solicitud._id, accion: 'rechazar' });
            } else {
                 await axiosClient.post('/app/solicitudes', { idCandidato: solicitud._id, accion: 'aceptar' });
            }
            
            if (cargarNotificaciones) cargarNotificaciones();

            if (accion === 'aceptar') {
                Alert.alert("¡Match!", "Ahora pueden chatear.");
            }
            navigation.goBack(); 
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "No se pudo procesar la solicitud");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
                
                <View style={styles.imageWrapper}>
                    <PhotoGalleryViewer 
                        user={solicitud} 
                        height={SCREEN_HEIGHT * 0.55} 
                        style={styles.galleryStyle}
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" type="material" color="white" size={26} />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Text h2 style={styles.name}>{solicitud.nombre}, {solicitud.edad}</Text>
                        {solicitud.genero && (
                             <View style={styles.genderTag}>
                                <Icon name="person" type="material" size={14} color="gray" style={styles.genderIcon}/>
                                <Text style={styles.genderText}>{solicitud.genero}</Text>
                             </View>
                        )}
                    </View>

                    {solicitud.mensajeInicial && (
                        <View style={styles.messageBubble}>
                            <View style={styles.quoteIcon}>
                                <Icon name="format-quote" type="material" color="white" size={18} />
                            </View>
                            <Text style={styles.messageTitle}>Te dice:</Text>
                            <Text style={styles.messageText}>"{solicitud.mensajeInicial}"</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Sobre mí</Text>
                    <Text style={styles.desc}>
                        {solicitud.descripcion || "Sin descripción."}
                    </Text>

                    <View style={styles.spacer} />
                </View>
            </ScrollView>

            <View style={styles.buttonsContainer}>
                <Button 
                    title="Rechazar" 
                    onPress={() => responder('rechazar')}
                    buttonStyle={styles.btnReject}
                    containerStyle={styles.btnWrapper}
                    disabled={procesando}
                    icon={<Icon name="close" color="white" style={styles.btnIcon} />}
                    titleStyle={styles.btnRejectTitle}
                    type="outline"
                />
                <Button 
                    title="Aceptar" 
                    onPress={() => responder('aceptar')}
                    buttonStyle={styles.btnAccept}
                    containerStyle={styles.btnWrapper}
                    disabled={procesando}
                    icon={<Icon name="check" color="white" style={styles.btnIcon} />}
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
    backButton: {
        position: 'absolute', top: 45, left: 20,
        backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8,
        zIndex: 20 
    },

    infoContainer: { padding: 25, marginTop: 5 },
    
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    name: { color: '#333', fontSize: 28, fontWeight: 'bold', flex: 1 },
    genderTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
    genderIcon: { marginRight: 4 },
    genderText: { color: 'gray', fontSize: 12, fontWeight: 'bold' },

    messageBubble: {
        backgroundColor: '#F0F0FF',
        borderRadius: 15, padding: 20, marginBottom: 20,
        borderLeftWidth: 4, borderLeftColor: '#6C63FF'
    },
    quoteIcon: {
        position: 'absolute', top: -10, left: 15, backgroundColor: '#6C63FF', borderRadius: 10, padding: 2
    },
    messageTitle: { color: '#6C63FF', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
    messageText: { color: '#444', fontSize: 16, fontStyle: 'italic', lineHeight: 22 },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    desc: { fontSize: 16, color: '#666', lineHeight: 24 },
    
    spacer: { height: 20 },

    buttonsContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 40, 
        backgroundColor: 'white',
        borderTopWidth: 1, borderTopColor: '#F5F5F5',
        elevation: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 3
    },
    btnWrapper: { width: '42%', borderRadius: 30 },
    
    btnReject: { 
        backgroundColor: '#FF5864', 
        paddingVertical: 14, 
        borderRadius: 30,
        borderWidth: 0 
    },
    
    btnAccept: { backgroundColor: '#6C63FF', paddingVertical: 14, borderRadius: 30 },
    
    btnIcon: { marginRight: 8 },
    btnRejectTitle: { color: 'white', fontWeight: 'bold' }
});