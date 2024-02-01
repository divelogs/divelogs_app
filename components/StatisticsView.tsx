import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { getDBConnection, getImperial } from '../services/db-service';
import { getMonthStats, getHourStats, getYearStats, getWeekdayStats, getDepthStats, getDurationStats, getBragFacts } from '../services/db-aggregation-service';
import { Statistic } from './Statistic';
import { StatVal, BragFacts } from '../models';
import '../translation'
import { useTranslation } from 'react-i18next';
import { rendertemp, renderdepth, secondstotimeHMS } from './functions.ts'

export const StatisticsView = ({ route, navigation }:any) => {

    const [imperial, setImperial] = useState<boolean>(false);

    useEffect(() => {
      (async () => {
        const imp = await getImperial();
        setImperial(imp);
      })()
      return () => {  }
    }, []);
    
    const [monthStats, setMonthStats] = useState<StatVal[]>([]);
    const [hourStats, setHourStats] = useState<StatVal[]>([]);
    const [yearStats, setYearStats] = useState<StatVal[]>([]);
    const [weekdayStats, setWeekdayStats] = useState<StatVal[]>([]);
    const [depthStats, setDepthStats] = useState<StatVal[]>([]);
    const [durationStats, setDurationStats] = useState<StatVal[]>([]);
    const [bragFacts, setBragFacts] = useState<BragFacts | null>(null);

    const { t } = useTranslation(); 

    const loadDataCallback = useCallback(async () => {
    try {
        const db = await getDBConnection();

        const results0 = await getBragFacts(db);
        setBragFacts(results0);

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
    }, [imperial]);

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
    },
    oneliner: {
      flexDirection: 'row',
      height: 30
    },
    desc: {
      color: '#39ade2'
    },
    listHeader: {
      fontSize: 25,    
      fontWeight: '700',
      marginTop: 10,
      marginLeft: 0,
      marginBottom: 15,
      color: '#3eb8f1'
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ScrollView style={{padding: 10}}> 
           <Text style={styles.listHeader}>{t('statistics')}</Text>
           <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('totaldives')}: </Text>
                <Text>{(bragFacts ? bragFacts.totaldives: null)}</Text>  
            </View>  
           <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('totalduration')}: </Text>
                <Text>{(bragFacts ? secondstotimeHMS(bragFacts.totalduration) : null)}</Text>  
            </View>    
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('avgdepth')}: </Text>
                <Text>{(bragFacts ? renderdepth(bragFacts.avgdepth, imperial) : null)}</Text>  
            </View>  
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('avgduration')}: </Text>
                <Text>{(bragFacts ? secondstotimeHMS(bragFacts.avgduration) : null)}</Text>  
            </View>  
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('maxdepth')}: </Text>
                <Text>{(bragFacts ? renderdepth(bragFacts.maxdepth, imperial) : null)}</Text>  
            </View>  
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('maxduration')}: </Text>
                <Text>{(bragFacts ? secondstotimeHMS(bragFacts.maxduration) : null)}</Text>  
            </View>    
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('coldest')}: </Text>
                <Text>{(bragFacts ? rendertemp(bragFacts.coldest, imperial) : null)}</Text>  
            </View>    
            <View style={styles.oneliner}>
                <Text style={styles.desc}>{t('warmest')}: </Text>
                <Text>{(bragFacts ? rendertemp(bragFacts.warmest, imperial) : null)}</Text>  
            </View>    
            <Text> </Text>
            <Text style={styles.desc}>{t('depths')}:</Text>
            <Statistic StatData={{values:depthStats, xname:(imperial ? t('feet') : t('meter')), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text> </Text>
            <Text style={styles.desc}>{t('durations')}:</Text>
            <Statistic StatData={{values:durationStats, xname:t('minutes'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text> </Text>
            <Text style={styles.desc}>{t('weekdays')}:</Text>
            <Statistic StatData={{values:weekdayStats, xname:t('weekday'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text> </Text>
            <Text style={styles.desc}>{t('months')}:</Text>
            <Statistic StatData={{values:monthStats, xname:t('month'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text> </Text>
            <Text style={styles.desc}>{t('years')}:</Text>
            <Statistic StatData={{values:yearStats, xname:t('year'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text> </Text>
            <Text style={styles.desc}>{t('entryhour')}:</Text>
            <Statistic StatData={{values:hourStats, xname:t('hour'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text></Text>
            <Text></Text>
            
        </ScrollView>
    </View>
  );

  
};

export default StatisticsView