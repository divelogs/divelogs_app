import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, View, FlatList, Text, useColorScheme, StyleSheet } from 'react-native';
import { getDBConnection, getGearItems } from '../../services/db-service';
import { GearItem } from '../../models';
import { Gear } from './GearItem'
import '../../translation'
import { useTranslation } from 'react-i18next';
import divelogsStyles from '../../stylesheets/styles'

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

  const theme = useColorScheme();
  const styles = StyleSheet.create({
    page: {
      backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909' ),
      color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
      flex: 1
    }
  });

  return (
    <View style={styles.page}>
      <Text style={divelogsStyles.viewHeader}>{t('gearitems')}</Text>
            <FlatList
              ListEmptyComponent={<View style={[divelogsStyles.noListContent]}><Text style={[divelogsStyles.noListContentText]}>{t('nogear')}</Text></View>}  
                data={gearitems} 
                renderItem={({item}) => (
                    <Gear gi={item} />
                )}
            />
    </View>
  );  
};

export default GearView