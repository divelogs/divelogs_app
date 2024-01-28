import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules } from 'react-native';

import { SvgXml } from 'react-native-svg';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { divelogs_logo, diveicon, certicon, staticon, gearicon } from '../assets/svgs.js'
import '../translation'
import { useTranslation } from 'react-i18next';

import StatisticsView from './StatisticsView';
import Certifications from './Certifications';
import Dives from './dives'
import GearView from './GearItemsView';
import Onboarding from './onboarding';

import AppHeader from './generic/divelogsheader'

const BottomNavigation = ({}:any)=> {

  const Tab = createBottomTabNavigator();
  const { t } = useTranslation(); 

  const imperial = false;

  return (<>
    <Tab.Navigator screenOptions={{
      tabBarStyle: { backgroundColor: '#3fb9f2'},
      headerStyle: { backgroundColor: '#3fb9f2'},
      headerTitle: () => <AppHeader/>
    }}>
      <Tab.Screen name="Dives" options={{ 
        title: t("dives"),
        headerShown: false, 
        tabBarActiveTintColor: '#FFFFFF', 
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {fontSize: 14},
        tabBarIcon: ({size,focused,color}) => {
          return (
            <SvgXml xml={diveicon} width="40" height="25"/>
          );
        }
      }}>
        {(props) => <Dives {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Certifications"  component={Certifications} options={{ 
        title: t("certifications"),
        headerShown: false, 
        tabBarActiveTintColor: '#FFFFFF', 
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {fontSize: 14},
        tabBarIcon: ({size,focused,color}) => {
          return (
            <SvgXml xml={certicon} width="40" height="25"/>
          );
        }
      }} />
      <Tab.Screen name="Statistics" 
        component={StatisticsView} 
        initialParams={{ imperial: imperial }}
        options={{ 
          title: t("statistics"),
          headerShown: true, 
          tabBarActiveTintColor: '#FFFFFF', 
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarLabelStyle: {fontSize: 14},
          tabBarIcon: ({size,focused,color}) => {
            return (
              <SvgXml xml={staticon} width="40" height="25"/>
            );
          }
        }} />
      <Tab.Screen name="GearItems" component={GearView} options={{ 
        title: t("gearitems"),
        headerShown: true, 
        tabBarActiveTintColor: '#FFFFFF', 
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {fontSize: 14},
        tabBarIcon: ({size,focused,color}) => {
          return (
            <SvgXml xml={gearicon} width="40" height="25"/>
          );
        }
      }} />   
    </Tab.Navigator>
    </>
  );
}


const AppNavigation = () => {
    const Stack = createNativeStackNavigator();

    return <>
        <Stack.Navigator screenOptions={{
            headerShown: false,
            animation: "none"
        }}>
            <Stack.Screen name="Onboarding">
                {(props) => <Onboarding {...props}/>}
            </Stack.Screen>  
            <Stack.Screen name="Home">
                {(props) => <BottomNavigation {...props}/>}
            </Stack.Screen>          
        </Stack.Navigator>
    </>
}

export default AppNavigation