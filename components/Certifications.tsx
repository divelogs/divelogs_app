import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, FlatList, NativeModules, StyleSheet, Button, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Certification } from '../models';
import { getDBConnection, getCertifications } from '../services/db-service';
import RNFetchBlob from "rn-fetch-blob";
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../assets/svgs.js'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

import '../translation'
import { useTranslation } from 'react-i18next';

import AppHeader from './generic/divelogsheader';

export const Certifications = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

  const { t } = useTranslation(); 
   
  const { config, fs } = RNFetchBlob;
  const PictureDir = fs.dirs.DocumentDir;

  const loadCertifications = useCallback(async () => {
    try {
      const db = await getDBConnection();
      const certs = await getCertifications(db);
      setCertifications(certs);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadCertifications();
  }, []);

  const Overview = ({navigation}:any) => {
    return (
      <>
      <View style={{ flex: 1, padding: 16, paddingBottom: 0, paddingRight: 0, backgroundColor: '#FFFFFF' }}>     
      <Text style={styles.listHeader}>{t('certifications')}</Text>  
        <FlatList
          data={certifications}
          ListEmptyComponent={<View style={{justifyContent: 'center', alignItems: 'center',}}><Text>{t('nocerts')}</Text></View>}             
          renderItem={({item}) => (
            <>
            <Text style={styles.bold}>{item.org} {item.name}</Text>
            <Text>{makeDateObj(item.certdate).toLocaleString(locale, {day: '2-digit', month:'2-digit', year: 'numeric'})}</Text>
            <View style={{flexDirection: 'row', marginBottom: 30}}>
            {item.scans.map((scan) => {
                const thekey = Object.keys(allscans).find(key => allscans[parseInt(key)] === scan);
                return (      
                  <View key={scan}>  
                    <TouchableOpacity key={item.id} onPress={() =>
                        navigation.navigate('CertificationScans', {thekey: thekey})
                      } >                     
                      <Image source = {{uri: "file://" + PictureDir + scan, width: 150, height: 150}} style={{marginRight: 10}}/>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>  
            </>
          )}
        />
      </View>
      </>
    )
  }

  const allscans:string[] = [];
  for (var cert of certifications) {
    for (var scan of cert.scans) {
      allscans.push(scan);
    }
  }

  // Use this const as key of the SwiperFlatList to enforce re-render on orientation-change
  const [orientation, setOrientation] = useState('');
  const { width } = Dimensions.get('window');

  useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
      if (width<height) {
        setOrientation("PORTRAIT")
      } else {
        setOrientation("LANDSCAPE")    
      }
    })
  }, []);

  const win = Dimensions.get('window');
  const sliderstyles = StyleSheet.create({
    image: {
      flex: 1,
      alignSelf: 'stretch',
      width: win.width,
      height: win.height,
    }
  });

  const Scanslider = ({navigation, route}:any) => {
    const thekey = route.params.thekey
    return (
      <>  
      <View style={{ flex: 1, }}>       
        <SwiperFlatList key={orientation} index={thekey} renderAll={true} data={allscans} renderItem={({ item }) => (
            <View style={{ justifyContent: 'center'}}>
              <Image style={sliderstyles.image} resizeMode={'contain'} source = {{uri: "file://" + PictureDir + item}}/>
            </View>
          )} />
      </View>
      </>
    )
  }

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#3fb9f2'},
          headerTitle: () => <AppHeader/>,
          headerTintColor: '#fff'
        }}>
          <Stack.Screen name="CertificationHome" component={Overview} options={{ 
            headerShown: true,
            title: t("certifications")       
          }}/>
          <Stack.Screen name="CertificationScans" component={Scanslider} options={{ 
            headerShown: true          
          }}/>
      </Stack.Navigator>    
    </View>
  );
};

const styles = StyleSheet.create({
  tinyLogo: {
    width:150,
    height:34
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  bold: {
    fontWeight: "700"
  },
  appTitleView: {
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#3fb9f2'
  },
  listHeader: {
    fontSize: 25,    
    fontWeight: '700',
    marginTop: 5,
    marginLeft: 0,
    marginBottom: 15,
    color: '#3eb8f1'
  },
});

const makeDateObj = (date:string) => {
  return new Date(date);
}

export default Certifications