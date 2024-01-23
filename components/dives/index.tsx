

import { createNativeStackNavigator } from '@react-navigation/native-stack';


import { Button, View, Modal, Pressable, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Dive } from '../../models';

import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { getDBConnection, getDives, getImperial } from '../../services/db-service';

import { divelogs_logo } from '../../assets/svgs.js'

import DivesList from './DivesList';
import { AggregatedViews, AggregationView } from './Aggregation'

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
              onPress={() => navigation.reset({index: 0, routes: [{ name: 'AggregatedDives'}]})}
              title="🐝"
              accessibilityLabel="grouped view"
              color="#fff"/>
              <Button
              onPress={() => alert('This is a button!')}
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

        <Stack.Screen name="DiveDetail" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true          
        }}>
          {(props) => <DiveDetail {...props} imperial={imperial}/>}
        </Stack.Screen>



        <Stack.Screen name="AggregatedDives" options={{ 
          headerTitle: (props) => <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />,
          headerShown: true,
          animation: "none",
          headerRight: () => (
            <>
              <Button
              onPress={() => navigation.reset({index: 0, routes: [{ name: 'AllDives'}]})}
              title="🐝"
              accessibilityLabel="grouped view"
              color="#fff"/>         
            </>
          ),
        }}>
          {(props) => <><Text>sd</Text>

              <Button
              onPress={() => navigation.navigate('Certifications')}
              title="🐝"
              accessibilityLabel="grouped view"
              color="#fff"/>    

          </>}
        </Stack.Screen>
      </Stack.Navigator>   
    </View>
  );
};

export default DivesNavigation

