import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, TouchableOpacity, Pressable, Text, StyleSheet } from 'react-native';
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
            <>              
              <TouchableOpacity onPress={()=>navigation.goBack()}>
                  <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
              </TouchableOpacity>           
            </>            
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
            <>              
              <TouchableOpacity onPress={()=>navigation.goBack()}>
                  <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
              </TouchableOpacity>           
            </>            
          ),
        }}>
          {(props) => <AllDives {...props} sort={sort}/>}
        </Stack.Screen>



        <Stack.Screen name="FilteredDives" options={{ 
          title: "",
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
          {(props) => <AllDives {...props} sort={sort} refreshApiData={refreshApiData}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveDetail" options={{ 
          headerBackTitleVisible: false       
        }}>
          {(props) => <DiveDetail {...props} imperial={imperial}/>}
        </Stack.Screen>

        <Stack.Screen name="AggregatedView" options={{ 
          headerLeft: () => (
                    <>              
                      <TouchableOpacity onPress={()=>navigation.goBack()}>
                          <SvgXml style={{marginRight: 25}} xml={filtericon} width="15" height="15"/>
                      </TouchableOpacity>           
                    </>            
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
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900'
  }
});

export default DivesNavigation

