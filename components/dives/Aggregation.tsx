
import { Button, View, Modal, Pressable, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

import React, { useState, useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import { divelogs_logo } from '../../assets/svgs.js'

import { getDBConnection } from '../../services/db-service';
import { getMonthStats, getHourStats, getYearStats, getWeekdayStats, getDepthStats, getDurationStats } from '../../services/db-aggregation-service';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type AggregationView = {
  name: boolean;
  component: any; 
  provide: any;
};

export const AggregatedViews:AggregationView[] = [
  { name: "full list" },
  { name: "by months", provide: getMonthStats, component: (props) => (<AggregationView {...props} />) },
  { name: "by years", provide: getYearStats, component: (props) => (<AggregationView {...props} />) },
  //{ name: "by partner", component: (props) => (<AggregationView {...props} />) },
  //{ name: "by location", component: (props) => (<AggregationView {...props} />) },
  //{ name: "by site", component: (props) => (<AggregationView {...props} />) },
  //{ name: "by depth", component: (props) => (<AggregationView {...props} />) },
]

const StatRow = ({item}) => (<View
      style={[
        {
          flex:1,
          padding:10,
          flexDirection: 'row',
        },
      ]}>
      <Text style={{flex: 3}}>{item.bez}</Text>
      <Text style={{flex: 1, textAlign:"right"}}>{item.val}</Text>
    </View>)


export const SubView = ({navigation, route}) => {
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

export const AggregationView = ({navigation, view, imperial}) => { 

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }}>
        <Stack.Navigator>
        <Stack.Screen name="Aggregation" options={{ 
          headerShown: false          
        }}>
          {(props) => <AggregationViewSub {...props} view={view}/>}
        </Stack.Screen>
        <Stack.Screen name="AggregatedDives" options={{ 
          headerShown: false          
        }}>
          {(props) => <SubView {...props}/>}
        </Stack.Screen>
      </Stack.Navigator>    
    </View>
  );

}



export const AggregationViewSub = ({navigation, view, imperial}) => {

  const [stats, setStats] = useState<StatVal[]>([])

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
      console.log(view.provide)
      return await view.provide(db);
    } catch (error) {
      console.error(error);
    }
  }

  const selectStat = (item) => {
    navigation.navigate('AggregatedDives', {item: item})
  }

  console.log(stats)

  return <View>
          <FlatList
            ListHeaderComponent={() => <Text>{view.name}</Text>}
            data={stats} 
            renderItem={({item, key}) => (
              <TouchableOpacity key={key} onPress={() => selectStat(item)} >
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


