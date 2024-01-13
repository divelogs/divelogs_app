/**
 * Divelogs App
*/
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Button,Image,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View,TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Platform } from 'react-native';
import { DiveListItem } from './components/DiveListItem';
import { Dive } from './models';
import { getDBConnection, getDives, getBearerToken, saveDives, writeBearerToken, saveCertifications } from './services/db-service';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from './assets/svgs.js'
//import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { DiveProfile } from './components/DiveProfile';
import { StatisticsView } from './components/StatisticsView';
import { Certifications } from './components/Certifications';
import './translation'
import { useTranslation } from 'react-i18next';
import SearchBar from 'react-native-search-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RNFetchBlob from "rn-fetch-blob";

const App = () => {
  const [isLoading, setLoading] = useState(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState('DESC');
  const [bearerToken, setbearerToken] = useState('');
  const [sortindicator, setSortindicator] = useState('↑');
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { config, fs } = RNFetchBlob;
  const PictureDir = fs.dirs.DocumentDir;

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

  const loadDataCallback = useCallback(async () => {
    try {
      const db = await getDBConnection();
      const storedDives = await getDives(db,sort,search);
      setDives(storedDives);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const toggleSort = async () => {
    if (sort == `DESC`) {
      setSort('ASC');  
      setSortindicator('↓');   
      const db = await getDBConnection();
      const storedDives = await getDives(db,'ASC', search);
      setDives(storedDives); 
    } else {
      setSort('DESC');
      setSortindicator('↑'); 
      const db = await getDBConnection();
      const storedDives = await getDives(db,'DESC', search);
      setDives(storedDives); 
    }   
  };

  const loadDataFromAPI = async (bearer:string) => {
    setLoading(true);
    try {
      if (typeof(bearer) != 'string') bearer = bearerToken;
      const response = await fetch('https://divelogs.de/api/dives/', {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + bearer
          }
      });
      const json = await response.json();
      if (response.status == 200) {
        const db = await getDBConnection();
        await saveDives(db, json);
        const storedDives = await getDives(db,sort,'');
        setDives(storedDives); 

        const certs = await fetch('https://divelogs.de/api/user/', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + bearer
            }
        });
        
        const certjson = await certs.json();
        if (certs.status == 200) {
          await saveCertifications(db, certjson.certifications);
        } else {
          Alert.alert('status is ' + certs.status);
        }
      } else {
        // Bearer Token is missing or invalid => Login
        setModalVisible(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = async (searchtext:string) => {
    console.log('search with ' + searchtext);
    setSearch(searchtext);
    const db = await getDBConnection();
    const storedDives = await getDives(db,sort,searchtext);
    setDives(storedDives);
  }

  const cancelSearch = async () => {
    setSearch('');
    try {
      const db = await getDBConnection();
      const storedDives = await getDives(db,sort,'');
      setDives(storedDives);
    } catch (error) {
      console.error(error);
    }
  }

  const doLogin = async () => {
    var data = new FormData()
    data.append('user', username);
    data.append('pass', password);
    const response = await fetch('https://divelogs.de/api/login/', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer ' + bearerToken
          },
          body: data
    });
    const json = await response.json();
    if (response.status == 200) {
      // get bearer token and store it
      setbearerToken(json.bearer_token);
      const db = await getDBConnection();
      const succ = await writeBearerToken(db,json.bearer_token);
      if (succ) {
        setModalVisible(false);
        loadDataFromAPI(json.bearer_token);
        return true;
      }
    } else {
      Alert.alert(json.error);
    }
  }

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  useEffect(() => {
    getCredentials();
  }, [getCredentials]);

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

  const swiperRef = useRef<any>({});
  
  const DiveList = ({navigation}:any) => {
    return (
      <View style={{flex:1, paddingBottom: 50, backgroundColor: '#FFFFFF'}}>
      <View style={styles.safeArea}>
        <View style={[styles.appTitleView]}>
          <View style={{ width:35, position: 'absolute', left: 10, top:-5 }}>
            <Button 
                onPress={() => {loadDataFromAPI(bearerToken)}}
                title='↺'
                color="#FFFFFF"
                accessibilityLabel="load from divelogs"
              />
          </View>
          <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />
          <View style={{ width:35, position: 'absolute', right: 10, top:-5 }}>
            <Button
                onPress={toggleSort}
                title={sortindicator}
                color="#FFFFFF"
                accessibilityLabel="change sorting"
              />
          </View>        
        </View>        
        <View>
          <FlatList
            data={dives} 
            ListHeaderComponent={ 
              <SearchBar
                placeholder="Search"
                //onChangeText={setSearch}
                onSearchButtonPress={doSearch}
                cancelButtonText='Reset'
                onCancelButtonPress={cancelSearch}
                showsCancelButton={true}
                autoCapitalize={'none'}
                text={search}
              /> 
            }
            renderItem={({item}) => (
              <TouchableOpacity key={item.id} onPress={() => {
                  let diveindex = dives.findIndex(obj => obj.id === item.id);
                  setDdstate(diveindex);
                  // setTimeout(()=>{
                  //     swiperRef.current.scrollToIndex({index: diveindex});
                  // }, 1);
                  navigation.navigate('DiveDetail', {diveId: item.id});        
                  }                  
                } >
                <DiveListItem Dive={item} />
              </TouchableOpacity>
            )}
          />
        </View>         
      </View>
      </View>
    );
  };

  const [ddstate, setDdstate] = useState<number>();

  const DiveDetail = ({navigation, route}:any) => {
    let diveindex = dives.findIndex(obj => obj.id === route.params.diveId);
    return (
      <>
        <StatusBar key={ddstate} backgroundColor={'#3fb9f2'} />
         <View style={[styles.appTitleView]}>
         <View style={{ width:50, position: 'absolute', left: 0, top: -5 }}>
             <Button
                 title="←"
                 color={'white'}                
                 onPress={() =>
                   navigation.navigate('Dives')
                 }
               />
           </View>
           <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />             
         </View>
         <View style={divepagestyles.container} >
          <SwiperFlatList  ref={swiperRef} key={orientation} index={diveindex} renderAll={false} data={dives}
            renderItem={({ item }) => (             
            <ScrollView>
              <View style={[divepagestyles.bg, divepagestyles.child]}>                
                <View style={divepagestyles.numberdatebox}>
                  <View style={divepagestyles.numberbox}>
                    <Text style={divepagestyles.white}>{item.divenumber}</Text>
                  </View>
                  <Text style={divepagestyles.datetext1}>{makeDateObj(item.divedate).toLocaleString(locale, {weekday: 'long'})}</Text>
                  <Text style={divepagestyles.datetext2}>{makeDateObj(item.divedate).toLocaleString(locale, {day: 'numeric', month: 'long'})}</Text>
                  <Text style={divepagestyles.datetext3}>{makeDateObj(item.divedate).toLocaleString(locale, {year: 'numeric'})}</Text>
                </View>
                <View style={divepagestyles.locationbox}>
                  <View style={divepagestyles.entry}>
                    <Text style={divepagestyles.desc}>{t("location")}: </Text>
                    <Text style={divepagestyles.text}>{item.location}</Text>
                  </View>
                  <View style={divepagestyles.entry}>
                      <Text style={divepagestyles.desc}>{t("divesite")}: </Text>
                      <Text style={divepagestyles.text}>{item.divesite}</Text>
                  </View>
                  <View style={divepagestyles.entry}>
                    <Text style={divepagestyles.desc}>{t("buddy")}: </Text>
                    <Text style={divepagestyles.text}>{item.buddy}</Text>
                  </View>
                  <View style={divepagestyles.entry}>
                    <Text style={divepagestyles.desc}>{t("boat")}: </Text>
                    <Text style={divepagestyles.text}>{item.boat}</Text>
                  </View>
                </View>
                <View style={divepagestyles.profileblock} >
                  <Image style={divepagestyles.profileback} source={require('./assets/profile.png')} />
                  <Text style={{position: 'absolute', top:6, left:18}}>{item.divetime.substr(0,5)}</Text>
                  <Text style={{position: 'absolute', top:6, left:299}}>{makeendtime(item.divetime, item.duration)}</Text>
                  <Text style={{position: 'absolute', top:80, left:18}}>{item.maxdepth} m</Text>
                  <Text style={{position: 'absolute', top:104, left:18}}>{item.meandepth} m</Text>
                  <Text style={{position: 'absolute', top:6, left:140}}>{rendertemp(item.airtemp)}</Text>
                  <Text style={{position: 'absolute', top:51, left:140}}>{rendertemp(item.surfacetemp)}</Text>
                  <Text style={{position: 'absolute', top:150, left:140}}>{rendertemp(item.depthtemp)}</Text>
                  <Text style={{position: 'absolute', top:176, left:115}}>{secondstotime(item.duration)}</Text>
                </View>
                <View>
                <View style={divepagestyles.fullwidthentry}><Text style={divepagestyles.desc}>{t("notes")}: </Text><Text>{item.notes}</Text></View>    
                </View>

                <DiveProfile SampleData={{sampledata: item.sampledata, samplerate: item.samplerate, duration: item.duration, height: width*0.7, width: width*0.98, lines: true, forlist: false }} /> 
              </View>
              </ScrollView>

            )} />
    
        </View>         
      </>
    )
  };

  const { width } = Dimensions.get('window');

  const divepagestyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    child: { width: width, justifyContent: 'center', padding: 5 },
    profileblock: {
      width:350,
      height:200,
      marginLeft:5,
      marginTop:20,
      marginBottom: 20,
    },
    profileitem: {
      position: 'absolute'
    },
    profileback: {
      width:350,
      height:200
    },
    bg: {
      backgroundColor: '#FFFFFF'
    },
    locationbox: {
      width: width-190
    },
    numberdatebox: {
      borderRadius: 5,
      backgroundColor: '#eaf3f7',
      position: 'absolute',
      right: 10,
      top: 10,
      height: 60,
      width: 170,
      justifyContent: 'center',
      textAlign: 'center',
      paddingRight: 50
    },

    entry: {
      marginTop: 5,
      marginBottom: 5,
      paddingLeft: 5,
      flexDirection: 'row',
      flex: 1,
    },
    desc: {
      color: '#39ade2',     
    },
    text: {
      flexWrap: 'wrap',
      flexShrink: 1,
    },
    fullwidthentry: {
      marginTop: 10,
      paddingLeft: 5,
      paddingRight: 10,
      width: width-10
    },
    datetext1: {
      textAlign: 'center',
      color: '#39ade2'
    },
    datetext2: {
      textAlign: 'center',
      color: '#000000'
    },
    datetext3: {
      textAlign: 'center',
      color: '#39ade2',
      fontSize: 17,
      fontWeight: '500'
    },
    numberbox : {
      borderRadius: 4,
      backgroundColor: '#39ade2',
      position: 'absolute',
      right: 3,
      top: 3,
      height: 54,
      width: 50,
      justifyContent: 'center',
      textAlign: 'center'
    },
    white: {
      width: 50,
      color: '#FFFFFF',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 18
    }
  });

  //const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  const BottomNavigation = ()=> {
    return (
      <Tab.Navigator screenOptions={{
        tabBarStyle: { backgroundColor: '#3fb9f2'}
      }}>
        <Tab.Screen name="Dives" component={DiveList} options={{ 
          title: t("dives"),
          headerShown: false, 
          tabBarActiveTintColor: '#FFFFFF', 
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarLabelStyle: {fontSize: 14},
          tabBarIcon: ({size,focused,color}) => {
            return (
              <Image
                style={{ width: 40, height: 25.6 }}
                source={require('./assets/diver.png')}
              />
            );
          }
        }} />
        <Tab.Screen name="DiveDetail" component={DiveDetail} options={{ 
          tabBarButton: () => null, // hide from TabBar
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF', 
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarLabelStyle: {fontSize: 14}
        }} />
        <Tab.Screen name="Certifications" component={Certifications} options={{ 
          title: t("certifications"),
          headerShown: false, 
          tabBarActiveTintColor: '#FFFFFF', 
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarLabelStyle: {fontSize: 14},
          tabBarIcon: ({size,focused,color}) => {
            return (
              <Image
                style={{ width: 30, height: 20, marginTop:3 }}
                source={require('./assets/certification.png')}
              />
            );
          }
        }} />
        <Tab.Screen name="Statistics" component={StatisticsView} options={{ 
          title: t("statistics"),
          headerShown: false, 
          tabBarActiveTintColor: '#FFFFFF', 
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarLabelStyle: {fontSize: 14},
          tabBarIcon: ({size,focused,color}) => {
            return (
              <Image
                style={{ width: 30, height: 20, marginTop:3 }}
                source={require('./assets/statistics.png')}
              />
            );
          }
        }} />

      </Tab.Navigator>
    );
  }

  return (
    <>
    {isLoading ? (
      <>        
        <SafeAreaView style={{ flex:0, backgroundColor: '#3fb9f2', height:30 }} />
        <View style={[styles.appTitleView]}>
          <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />
        </View>  
        <View style={styles.centeredView}>
          <Text style={{height: 50, textAlign:'center'}}>Loading your data from divelogs...</Text>     
          <ActivityIndicator />
        </View>
      </>
    ) : (
    <>
    <NavigationContainer>       
      <SafeAreaView style={{ flex:0, backgroundColor: '#3fb9f2', height:30 }} />
      <BottomNavigation />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Please log in to divelogs</Text>
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
    
    </>
    )}
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logininputs: {
    width:200,
    height:30,
    fontSize:16,
    borderRadius: 5,
    borderWidth:1,
    borderColor: '#000000',
    marginBottom:5
  }, 
  button: {
    borderRadius: 5,
    backgroundColor: '#3fb9f2',
    padding: 10,
    elevation: 2,
  },  
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  tinyLogo: {
    width:150,
    height:34
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  appTitleView: {
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#3fb9f2'
  }
});

const makeDateObj = (date:string) => {
  return new Date(date);
}

const rendertemp = (temp:number) => {
  if (temp==0 || temp==undefined || temp==null) return '';
  else return temp+' °C'
}

const makeendtime = (timeString:string, seconds:number) => {
  var d = new Date('1970-01-01T' + timeString );
  d.setSeconds(d.getSeconds() + seconds);
  return d.toTimeString().substring(0,5);
}

const secondstotime = (seconds:number) => {
  var d = new Date('1970-01-01T00:00:00' );
  d.setSeconds(d.getSeconds() + seconds);
  return d.toTimeString().substring(0,8);
}

export default App; 

