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

const BlueScreen = ({navigation}:any) => {

  const bearerTokenAvailableAndValid = async (db:any) : Promise<boolean> => 
  {
    const res = await getBearerToken(db);
    console.log(res)

    if (!res)
      return false;

    return await Api.isBearerTokenValid(res)
  }

  useEffect(() => {

    (async () => {
      const db = await getDBConnection();
      const profile = await getProfile(db);

      if (!profile)
        return navigation.navigate("Login")

      const isOnline = await Api.isApiAvailable()

      if (!isOnline)
        return navigation.reset({index: 0, routes: [{ name: 'Home'}]})

      const bearerAvailable = await bearerTokenAvailableAndValid(db)

      if (!bearerAvailable)
        return navigation.navigate("Login")

      const isSyncForced = await getSyncForced();
      console.log("--->" + isSyncForced)
      if (isSyncForced)
        return navigation.navigate("Sync")
      
      navigation.reset({index: 0, routes: [{ name: 'Home'}]})
    })()

  }, [])

  return (
    <View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
    <SvgXml xml={diveicon}/>
    </View> 
  );
};

export default BlueScreen

