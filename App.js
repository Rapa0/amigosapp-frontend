import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, createTheme } from '@rneui/themed';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

LogBox.ignoreLogs([
  'Each child in a list should have a unique "key" prop',
]);

const theme = createTheme({
  lightColors: {
    primary: '#6C63FF',    
    secondary: '#FF6584',  
    background: '#F8F9FC',
    grey0: '#E5E7EB',     
    grey1: '#9CA3AF',     
  },
  components: {
    Button: {
      buttonStyle: {
        borderRadius: 30, 
        paddingVertical: 14,
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5, 
      },
      titleStyle: {
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'System', 
      },
    },
    Input: {
      inputContainerStyle: {
        borderBottomWidth: 0, 
        backgroundColor: '#F3F4F6', 
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
      },
      containerStyle: {
        paddingHorizontal: 0,
        marginBottom: 5
      }
    },
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}