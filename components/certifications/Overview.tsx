import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, NativeModules, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, Dimensions, useColorScheme } from 'react-native';
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
  
    const locale =
    (Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
      : NativeModules.I18nManager.localeIdentifier).replace("_","-");
  
    const { width, height } = Dimensions.get('window')


    const { t } = useTranslation(); 
     
    const { config, fs } = RNFetchBlob;
    const PictureDir = fs.dirs.DocumentDir;

    const theme = useColorScheme();
    const styles = StyleSheet.create({
      page: {
        backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909' ),
        color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
        flex: 1,
        paddingBottom: 0, 
        paddingRight: 0
      },
      text: {
        color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
      },
      bold: {
        fontWeight: "700"
      },
      desc: {
        fontSize: 16,
        fontWeight: '500',
        width: '70%',
        flex: 3,
        marginBottom: 4,
        color: (theme == 'light' ? '#000000' : '#FFFFFF' )
      },
      date: {
        flex: 1,
        color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
        marginBottom: 10
      }
    });

  
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

    const itemCountPerline:number = 2
    const ratio:number = 85.6 / 53.98
    const brevetWidth:number = (Math.min(width,height) - 40) /itemCountPerline
    const brevetHeight:number = brevetWidth / ratio

      return (

        <View style={styles.page}>     
        <Text style={divelogsStyles.viewHeader}>{t('certifications')}</Text>  
          <FlatList
            style={{paddingHorizontal: 10}}
            data={certifications}
            ListEmptyComponent={<View style={[divelogsStyles.noListContent]}><Text style={[divelogsStyles.noListContentText]}>{t('nocerts')}</Text></View>}             
            renderItem={({item}) => (
              <>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.desc}>{item.org} {item.name}</Text>
                  <Text style={styles.date}>{makeDateObj(item.certdate).toLocaleString(locale, {day: '2-digit', month:'2-digit', year: 'numeric'})}</Text>

                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{flexDirection: 'row', marginBottom: 25}}>
                {item.scans.map((scan) => {
                    const thekey = Object.keys(allScans).find(key => allScans[parseInt(key)] === scan);
                    return (      
                      <View key={scan}>
                        <TouchableOpacity key={item.id} onPress={() =>
                            navigation.navigate('CertificationScans', {thekey: thekey, allScans: allScans})
                          } >                     
                          <Image source = {{uri: "file://" + PictureDir + scan, width: brevetWidth, height: brevetHeight}} style={{marginRight: 5, borderRadius: 6 }}/>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>  
              </>
            )}
          />
        </View>

      )
  };
  
  

export default Overview