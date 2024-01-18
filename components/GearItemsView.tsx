import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View, FlatList } from 'react-native';
import { getDBConnection, getGearItems } from '../services/db-service';
import { GearItemType } from '../models';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../assets/svgs.js'
import { Gear } from './GearItem'
import '../translation'
import { useTranslation } from 'react-i18next';

export const GearView = () => {

    const { t } = useTranslation(); 
    const [gearitems, setGearItems] = useState<GearItemType[]>([]);

    const loadDataCallback = useCallback(async () => {
    try {
        const db = await getDBConnection();
        const results = await getGearItems(db);
        setGearItems(results);

    } catch (error) {
        console.error(error);
    }
    }, []);

  // Use this const as key of the SwiperFlatList to enforce re-render on orientation-change
  const [orientation, setOrientation] = useState('');
  const width = Dimensions.get('window');

  useEffect(() => {
    loadDataCallback();
  }, [loadDataCallback]);

  useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
      if (width<height) {
        setOrientation("PORTRAIT")
      } else {
        setOrientation("LANDSCAPE")
      }
    })
  }, []);

  const styles = StyleSheet.create({
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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={[styles.appTitleView]}>
            <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />
        </View> 
        <View>
            <FlatList
                data={gearitems} 
                renderItem={({item}) => (
                    <Gear gi={item} />
                )}
            />
        </View>
    </View>
  );  
};


