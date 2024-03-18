import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Pressable, Text, StyleSheet, Platform, useColorScheme } from 'react-native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import DivelogsHeader from '../generic/divelogsheader'
import { AggregationView } from './Aggregation'
import DiveListSelection from './DiveListSelection'
import AllDives from './AllDivesView'
import DiveProfileModal from '../divedetail/DiveProfileModal';
import DiveDetail from '../divedetail'
import '../../translation'
import { useTranslation } from 'react-i18next';
import { DivelogsContext } from '../../App'; 

const DivesNavigation = ({navigation}:any) => {

  const [context] = useContext(DivelogsContext);

  const { t } = useTranslation(); 

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

  // Not used any more?
  // const listenRouteChange = (e:any) => {
  //   const lastRoute = e.data?.state?.routes?.at(-1)
  //   console.log(e.data);
  //   if (!lastRoute)
  //     return;

  //   lastView.current = {"name": lastRoute.name }

  //   switch (lastRoute.name){
  //     case "AggregatedView":
  //     case "AllDives":
  //     case "FilteredDives":
  //       lastListView.current = {"name": lastRoute.name, "params": lastRoute.params}
  //       break;
  //     case "DiveListSelection":
  //       lastListView.current = null
  //       break;
  //   }

  //   console.log(lastListView.current?.name, " ---> " ,lastView.current?.name)
  // }

  const theme = useColorScheme();
  const styles = StyleSheet.create({
    page: {
      backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909' ),
      color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
      flex: 1
    },
    button: {
      backgroundColor: '#3fb9f2' 
    },
    text: {
      fontSize: (Platform.OS === 'ios' ? 20 : 26),
      color: '#FFFFFF',
      fontWeight: (Platform.OS === 'ios' ? '400' : '900'),
    }
  });

  const Stack = createNativeStackNavigator();

  return (
    <View style={styles.page}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3fb9f2'
            },
            headerTintColor: '#fff',
            headerTitle: () => <DivelogsHeader/>,
            headerTitleAlign: 'center'
          }}
        >
        
        <Stack.Screen name=" " options={{ // Leave name empty, so it does not show in back button when Alldives are shown
          animation: "none",
        }}>
          {(props) => <DiveListSelection {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="AllDives" 
          options={{ 
            headerShown: true,
            // headerLeft: () => (
            //   (Platform.OS == 'ios' ? <>              
            //     <Pressable onPress={()=>navigation.goBack()}>
            //         <Text style={styles.text}>←</Text>
            //     </Pressable>           
            //   </>            : null)
            // ),
            headerBackTitle: ' ',
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
          {(props) => <AllDives {...props} sort={sort}/>}
        </Stack.Screen>

        <Stack.Screen name="DiveDetail" options={{ 
          headerBackTitleVisible: false       
        }}>
          {(props) => <DiveDetail {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="AggregatedView" options={{ 
          // headerLeft: () => (
          //   (Platform.OS == 'ios' ? <>              
          //     <Pressable onPress={()=>navigation.goBack()}>
          //         <Text style={styles.text}>←</Text>
          //     </Pressable>           
          //   </>           : null)
          //         ),
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

export default DivesNavigation

