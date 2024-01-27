/**
 * Divelogs App
*/
import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules } from 'react-native';

import { Dive } from './models';
import { getDBConnection, getDives, getBearerToken, saveDives, writeBearerToken, saveCertifications, updateDB, saveGearItems, saveSettings, saveStatistics, getImperial } from './services/db-service';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo, diveicon, certicon, staticon, gearicon } from './assets/svgs.js'
import { StatisticsView } from './components/StatisticsView';
import { Certifications } from './components/Certifications';
import { GearView} from './components/GearItemsView';
import './translation'
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Api } from './services/api-service'
import Dives from './components/dives'
import Onboarding from './components/onboarding'
import DiveDetail from './components/divedetail'


import Index from './components'

import styles from './stylesheets/styles'


const App = () => {
  const [isLoading, setLoading] = useState(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState('DESC');
  const [bearerToken, setbearerToken] = useState('');
//  const [sortindicator, setSortindicator] = useState('↑');
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dbversion, setDbVersion] = useState<number>(0);
  const [imperial, setImperial] = useState<boolean>(false);

//
  
  const { t } = useTranslation(); 


  const DBCheck = useCallback(async () => {
    try {
        const res = await updateDB();
        setDbVersion(res);
        ImperialCheck();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const ImperialCheck = useCallback(async () => {
    try {
        const imp = await getImperial();
        setImperial(imp);
    } catch (error) {
      console.error(error);
    }
  }, []);



  // This gets called before the component renders. In case DB Updates are needed
  useLayoutEffect(() => {
    DBCheck();
  }, []);

  return (
    <NavigationContainer> 
      <Index></Index>
    </NavigationContainer>)
};

export default App; 
