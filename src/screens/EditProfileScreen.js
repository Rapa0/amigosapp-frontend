import React, { useState, useContext } from 'react';
import { StyleSheet, ScrollView, Alert, View, TouchableOpacity, Image } from 'react-native';
import { Input, Button, Text, ButtonGroup, Icon } from '@rneui/themed';
import { launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../context/AuthContext';
import axiosClient from '../api/client';
import { storeData } from '../utils/storage';

export default function EditProfileScreen({ navigation }) {
    const { authState, setAuthState } = useContext(AuthContext);
    const user = authState.user;

    const [nombre, setNombre] = useState(user?.nombre || '');
    const [edad, setEdad] = useState(user?.edad?.toString() || '');
    const [descripcion, setDescripcion] = useState(user?.descripcion || '');
    
    const [galeria, setGaleria] = useState(user?.galeria || []);
    const [subiendo, setSubiendo] = useState(false);

    const generos = ['Hombre', 'Mujer', 'Otro'];
    const [idxGenero, setIdxGenero] = useState(generos.indexOf(user?.genero) !== -1 ? generos.indexOf(user?.genero) : 0);
    const preferencias = ['Hombre', 'Mujer', 'Ambos'];
    const [idxPref, setIdxPref] = useState(preferencias.indexOf(user?.preferencia) !== -1 ? preferencias.indexOf(user?.preferencia) : 2);

    const agregarFoto = () => {
        const options = { mediaType: 'photo', quality: 0.5 };
        launchImageLibrary(options, async (response) => {
            if (response.didCancel || !response.assets) return;

            setSubiendo(true);
            const foto = response.assets[0];
            const formData = new FormData();
            formData.append('imagen', {
                uri: foto.uri,
                type: foto.type,
                name: foto.fileName || 'galeria.jpg',
            });

            try {
                const res = await axiosClient.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setGaleria([...galeria, res.data.url]);
            } catch (error) {
                Alert.alert('Error', 'No se pudo subir la imagen');
            }
            setSubiendo(false);
        });
    };

    const eliminarFoto = (index) => {
        const nuevaGaleria = galeria.filter((_, i) => i !== index);
        setGaleria(nuevaGaleria);
    };

    const guardarCambios = async () => {
        setSubiendo(true);
        try {
            const datos = {
                nombre,
                edad: parseInt(edad, 10),
                descripcion,
                genero: generos[idxGenero],
                preferencia: preferencias[idxPref],
                galeria 
            };

            const { data } = await axiosClient.put('/auth/perfil', datos);
            await storeData('user', JSON.stringify(data.usuario));
            setAuthState({ ...authState, user: data.usuario });
            
            Alert.alert('Éxito', 'Perfil actualizado');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'No se pudo actualizar');
        }
        setSubiendo(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text h4 style={styles.title}>Editar Perfil</Text>
            
            <Text style={styles.label}>Mi Galería</Text>
            <ScrollView horizontal style={styles.galeriaContainer}>
                <View style={styles.fotoWrapper}>
                    <Image source={{ uri: user.imagen }} style={styles.fotoMini} />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Principal</Text>
                    </View>
                </View>

                {galeria.map((img, index) => (
                    <View key={index} style={styles.fotoWrapper}>
                        <Image source={{ uri: img }} style={styles.fotoMini} />
                        <TouchableOpacity style={styles.btnDelete} onPress={() => eliminarFoto(index)}>
                            <Icon name="close" size={15} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.btnAdd} onPress={agregarFoto}>
                    <Icon name="add" size={30} color="gray" />
                </TouchableOpacity>
            </ScrollView>

            <Input label="Nombre" value={nombre} onChangeText={setNombre} containerStyle={styles.inputMargin}/>
            <Input label="Edad" value={edad} onChangeText={setEdad} keyboardType="numeric" />
            <Input label="Sobre mí" value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />

            <Text style={styles.label}>Soy:</Text>
            <ButtonGroup 
                buttons={generos} 
                selectedIndex={idxGenero} 
                onPress={setIdxGenero} 
                containerStyle={styles.group} 
                selectedButtonStyle={styles.selectedBtnPrimary} 
            />

            <Text style={styles.label}>Busco:</Text>
            <ButtonGroup 
                buttons={preferencias} 
                selectedIndex={idxPref} 
                onPress={setIdxPref} 
                containerStyle={styles.group} 
                selectedButtonStyle={styles.selectedBtnSecondary} 
            />

            <Button 
                title={subiendo ? "Subiendo..." : "Guardar Cambios"} 
                onPress={guardarCambios} 
                disabled={subiendo} 
                containerStyle={styles.btnSave} 
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: 'white' },
    title: { textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, color: 'gray', marginLeft: 10, marginTop: 10, fontWeight: 'bold' },
    group: { marginBottom: 15 },
    btnSave: { marginTop: 20, marginBottom: 40 },
    
    galeriaContainer: { flexDirection: 'row', marginVertical: 10 },
    fotoWrapper: { marginRight: 10, position: 'relative' },
    fotoMini: { width: 80, height: 100, borderRadius: 10 },
    badge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center' },
    badgeText: { color: 'white', fontSize: 10 },
    btnDelete: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 15, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
    btnAdd: { width: 80, height: 100, borderRadius: 10, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: 'gray' },
    
    inputMargin: { marginTop: 20 },
    selectedBtnPrimary: { backgroundColor: '#6200EE' },
    selectedBtnSecondary: { backgroundColor: '#03DAC6' }
});