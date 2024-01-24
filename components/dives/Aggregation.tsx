
import { Button, View, Modal, Pressable, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

import React, { useState, useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../../assets/svgs.js'

import { getDBConnection } from '../../services/db-service';
import { getMonthStats, getHourStats, getYearStats, getSingleColumnStats, getDepthStats, getDurationStats } from '../../services/db-aggregation-service';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatData, StatVal } from '../../models';

export type AggregationView = {
  name: string;
  component: any; 
  provide: any;
};

const StatRow = ({item}:any) => (<View
      style={[
        {
          flex:1,
          padding:10,
          flexDirection: 'row',
        },
      ]}>
      <Text style={{flex: 3}}>{item.bez.length > 0 ? item.bez : "?"}</Text>
      <Text style={{flex: 1, textAlign:"right"}}>{item.val}</Text>
    </View>)


export const SubView = ({navigation, route}:any) => {
  console.log(route)
  return <View style={[styles.appTitleView]}>
        <View style={{ width:70, position: 'absolute', left: 10, top:-5 }}>
          <Button
            title="←"
            color={'white'}                
            onPress={() =>
              navigation.navigate('Aggregation')
            }
          />
        </View>
        <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />               
      </View>  
}


export const AggregationView = ({navigation, route, view, imperial}:any) => {

  const [stats, setStats] = useState<StatVal[]>([])

  const name = route.view.name
  console.log(route)

  useEffect(() => {

    (async () => {
      const statistics = await loadData()
      setStats(statistics)
    })()
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

  const selectStat = (item:StatVal) => {
    navigation.navigate('FilteredDives', { filter: item, view: route.view})
  }

  return <View style={{flex: 1}}>
          <FlatList
            ListHeaderComponent={() => <Text>{name}</Text>}
            data={stats} 
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => selectStat(item)} >
                <StatRow item={item} />
              </TouchableOpacity>
            )}
          />
        </View>    
}


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


