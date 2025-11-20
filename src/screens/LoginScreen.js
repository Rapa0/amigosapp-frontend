import React, { useState, useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>AmigosApp</Text>
      
      <Input 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        leftIcon={{ type: 'material', name: 'email' }}
      />
      
      <Input 
        placeholder="Contraseña" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry={!showPassword} 
        leftIcon={{ type: 'material', name: 'lock' }}
        rightIcon={{ 
            type: 'material', 
            name: showPassword ? 'visibility' : 'visibility-off',
            onPress: () => setShowPassword(!showPassword) 
        }}
      />
      
      <Button 
        title="Ingresar" 
        onPress={() => login(email, password)} 
        containerStyle={styles.btn} 
      />
      
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkContainer}>
          <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <Button 
        title="Registrarse" 
        type="outline" 
        onPress={() => navigation.navigate('Register')} 
        containerStyle={styles.btn} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: 'white' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 40, 
    color: '#2089dc' 
  },
  btn: { 
    marginTop: 10 
  },
  linkContainer: {
    marginVertical: 15,
    alignItems: 'center'
  },
  linkText: {
    color: 'gray'
  }
});