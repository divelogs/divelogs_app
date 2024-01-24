

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationContainer } from '@react-navigation/native';


import { Button, View, Modal, Pressable, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Dive } from '../../models';

import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { getDBConnection, getDives, getImperial } from '../../services/db-service';

import { divelogs_logo } from '../../assets/svgs.js'

import DivesList from './DivesList';
import { AggregationView } from './Aggregation'

import DiveListSelection from './DiveListSelection'

import styles from '../../stylesheets/styles'

import AllDives from './AllDivesView'
import DiveDetail from '../divedetail'

const DivesNavigation = ({navigation, refreshApiData}:any) => {

  //const sortindicator = (sort == "DESC") ? '↓' : '↑'


  const imperial = false

  const Stack = createNativeStackNavigator();

  return (
    <View style={{flex:1, backgroundColor: '#FFFFFF'}}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3fb9f2',
            },
            headerTintColor: '#fff',
          }}
        >

        <Stack.Screen name="AllDives" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true,
          headerRight: () => (
            <>
              <Button
              onPress={() => navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}
              title="🐝"
              accessibilityLabel="grouped view"
              color="#fff"/>
              <Button
              onPress={() => console.log('This is a button!')}
              title="↓"
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
          {(props) => <AllDives {...props} refreshApiData={refreshApiData}/>}
        </Stack.Screen>

        <Stack.Screen name="FilteredDives" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true,
          headerRight: () => (
            <>
              <Button
                onPress={() => navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}
                title="🐝"
                accessibilityLabel="grouped view"
                color="#fff"/>
              <Button
                onPress={() => console.log('This is a button!')}
                title="↓"
                accessibilityLabel="change sorting"
                color="#fff"/>              
            </>
          ),         
        }}>
          {(props) => <AllDives {...props} refreshApiData={refreshApiData}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveDetail" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true          
        }}>
          {(props) => <DiveDetail {...props} imperial={imperial}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveListSelection" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true,
          animation: "none"
        }}>
          {(props) => <DiveListSelection {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="AggregatedView" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true,
          headerRight: () => (
            <>
              <Button
              onPress={() => navigation.reset({index: 0, routes: [{ name: 'DiveListSelection'}]})}
              title="🐝"
              accessibilityLabel="grouped view"
              color="#fff"/>
              <Button
              onPress={() => console.log('This is a button!')}
              title="↓"
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

