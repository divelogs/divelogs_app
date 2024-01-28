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

import Diver from './components/onboarding/diveranimation'

import { Api } from './services/api-service'
import Dives from './components/dives'
import Onboarding from './components/onboarding'
import DiveDetail from './components/divedetail'


import Index from './components'

import styles from './stylesheets/styles'


const App = () => {

  const [firstLoad, setFirstLoad] = useState<string|undefined>("")

  return (<View style={{flex: 1, backgroundColor: '#3fb9f2'}}>
      <NavigationContainer
        onStateChange={(state) => {
          console.log(state)
          setFirstLoad(state?.routes[0].name)
          }}> 
        <Index/>
      </NavigationContainer>
      <Diver loaded={firstLoad} style={{position: 'absolute', top:0, left:0, width: '100%', height: '100%'}}/>
    </View>)
};

export default App; 
