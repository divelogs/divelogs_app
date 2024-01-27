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

  const getCredentials = useCallback(async () => {
    try {
      const db = await getDBConnection();
      const res = await getBearerToken(db);

      if (res?.length > 0){
        Api.setBearerToken(res)
        setbearerToken(res);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

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

  const loadDataCallback = useCallback(async () => {
    try {


    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadDataFromAPI = async () => {

    try {
      setLoading(true);

      if (bearerToken?.length == 0){
        setModalVisible(true);
        return;
      }     

      console.log("-->" + bearerToken)

      const apiDives: any = await Api.getDives()

      // null occurs when no data could be retrieved from the API
      if(apiDives == null) {
        console.log('apiDives is null');
        setModalVisible(true);
      }

      if (!apiDives || apiDives.length == 0 || apiDives == null) 
        return;

      const db = await getDBConnection();
      await saveDives(db, apiDives);
      const storedDives = await getDives(db,sort,'');

      await saveStatistics(db, storedDives);

      setDives(storedDives); 
      
      const userSettings:any = await Api.getUserSettings()
      const certifications:any = await Api.getCertifications()
      const gearitems = await Api.getGear()
      
      await saveCertifications(db, certifications);
      await saveSettings(db, userSettings.imperial, userSettings.startnumber);
      await saveGearItems(db, gearitems);
      setImperial(userSettings.imperial);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const doLogin = async () => {

    const loginResult = await Api.login(username, password)

    if (loginResult.success)
    {
      setbearerToken(loginResult.bearerToken);
      Api.setBearerToken(loginResult.bearerToken);
      const db = await getDBConnection();
      const succ = await writeBearerToken(db, loginResult.bearerToken);

      if (succ) {
        setModalVisible(false);
        loadDataFromAPI();
      }
    }
    else
      Alert.alert(loginResult.error);
  }

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  useEffect(() => {
    getCredentials();
  }, [getCredentials]);

  // This gets called before the component renders. In case DB Updates are needed
  useLayoutEffect(() => {
    DBCheck();
  }, []);


  // Use this const as key of the SwiperFlatList to enforce re-render on orientation-change
  const [orientation, setOrientation] = useState('');
  useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
      if (width<height) {
        setOrientation("PORTRAIT")
      } else {
        setOrientation("LANDSCAPE")    
      }
    })
  }, []);


  const { width } = Dimensions.get('window');

  if (isLoading)
    return (<>        
        <SafeAreaView style={{ flex:0, backgroundColor: '#3fb9f2', height:30 }} />
        <View style={[styles.appTitleView]}>
          <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />
        </View>  
        <View style={styles.centeredView}>
          <Text style={{height: 50, textAlign:'center'}}>{t('loading')}</Text>     
          <ActivityIndicator />
        </View>
      </>)

  return (
    <NavigationContainer> 
      <Index></Index>
    </NavigationContainer>)




  return (
    <NavigationContainer>       
      <SafeAreaView style={{ flex:0, backgroundColor: '#3fb9f2', height:30 }} />


      <BottomNavigation imperial={imperial} loadDataFromAPI={loadDataFromAPI} />
      
      
      

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{t('login')}</Text>
            <TextInput placeholder="username" style={styles.logininputs} onChangeText={newText => setUsername(newText)} autoCapitalize="none"></TextInput>
            <TextInput placeholder="password" secureTextEntry={true} style={styles.logininputs} onChangeText={newText => setPassword(newText)}></TextInput>
            <Pressable
              style={styles.button}
              onPress={() => doLogin()}>
              <Text style={styles.textStyle}>Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>       
    </NavigationContainer>
  );
};

export default App; 
