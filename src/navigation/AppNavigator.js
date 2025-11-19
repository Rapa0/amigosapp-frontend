import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="Mensajes" component={ChatListScreen} />
      <ChatStack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <ChatStack.Screen name="ChatDetails" component={ChatDetailsScreen} options={{ title: 'Información' }} />
      <ChatStack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Solicitud' }} />
    </ChatStack.Navigator>
  );
}

const getTabBarIcon = (routeName, color, size) => {
  let iconName;
  if (routeName === 'Descubrir') iconName = 'search';
  else if (routeName === 'Chats') iconName = 'chat';
  else if (routeName === 'Perfil') iconName = 'person';
  return <Icon name={iconName} type="material" size={size} color={color} />;
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => getTabBarIcon(route.name, color, size),
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Descubrir" component={FindFriendsScreen} />
      <Tab.Screen name="Chats" component={ChatStackScreen} />
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authState.token ? (
          perfilIncompleto ? (
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
          ) : (
            <>
              <Stack.Screen name="Home" component={HomeTabs} />
              <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen} 
                options={{ headerShown: true, title: 'Editar Perfil' }} 
              />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyToken" component={VerifyTokenScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}