import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Dimensions, View, FlatList, Text } from 'react-native';
import { getDBConnection, getGearItems } from '../services/db-service';
import { GearItem } from '../models';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../assets/svgs.js'
import { Gear } from './GearItem'
import '../translation'
import { useTranslation } from 'react-i18next';

export const GearView = () => {

    const { t } = useTranslation(); 
    const [gearitems, setGearItems] = useState<GearItem[]>([]);

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
    appTitleView: {
      justifyContent: 'center',
      flexDirection: 'row',
      backgroundColor: '#3fb9f2'
    },
    listHeader: {
      fontSize: 25,    
      fontWeight: '700',
      marginTop: 20,
      marginLeft: 10,
      marginBottom: 15,
      color: '#3eb8f1'
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Text style={styles.listHeader}>{t('gearitems')}</Text>
            <FlatList
              ListEmptyComponent={<View style={{justifyContent: 'center', alignItems: 'center',}}><Text>{t('nogear')}</Text></View>}  
                data={gearitems} 
                renderItem={({item}) => (
                    <Gear gi={item} />
                )}
            />
    </View>
  );  
};

export default GearView