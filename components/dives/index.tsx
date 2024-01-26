import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Button, View, Modal, Pressable, Text, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';

import React, { useState, useEffect } from 'react';


import { divelogs_logo, filtericon } from '../../assets/svgs.js'

import DivelogsHeader from '../generic/divelogsheader'

import { AggregationView } from './Aggregation'

import DiveListSelection from './DiveListSelection'

import styles from '../../stylesheets/styles'

import AllDives from './AllDivesView'
import DiveDetail from '../divedetail'

const DivesNavigation = ({navigation, refreshApiData}:any) => {

  const [sort, setSort] = useState<string>("DESC")

  const imperial = false

  const Stack = createNativeStackNavigator();

  const toggleSort = () => setSort((sort == "DESC") ? "ASC" : "DESC")

  const sortindicator = (sort == "DESC") ? '↓' : '↑'

  return (
    <View style={{flex:1, backgroundColor: '#FFFFFF'}}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3fb9f2',
            },
            headerTintColor: '#fff',
            headerTitle: () => <DivelogsHeader/>,
          }}
        >

        <Stack.Screen name="AllDives" options={{ 
          headerShown: true,
          headerRight: () => (
            <>              
              <TouchableOpacity onPress={()=>navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}>
                  <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
              </TouchableOpacity>

              <Button
              onPress={toggleSort}
              title={sortindicator}
              accessibilityLabel="change sorting"
              color="#fff"/>              
            </>
          ),
          headerLeft: () => (
            <>
              <Button
              onPress={() => refreshApiData()}
              title="↺"
              accessibilityLabel="load from divelogs"
              color="#fff"/>            
            </>
          ),          
        }}>
          {(props) => <AllDives {...props} sort={sort} refreshApiData={refreshApiData}/>}
        </Stack.Screen>

        <Stack.Screen name="FilteredDives" options={{ 
          title: "",
          headerRight: () => (
            <>
              <TouchableOpacity onPress={()=>navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}>
                  <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
              </TouchableOpacity>
              <Button
                onPress={toggleSort}
                title={sortindicator}
                accessibilityLabel="change sorting"
                color="#fff"/>              
            </>
          ),         
        }}>
          {(props) => <AllDives {...props} sort={sort} refreshApiData={refreshApiData}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveDetail" options={{ 
          headerBackTitleVisible: false       
        }}>
          {(props) => <DiveDetail {...props} imperial={imperial}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveListSelection" options={{ 
          animation: "none"
        }}>
          {(props) => <DiveListSelection {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="AggregatedView" options={{ 
          headerRight: () => (
            <>
              <TouchableOpacity onPress={()=>navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}>
                  <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
              </TouchableOpacity>
              <Button
              onPress={toggleSort}
              title={sortindicator}
              accessibilityLabel="change sorting"
              color="#fff"/>              
            </>
          ),
        }}>
          {(props) => <AggregationView {...props}/>}
        </Stack.Screen>        
      </Stack.Navigator>   
    </View>
  );
};

export default DivesNavigation

