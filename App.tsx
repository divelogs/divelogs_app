/**
 * Divelogs App
*/
import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules } from 'react-native';

import { Dive } from './models';
import { getDBConnection, getDives, getBearerToken, saveDives, writeBearerToken, saveCertifications, updateDB, saveGearItems, saveSettings, getImperial } from './services/db-service';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo, diveicon, certicon, staticon, gearicon } from './assets/svgs.js'
import { StatisticsView } from './components/StatisticsView';
import { Certifications } from './components/Certifications';
import { GearView} from './components/GearItemsView';
import './translation'
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Api } from './services/api-service'
import Dives from './components/dives'
import DiveDetail from './components/divedetail'


import styles from './stylesheets/styles'

const BottomNavigation = ({imperial, loadDataFromAPI}:any)=> {
  //const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();
  const { t } = useTranslation(); 

  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: { backgroundColor: '#3fb9f2'}
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
        {(props) => <Dives {...props} refreshApiData={loadDataFromAPI}/>}
      </Tab.Screen>
      <Tab.Screen name="DiveDetail" options={{ 
        tabBarButton: () => null, // hide from TabBar
        headerShown: false,
        tabBarActiveTintColor: '#FFFFFF', 
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {fontSize: 14}
      }}>
        {(props) => <DiveDetail {...props} imperial={imperial}/>}
      </Tab.Screen>
      <Tab.Screen name="Certifications" component={Certifications} options={{ 
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
          headerShown: false, 
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
        headerShown: false, 
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
  );
}

const App = () => {
  const [isLoading, setLoading] = useState(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState('DESC');
  const [bearerToken, setbearerToken] = useState('');
  const [sortindicator, setSortindicator] = useState('↑');
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dbversion, setDbVersion] = useState<number>(0);
  const [imperial, setImperial] = useState<boolean>(false);

  const [search, setSearch] = useState('');
  

  const { t } = useTranslation(); 
  
  // used for localization of dates via toLocaleString(locale, options); in <SwiperFlatList> in DiveDetail. Returns ex. 'de-DE' instead of 'de_DE'
  const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
               NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

  const getCredentials = useCallback(async () => {
    try {
      const db = await getDBConnection();
      const res = await getBearerToken(db);
      setbearerToken(res);
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

      if (bearerToken == null){
        setModalVisible(true);
        return;
      }

      Api.setBearerToken(bearerToken)

      const apiDives: any = await Api.getDives()

      // null occurs when no data could be retrieved
      if(apiDives == null) {
        setModalVisible(true);
      }

      if (!apiDives || apiDives.length == 0) 
        return;

      const db = await getDBConnection();
      await saveDives(db, apiDives);
      const storedDives = await getDives(db,sort,'');
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
      const db = await getDBConnection();
      const succ = await writeBearerToken(db, loginResult.bearerToken);

      if (succ){
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
