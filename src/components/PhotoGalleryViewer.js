import React, { useState } from 'react';
import { View, Image, Pressable, StyleSheet } from 'react-native';

const PhotoGalleryViewer = ({ user, height = 400, style, imageStyle }) => {
    // 1. Hooks SIEMPRE arriba
    const [indiceFoto, setIndiceFoto] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    // 2. Validación de seguridad: si no hay user, preparamos un array vacío
    const userData = user || {};
    const galeriaSegura = Array.isArray(userData.galeria) ? userData.galeria : [];
    
    // 3. Construimos el array de fotos. Si user.imagen existe, va primero.
    const todasLasFotos = [userData.imagen, ...galeriaSegura].filter(Boolean);

    // 4. Determinamos qué mostrar
    const fotoAMostrar = todasLasFotos.length > 0
        ? todasLasFotos[indiceFoto]
        : 'https://via.placeholder.com/400x500?text=Sin+Foto';

    const hayVariasFotos = todasLasFotos.length > 1;

    const cambiarFoto = (evento) => {
        if (!hayVariasFotos) return;

        const toqueX = evento.nativeEvent.locationX;
        
        // Usamos el ancho real del contenedor
        if (toqueX > containerWidth / 2) {
            setIndiceFoto((prev) => (prev + 1) % todasLasFotos.length);
        } else {
            setIndiceFoto((prev) => (prev - 1 + todasLasFotos.length) % todasLasFotos.length);
        }
    };

    return (
        <View 
            style={[styles.container, { height }, style]} 
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {/* Capa 1: Imagen */}
            <Image
                source={{ uri: fotoAMostrar }}
                style={[styles.image, imageStyle]}
            />

            {/* Capa 2: Indicadores */}
            {hayVariasFotos && (
                <View style={styles.indicatorContainer} pointerEvents="none">
                    {todasLasFotos.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.barrita,
                                i === indiceFoto ? styles.barritaActiva : null
                            ]}
                        />
                    ))}
                </View>
            )}

            {/* Capa 3: Área Táctil Invisible (Overlay) */}
            <Pressable 
                style={styles.touchOverlay} 
                onPress={cambiarFoto}
            >
                {/* Aquí podríamos poner zonas izquierda/derecha invisibles si quisiéramos más precisión, 
                    pero con el cálculo de X en onPress es suficiente y más limpio. */}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#eee', 
        position: 'relative',
        overflow: 'hidden'
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    indicatorContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    barrita: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(0,0,0,0.3)', 
        marginHorizontal: 2,
        borderRadius: 2,
    },
    barritaActiva: {
        backgroundColor: 'white', 
    },
    touchOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 20, // Asegura que esté por encima de la imagen para recibir el toque
    }
});

export default PhotoGalleryViewer;