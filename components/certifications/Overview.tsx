import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, NativeModules, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Certification } from '../../models';
import { getDBConnection, getCertifications } from '../../services/db-service';
import RNFetchBlob from "rn-fetch-blob";
import { makeDateObj } from '../functions'
import '../../translation'
import { useTranslation } from 'react-i18next';

import divelogsStyles from '../../stylesheets/styles'

export const Overview = ({navigation}:any) => {

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [allScans, setAllScans] = useState<string[]>([]);
  
    const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

    const { t } = useTranslation(); 
     
    const { config, fs } = RNFetchBlob;
    const PictureDir = fs.dirs.DocumentDir;
  
    const loadCertifications = async () => {
      try {
        const db = await getDBConnection();
        const certs = await getCertifications(db);
        const as = certs.flatMap(a => a.scans)
        setCertifications(certs);
        setAllScans(as)
      } catch (error) {
        console.error(error);
      }
    };
  
    useEffect(() => {
      loadCertifications();
    }, []);
  
      return (
        <>
        <View style={{ flex: 1, paddingBottom: 0, paddingRight: 0, backgroundColor: '#FFFFFF' }}>     
        <Text style={divelogsStyles.viewHeader}>{t('certifications')}</Text>  
          <FlatList
            data={certifications}
            ListEmptyComponent={<View style={[divelogsStyles.noListContent]}><Text style={[divelogsStyles.noListContentText]}>{t('nocerts')}</Text></View>}             
            renderItem={({item}) => (
              <>
              <Text style={styles.bold}>{item.org} {item.name}</Text>
              <Text>{makeDateObj(item.certdate).toLocaleString(locale, {day: '2-digit', month:'2-digit', year: 'numeric'})}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexDirection: 'row', marginBottom: 30}}>
              {item.scans.map((scan) => {
                  const thekey = Object.keys(allScans).find(key => allScans[parseInt(key)] === scan);
                  return (      
                    <View key={scan}>
                      <TouchableOpacity key={item.id} onPress={() =>
                          navigation.navigate('CertificationScans', {thekey: thekey, allScans: allScans})
                        } >                     
                        <Image source = {{uri: "file://" + PictureDir + scan, width: 150, height: 150}} style={{marginRight: 10}}/>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>  
              </>
            )}
          />
        </View>
        </>
      )
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
    }
  });
  

export default Overview