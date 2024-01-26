import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Button, View, Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import React, { useState, useEffect } from 'react';
import { getDBConnection, getBearerToken } from '../../services/db-service';


import { diveicon } from '../../assets/svgs.js'


import styles from '../../stylesheets/styles'
import Sync from './sync'
import Login from './login'

const Onboarding = ({navigation}:any) => {


  const bearerTokenAvailableAndValid = async () : Promise<boolean> => 
  {
    const db = await getDBConnection();
    const res = await getBearerToken(db);

    if (!res)
      return false;

    return false
    //validate

    return true;
  }

  const checkSyncRequired = async () : Promise<boolean> => {
    return false;
  }



  useEffect(() => {

    (async () => {
      const bearerAvailable = await bearerTokenAvailableAndValid()
      if (!bearerAvailable) 
        navigation.navigate("Login")
    })()

  }, [])


  const Stack = createNativeStackNavigator();

  return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}
        >
        <Stack.Screen name="BlueScreen" options={{ }}>
          {(props) => <View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
            <SvgXml xml={diveicon}/>
            </View>}
        </Stack.Screen>  

        <Stack.Screen name="Login" component={Login} options={{ }} />

        <Stack.Screen name="Sync" component={Sync} options={{ }} />

      </Stack.Navigator>   
  );
};

export default Onboarding

