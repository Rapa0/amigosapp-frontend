import React, { useContext } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FindFriendsScreen from '../screens/FindFriendsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyTokenScreen from '../screens/VerifyTokenScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import ChatDetailsScreen from '../screens/ChatDetailsScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import ConfirmAccountScreen from '../screens/ConfirmAccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
  },
};

function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="Mensajes" component={ChatListScreen} />
    </ChatStack.Navigator>
  );
}

const getTabBarIcon = (routeName, focused, color, size) => {
  let iconName;
  let iconType = 'material';

  if (routeName === 'Descubrir') {
      iconName = 'style'; 
      iconType = 'material';
  } else if (routeName === 'Chats') {
      iconName = 'chat-bubble';
  } else if (routeName === 'Perfil') {
      iconName = 'person';
  }

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
        <Icon name={iconName} type={iconType} size={24} color={focused ? 'white' : color} />
    </View>
  );
};

function HomeTabs() {
  const { notificaciones } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#BDBDBD',
      })}
    >
      <Tab.Screen name="Descubrir" component={FindFriendsScreen} />
      <Tab.Screen name="Chats" component={ChatStackScreen} options={{ tabBarBadge: notificaciones > 0 ? notificaciones : null, tabBarBadgeStyle: { backgroundColor: '#FF6584', color: 'white', fontSize: 10, fontWeight: 'bold' } }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { authState } = useContext(AuthContext);

  if (authState.isLoading) return null;
  const user = authState.user;
  const perfilIncompleto = user && (!user.edad || !user.descripcion || !user.genero);

  return (
    <NavigationContainer theme={MyTheme}> 
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.token ? (
          perfilIncompleto ? (
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeTabs} />
              <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: 'Editar Perfil', headerShadowVisible: false }} />
              <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ headerShown: false }} />
              <Stack.Screen name="ChatDetails" component={ChatDetailsScreen} options={{ headerShown: true, title: 'Información', headerBackTitleVisible: false }} />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ConfirmAccount" component={ConfirmAccountScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyToken" component={VerifyTokenScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    tabBar: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: 'white', borderRadius: 25, height: 80, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, borderTopWidth: 0, paddingBottom: Platform.OS === 'ios' ? 20 : 15, paddingTop: 0 },
    tabLabel: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
    iconContainer: { justifyContent: 'center', alignItems: 'center', width: 40, height: 40, borderRadius: 20, marginTop: 10 },
    iconContainerFocused: { backgroundColor: '#6C63FF', elevation: 5, shadowColor: '#6C63FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, marginTop: 0, transform: [{ translateY: -5 }] }
});