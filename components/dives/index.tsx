import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import React, { useState, useRef, useEffect } from 'react';
import { filtericon } from '../../assets/svgs.js'
import DivelogsHeader from '../generic/divelogsheader'
import { AggregationView } from './Aggregation'
import DiveListSelection from './DiveListSelection'
import AllDives from './AllDivesView'
import DiveProfileModal from '../divedetail/DiveProfileModal';
import DiveDetail from '../divedetail'

const DivesNavigation = ({navigation, refreshApiData, imperial}:any) => {

  const [sort, setSort] = useState<string>("DESC");
  let lastListView = useRef<any|null>({"name": "AllDives" })
  let lastView = useRef<any|null>(null)

  const toggleSort = () => setSort((sort == "DESC") ? "ASC" : "DESC")

  const sortindicator = (sort == "DESC") ? '↓' : '↑'

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e:any) => {
  
      if (lastListView.current == null) {
        lastView.current = {"name": "AllDives" };
      }

      e.preventDefault();
    
      if (lastListView.current?.name == undefined) navigation.navigate("AllDives");
      else navigation.navigate(lastListView.current.name, lastListView.current.params)
    });
    return unsubscribe;
  }, []);

  const listenRouteChange = (e:any) => {
    const lastRoute = e.data?.state?.routes?.at(-1)
    if (!lastRoute)
      return;

    lastView.current = {"name": lastRoute.name }

    switch (lastRoute.name){
      case "AggregatedView":
      case "AllDives":
      case "FilteredDives":
        lastListView.current = {"name": lastRoute.name, "params": lastRoute.params}
        break;
      case "DiveListSelection":
        lastListView.current = null
        break;
    }

    console.log(lastListView.current?.name, " ---> " ,lastView.current?.name)

  }

  const Stack = createNativeStackNavigator();

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
        <Stack.Screen
          name="DiveProfilFocus"
          component={DiveProfileModal}
          options={{ presentation: 'transparentModal', headerShown: false }}
        />   
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

