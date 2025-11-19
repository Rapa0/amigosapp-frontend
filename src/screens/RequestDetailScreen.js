import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { Text, Button, Icon } from '@rneui/themed';
import axiosClient from '../api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RequestDetailScreen({ route, navigation }) {
    const { solicitud } = route.params; 
    const [procesando, setProcesando] = useState(false);

    const responder = async (accion) => {
        setProcesando(true);
        try {
            await axiosClient.post('/app/solicitudes', { idCandidato: solicitud._id, accion });
            
            if (accion === 'aceptar') {
                Alert.alert("¡Match!", "Ahora pueden chatear.");
            }
            navigation.goBack(); 
        } catch (error) {
            Alert.alert("Error", "No se pudo procesar la solicitud");
        } finally {
            setProcesando(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image 
                source={{ uri: solicitud.imagen || 'https://via.placeholder.com/300' }} 
                style={styles.image} 
            />

            <View style={styles.infoContainer}>
                {solicitud.mensajeInicial && (
                    <View style={styles.messageBubble}>
                        <View style={styles.quoteIcon}>
                            <Icon name="format-quote" type="material" color="white" size={20} />
                        </View>
                        <Text style={styles.messageTitle}>Te dejó un mensaje:</Text>
                        <Text style={styles.messageText}>"{solicitud.mensajeInicial}"</Text>
                    </View>
                )}

                <Text h2 style={styles.name}>{solicitud.nombre}, {solicitud.edad}</Text>
                
                <Text style={styles.sectionTitle}>Sobre mí</Text>
                <Text style={styles.desc}>{solicitud.descripcion || "Sin descripción."}</Text>

                {solicitud.galeria && solicitud.galeria.length > 0 && (
                    <View style={styles.galleryContainer}>
                        {solicitud.galeria.map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
                        ))}
                    </View>
                )}

                <View style={styles.spacer} />
            </View>

            <View style={styles.buttonsContainer}>
                <Button 
                    title="Rechazar" 
                    onPress={() => responder('rechazar')}
                    buttonStyle={styles.btnReject}
                    containerStyle={styles.btnWrapper}
                    disabled={procesando}
                    icon={<Icon name="close" color="#FF5864" style={styles.btnIcon} />}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: 'white', paddingBottom: 100 },
    image: { width: SCREEN_WIDTH, height: 450, resizeMode: 'cover' },
    
    infoContainer: { 
        padding: 20, 
        marginTop: -30, 
        backgroundColor: 'white', 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, elevation: 5
    },
    
    messageBubble: {
        backgroundColor: '#EDF9FC',
        borderColor: '#3AB4CC',
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        position: 'relative',
        marginTop: 10
    },
    quoteIcon: {
        position: 'absolute', top: -10, left: 20, backgroundColor: '#3AB4CC', borderRadius: 10, padding: 2
    },
    messageTitle: { color: '#3AB4CC', fontWeight: 'bold', fontSize: 12, marginBottom: 5, marginTop: 5 },
    messageText: { color: '#333', fontSize: 16, fontStyle: 'italic' },

    name: { marginBottom: 5, color: '#333' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 5 },
    desc: { fontSize: 16, color: '#555', lineHeight: 24 },
    
    galleryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
    galleryImage: { width: 100, height: 100, borderRadius: 10, marginRight: 10, marginBottom: 10 },
    
    spacer: { height: 50 },

    buttonsContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
        paddingVertical: 20, backgroundColor: 'white',
        borderTopWidth: 1, borderTopColor: '#eee'
    },
    btnWrapper: { width: '40%', borderRadius: 25 },
    btnReject: { borderColor: '#FF5864', borderWidth: 2, paddingVertical: 12, borderRadius: 25 },
    btnAccept: { backgroundColor: '#4FCC94', paddingVertical: 12, borderRadius: 25 },
    
    btnIcon: { marginRight: 5 },
    btnRejectTitle: { color: '#FF5864' }
});