
import { Button, View, Modal, Pressable, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

import React, { useState, useEffect } from 'react';

import { getDBConnection, getImperial } from '../../services/db-service';
import { getSingleColumnStats, getDepthStats, getDurationStats } from '../../services/db-aggregation-service';

import '../../translation'
import { useTranslation } from 'react-i18next';

import { StatVal } from '../../models';

const StatRow = ({item, label}:any) => (<View
      style={styles.statRowStyle}>
      <Text style={styles.statRowText}>{label?.length > 0 ? label : "?"}</Text>
      <Text style={{flex: 1, textAlign:"right"}}>{item.val} &gt;</Text>
    </View>)

export const AggregationView = ({navigation, route, view, imperial}:any) => {

  const { t } = useTranslation();
  const [stats, setStats] = useState<StatVal[]>([])

  const name = route.view.name

  useEffect(() => {

    (async () => {
      const statistics = await loadData()
      setStats(statistics)
    })()

    navigation.setOptions({title: route.view.name})

    return () => { console.log("unmount") }
  }, [view]);

  const loadData = async () : Promise<StatVal[]> => {
    try {
      const db = await getDBConnection();

      switch (route.view.aggregation){
        case "byDepth":
          return await getDepthStats(db, imperial)
        case "byDuration":
          return await getDurationStats(db)     
        default:
          return await getSingleColumnStats(db, route.view.column)
      }
    } catch (error) {
      console.error(error);
      return []
    }
  }

  const selectStat = (item:StatVal, label:string) => {
    navigation.navigate('FilteredDives', { filter: {...item, label: label}, view: route.view})
  }

  const makeLabel = (item:StatVal, type:string) : string => {
    let label:string = "";
    
    switch (type){
      case "byMonth":
        const [year, month] = item.bez.split("-")
        return t("month"+month) + " " + year

      case "byDepth":
        const [left, right] = item.bez.split("-")
        const unit = imperial ? "feet" : "meter"
  
        if (left == "0")
          return `< ${right} ${t(unit)}`
        return `${left} - ${right} ${t(unit)}`

      case "byDuration":
        const [from, until] = item.bez.split("-")
        if (from == "0")
          return `< ${until} ${t("Minutes")}`
        return `${from} - ${until} ${t("Minutes")}`
     
      default:
        return item.bez
    }
  }

  return <View style={{flex: 1}}>
          <FlatList
            ListHeaderComponent={() => <Text style={styles.listHeader}>{name}</Text>}
            data={stats} 
            renderItem={({item}) => {
              const label = makeLabel(item,route.view.aggregation)
              return (<TouchableOpacity onPress={() => selectStat(item, label)} >
                <StatRow label={label} item={item}/>
              </TouchableOpacity>
            )}}
          />
        </View>    
}


const styles = StyleSheet.create({
  listHeader: {
    fontSize: 30,
    textTransform: 'uppercase',
    fontWeight: '900',
    marginTop: -6,
    color: '#3eb8f1'
  },
  statRowStyle: {
    flex:1,
    padding:10,
    flexDirection: 'row',
  },
  statRowText: {
    flex: 3,
    fontSize: 18,
  },
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
});


