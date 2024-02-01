import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Button, View, Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import React, { useState, useEffect } from 'react';
import { getDBConnection, getBearerToken, getProfile, getSyncForced } from '../../services/db-service';
import { Api } from '../../services/api-service';

import { diveicon } from '../../assets/svgs.js'


import divelogsStyle from '../../stylesheets/styles'

import Sync from './sync'
import Login from './login'

const BlueScreen = ({navigation}:any) => {

  const bearerTokenAvailableAndValid = async (db:any) : Promise<boolean> => 
  {
    const res = await getBearerToken(db);

    if (!res)
      return false;

    return await Api.isBearerTokenValid(res)
  }

  useEffect(() => {

    (async () => {
      const db = await getDBConnection();
      const profile = await getProfile(db);

      if (!profile)
        return navigation.replace("Login")

      const isOnline = await Api.isApiAvailable()

      if (!isOnline)
        return navigation.replace('Home')

      const bearerAvailable = await bearerTokenAvailableAndValid(db)

      if (!bearerAvailable)
        return navigation.replace("Login")

      const isSyncForced = await getSyncForced();

      if (isSyncForced)
        return navigation.replace("Sync")
      
      navigation.replace('Home', { screen: 'Dives', firstLoad: 'true' })
    })()

  }, [])

  return (
    <View style={[divelogsStyle.centeredView, {backgroundColor:'#3fb9f2'}]}>
      <View style={{height: 100, width: '100%', marginTop: -30}}>
        <SvgXml xml={diveicon} height={100}/>
      </View>
    </View> 
  );
};

export default BlueScreen

