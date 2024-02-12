
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '../../translation'
import { useTranslation } from 'react-i18next';
import AppHeader from '../generic/divelogsheader';
import Map from './MapsView';

export const Certifications = () => {

  const { t } = useTranslation(); 

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#3fb9f2'},
          headerTitle: () => <AppHeader/>,
          headerTintColor: '#fff',
          headerTitleAlign: 'center'
        }}>
          <Stack.Screen name="MapHome" component={Map} options={{ 
            headerShown: false,
            title: t("maps")       
          }}/>
      </Stack.Navigator>  
    </View>
  );
};

export default Certifications

