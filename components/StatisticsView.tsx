import React, { useCallback, useEffect, useState } from 'react';
import { Text, SafeAreaView, StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { getDBConnection } from '../services/db-service';
import { getMonthStats, getHourStats, getYearStats, getWeekdayStats, getDepthStats, getDurationStats } from '../services/db-aggregation-service';
import { Statistic } from './Statistic';
import { StatVal } from '../models';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../assets/svgs.js'
import '../translation'
import { useTranslation } from 'react-i18next';

export const StatisticsView = ({ route, navigation }:any) => {

    const imperial = route.params.imperial;
    
    const [monthStats, setMonthStats] = useState<StatVal[]>([]);
    const [hourStats, setHourStats] = useState<StatVal[]>([]);
    const [yearStats, setYearStats] = useState<StatVal[]>([]);
    const [weekdayStats, setWeekdayStats] = useState<StatVal[]>([]);
    const [depthStats, setDepthStats] = useState<StatVal[]>([]);
    const [durationStats, setDurationStats] = useState<StatVal[]>([]);

    const { t } = useTranslation(); 

    const loadDataCallback = useCallback(async () => {
    try {
        const db = await getDBConnection();
        const results = await getMonthStats(db);
        setMonthStats(results);

        const results2 = await getHourStats(db);
        setHourStats(results2);

        const results3 = await getYearStats(db);
        setYearStats(results3);

        const results4 = await getWeekdayStats(db);
        setWeekdayStats(results4);

        const results5 = await getDepthStats(db, imperial);
        setDepthStats(results5);

        const results6 = await getDurationStats(db);
        setDurationStats(results6);
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
        <ScrollView style={{padding: 10}}>        
            <Text>{t('depths')}:</Text>
            <Statistic StatData={{values:depthStats, xname:(imperial ? t('feet') : t('meter')), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text>{t('durations')}:</Text>
            <Statistic StatData={{values:durationStats, xname:t('minutes'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text>{t('weekdays')}:</Text>
            <Statistic StatData={{values:weekdayStats, xname:t('weekday'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text>{t('months')}:</Text>
            <Statistic StatData={{values:monthStats, xname:t('month'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text>{t('years')}:</Text>
            <Statistic StatData={{values:yearStats, xname:t('year'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text>{t('entryhour')}:</Text>
            <Statistic StatData={{values:hourStats, xname:t('hour'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text></Text>
            <Text></Text>
            
        </ScrollView>
    </View>
  );

  
};
