import React, { useCallback, useEffect, useState, useContext } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { getDBConnection } from '../../services/db-service';
import { getMonthStats, getHourStats, getYearStats, getWeekdayStats, getDepthStats, getDurationStats, getBragFacts } from '../../services/db-aggregation-service';
import { Statistic } from './Statistic';
import Oneliner from '../generic/ValueView';
import { StatVal, BragFacts } from '../../models/index.ts';
import '../../translation'
import { useTranslation } from 'react-i18next';
import { rendertemp, renderdepth, secondstotimeHMS } from '../functions'
import divelogsStyles from '../../stylesheets/styles.ts'
import { DivelogsContext } from '../../App'; 


export const StatisticsView = ({ route, navigation }:any) => {
    
    const context = useContext(DivelogsContext);
    const imperial = context.userProfile?.imperial || false

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
      color: '#39ade2',
      marginTop: 20,
      marginBottom: 14,
      fontSize: 18,
      fontWeight: '500'
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
           <Text style={divelogsStyles.viewHeader}>{t('statistics')}</Text>

        <ScrollView style={{padding: 10}}> 

            <Oneliner label={t('totaldives')}>{bragFacts?.totaldives}</Oneliner>
            <Oneliner label={t('totalduration')}>{(bragFacts ? secondstotimeHMS(bragFacts.totalduration) : null)}</Oneliner>
            <Oneliner label={t('avgdepth')}>{(bragFacts ? renderdepth(bragFacts.avgdepth, imperial) : null)}</Oneliner>
            <Oneliner label={t('avgduration')}>{(bragFacts ? secondstotimeHMS(bragFacts.avgduration) : null)}</Oneliner>
            <Oneliner label={t('maxdepth')}>{(bragFacts ? renderdepth(bragFacts.maxdepth, imperial) : null)}</Oneliner>
            <Oneliner label={t('maxduration')}>{(bragFacts ? secondstotimeHMS(bragFacts.maxduration) : null)}</Oneliner>
            <Oneliner label={t('coldest')}>{(bragFacts ? rendertemp(bragFacts.coldest, imperial) : null)}</Oneliner>
            <Oneliner label={t('warmest')}>{(bragFacts ? rendertemp(bragFacts.warmest, imperial) : null)}</Oneliner>

            <Text style={styles.desc}>{t('depths')}</Text>
            <Statistic StatData={{values:depthStats, xname:(imperial ? t('feet') : t('meter')), yname: t('dives'), width:width.width, height: width.width/1.9}}/>

            <Text style={styles.desc}>{t('durations')}</Text>
            <Statistic StatData={{values:durationStats, xname:t('minutes'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>

            <Text style={styles.desc}>{t('weekdays')}</Text>
            <Statistic StatData={{values:weekdayStats, xname:t('weekday'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>

            <Text style={styles.desc}>{t('months')}</Text>
            <Statistic StatData={{values:monthStats, xname:t('month'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>

            <Text style={styles.desc}>{t('years')}</Text>
            <Statistic StatData={{values:yearStats, xname:t('year'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>

            <Text style={styles.desc}>{t('entryhour')}</Text>
            <Statistic StatData={{values:hourStats, xname:t('hour'), yname: t('dives'), width:width.width, height: width.width/1.9}}/>
            <Text></Text>
            <Text></Text>
            
        </ScrollView>
    </View>
  );

  
};

export default StatisticsView