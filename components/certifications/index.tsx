
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '../../translation'
import { useTranslation } from 'react-i18next';
import AppHeader from '../generic/divelogsheader';
import Overview from './Overview';
import ScanSlider from './ScanSlider';

export const Certifications = () => {

  const { t } = useTranslation(); 

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#3fb9f2'},
          headerTitle: () => <AppHeader/>,
          headerTintColor: '#fff'
        }}>
          <Stack.Screen name="CertificationHome" component={Overview} options={{ 
            headerShown: true,
            title: t("certifications")       
          }}/>
          <Stack.Screen name="CertificationScans" component={ScanSlider} options={{ 
            headerShown: true          
          }}/>
      </Stack.Navigator>  
    </View>
  );
};

export default Certifications

