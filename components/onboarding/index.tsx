import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Button, View, Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import React, { useState, useEffect } from 'react';
import { getDBConnection, getBearerToken, getProfile, getSyncForced } from '../../services/db-service';
import { Api } from '../../services/api-service';

import { diveicon } from '../../assets/svgs.js'


import styles from '../../stylesheets/styles'
import Sync from './sync'
import Login from './login'
import BlueScreen from './landing'
import SyncFail from './syncfail'
import Dev from './dev'

const Onboarding = ({navigation}:any) => {

  const bearerTokenAvailableAndValid = async (db:any) : Promise<boolean> => 
  {
    const res = await getBearerToken(db);

    if (!res)
      return false;

    return await Api.isBearerTokenValid(res)
  }

  const checkSyncRequired = async () : Promise<boolean> => {
    return false;
  }


  const Stack = createNativeStackNavigator();

  return (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            animation: 'fade_from_bottom'
          }}
        >

        <Stack.Screen name="BlueScreen" component={BlueScreen} options={{ }}/>
        
        <Stack.Screen name="SyncFail" component={SyncFail} options={{ }}/>

        <Stack.Screen name="Login" component={Login} options={{ }} />

        <Stack.Screen name="Sync" component={Sync} options={{ }} />

        <Stack.Screen name="Dev" component={Dev} options={{ }}/>
      </Stack.Navigator>   
  );
};

export default Onboarding

