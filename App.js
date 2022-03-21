import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './app/context_api/AuthContext';
import StackNavigator from './app/components/StackNavigator';
import * as Calendar from 'expo-calendar';
import * as ImagePicker from 'expo-image-picker';


export default function App() {
  // Kolla permissions.
  useEffect(() => {
    (async () => {
      await Calendar.requestCalendarPermissionsAsync();
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}

