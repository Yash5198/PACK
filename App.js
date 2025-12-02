// App.js - Updated with Authentication and Loading Screen
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthService } from './services/AuthService';
import LoadingScreen from './screens/LoadingScreen';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import MainApp from './MainApp';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Landing');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user = await AuthService.checkAuthStatus();
      
      if (user) {
        setIsAuthenticated(true);
        setInitialRoute('MainApp');
      } else {
        setIsAuthenticated(false);
        setInitialRoute('Landing');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setInitialRoute('Landing');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication state changes
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    AuthService.logout();
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
            overlayStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
                extrapolate: 'clamp',
              }),
            },
          }),
        }}
      >
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        
        <Stack.Screen 
          name="Login" 
        >
          {(props) => (
            <LoginScreen 
              {...props} 
              onLogin={handleLogin}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen 
          name="MainApp" 
          options={{
            gestureEnabled: false,
          }}
        >
          {(props) => (
            <MainApp 
              {...props} 
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
