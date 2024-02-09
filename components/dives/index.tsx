import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import React, { useState } from 'react';
import { filtericon } from '../../assets/svgs.js'
import DivelogsHeader from '../generic/divelogsheader'
import { AggregationView } from './Aggregation'
import DiveListSelection from './DiveListSelection'
import AllDives from './AllDivesView'
import DiveDetail from '../divedetail'

const DivesNavigation = ({navigation, refreshApiData, imperial}:any) => {

  const [sort, setSort] = useState<string>("DESC");

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
            headerTitleAlign: 'center'
          }}
        >

        <Stack.Screen name="DiveListSelection" options={{ 
          animation: "none",
        }}>
          {(props) => <DiveListSelection {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="AllDives" 
          options={{ 
          headerShown: true,
          headerLeft: () => (
            (Platform.OS == 'ios' ? <>              
              <Pressable onPress={()=>navigation.goBack()}>
                  <Text style={styles.text}>←</Text>
              </Pressable>           
            </>            : null)
          ),
          headerRight: () => (
            <>
            <Pressable style={styles.button} onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}>
              <Text style={styles.text}>↺</Text>
            </Pressable>             
              
            <View style={{width: 20}}></View>

            <Pressable style={styles.button} onPress={toggleSort}>
              <Text style={styles.text}>{sortindicator}</Text>
            </Pressable>          
            </>
          ),
       
        }}>
          {(props) => <AllDives {...props} sort={sort}/>}
        </Stack.Screen>
        <Stack.Screen name="AllDivesNoAnimation" 
          options={{ 
          headerShown: true,
          animation: "none",
          headerRight: () => (
            <>              
              <Pressable style={styles.button}onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}>
              <Text style={styles.text}>↺</Text>
            </Pressable>             
              
            <View style={{width: 20}}></View>

            <Pressable style={styles.button} onPress={toggleSort}>
              <Text style={styles.text}>{sortindicator}</Text>
            </Pressable>               
            </>
          ),
          headerLeft: () => (
            (Platform.OS == 'ios' ? <>              
              <Pressable onPress={()=>navigation.goBack()}>
                  <Text style={styles.text}>←</Text>
              </Pressable>           
            </>            : null)
          ),
        }}>
          {(props) => <AllDives {...props} sort={sort}/>}
        </Stack.Screen>



        <Stack.Screen name="FilteredDives" options={{ 
          title: "",
          headerRight: () => (
            <>              
              <Pressable style={styles.button} onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}>
              <Text style={styles.text}>↺</Text>
            </Pressable>             
              
            <View style={{width: 20}}></View>

            <Pressable style={styles.button} onPress={toggleSort}>
              <Text style={styles.text}>{sortindicator}</Text>
            </Pressable>             
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

        <Stack.Screen name="AggregatedView" options={{ 
          headerLeft: () => (
            (Platform.OS == 'ios' ? <>              
              <Pressable onPress={()=>navigation.goBack()}>
                  <Text style={styles.text}>←</Text>
              </Pressable>           
            </>           : null)
                  ),
          headerRight: () => (
            <>              
              <Pressable style={styles.button}onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}>
              <Text style={styles.text}>↺</Text>
            </Pressable>             
              
            <View style={{width: 20}}></View>

            <Pressable style={styles.button} onPress={toggleSort}>
              <Text style={styles.text}>{sortindicator}</Text>
            </Pressable>              
            </>
          ),
        }}>
          {(props) => <AggregationView {...props}/>}
        </Stack.Screen>        
      </Stack.Navigator>   
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3fb9f2' 
  },
  text: {
    fontSize: (Platform.OS === 'ios' ? 20 : 26),
    color: '#FFFFFF',
    fontWeight: (Platform.OS === 'ios' ? '400' : '900'),
  }
});

export default DivesNavigation

