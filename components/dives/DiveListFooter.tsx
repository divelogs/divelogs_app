import { StyleSheet, Text, View} from 'react-native';
import { Dive } from '../../models'
import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useContext } from 'react';
import { DivelogsContext } from '../../App'; 

interface Statistics {
  [key: string]: number;
}

const DiveListFooterStats = ({dives}:any) => {

  const [statistics, setStatistics] = useState<Statistics>({})
  const { t } = useTranslation(); 

  const [context] = useContext(DivelogsContext);
  const imperial = context.userProfile?.imperial || false

  useEffect(() => {
    let s:Statistics = {};

    if (dives.length > 1){
      s.dives = dives.length
      s.maxDepth = 0;
      s.maxDuration = 0;
      s.avgDuration = 0;
      s.minTemp = 1000;
      s.sumDuration = 0

      dives.reduce((stat:Statistics, dive:Dive) => {
        if (!!dive.maxdepth) stat.maxDepth = Math.max(dive.maxdepth, stat.maxDepth)
        if (!!dive.depthtemp) stat.minTemp = Math.min(dive.depthtemp, stat.minTemp)
        if (!!dive.duration) stat.maxDuration = Math.max(dive.duration, stat.maxDuration)
        if (!!dive.duration) stat.avgDuration = (dive.duration + stat.avgDuration)
        if (!!dive.duration) stat.sumDuration = (dive.duration + stat.sumDuration)

        return stat;
      }, s)
    
      s.avgDuration = s.avgDuration / s.dives
      if (s.minTemp == 1000)
        s.minTemp = 1000
    }
    setStatistics(s)
  }, [dives])

  if (!dives || dives.length == 0 || !statistics.dives)
    return null

  const lunit = (imperial) ? "ft" : "m"
  const tunit = (imperial) ? "°F" : "°C"

  return ( 
    <View style={[styles.footerContainer]}>
        <Text style={[styles.footerDives, styles.footerCol]}><Text style={styles.number}>{statistics.dives}</Text> {t('dives')}</Text>
        <View style={{flexDirection: "row"}}>
            <Text style={[styles.footerStats, styles.footerCol, styles.footerLeft]}>
                {t("max_depth")}: 
                <Text style={styles.number}> {Math.round(statistics.maxDepth*10)/10}{lunit}</Text>
            </Text>
            <Text style={[styles.footerStats, styles.footerCol]}>
                {t("max_duration")}:
                <Text style={styles.number}> {Math.round(statistics.maxDuration/60)}min</Text>
                </Text>
        </View>
        <View style={{flexDirection: "row"}}>
            <Text style={[styles.footerStats, styles.footerCol, styles.footerLeft]}>
                    {t("sum_duration")}:
                    <Text style={styles.number}> {Math.round(statistics.sumDuration/60)}min</Text>
            </Text>
            <Text style={[styles.footerStats, styles.footerCol]}>
                {t("avg_duration")}:
                <Text style={styles.number}> {Math.round(statistics.avgDuration/60)}min</Text>
            </Text>
        </View>
        <View style={{flexDirection: "row"}}> 
            <Text style={[styles.footerStats, styles.footerCol, styles.footerLeft]}>
                {statistics.minTemp == 1000 ? null : 
                        <>{t("min_temp")}:
                        <Text style={styles.number}> {Math.round(statistics.minTemp)}{tunit}</Text>
                    </>}
            </Text>
            <Text style={[styles.footerStats, styles.footerCol]}>
            </Text>
        </View>               
    </View>
      
  );
};

const styles = StyleSheet.create({
    footerCol: {
        color: "#888",
    },
    footerContainer: {
        marginTop: 15,
        padding: 5,
        paddingBottom: 40,
       
    },
    footerDives: {
        textAlign: "center",
        fontSize: 20,
        paddingBottom: 6

    },
    footerStats: {
        flex: 1,
        marginHorizontal: 5,
        paddingBottom: 3
    },
    footerLeft: {
        textAlign: "right",
    },
    number:{
        color: "#3fb9f2",
        fontWeight: "bold"
    }
  });
  

export default DiveListFooterStats
