import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, View, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import React, { useState, useRef } from 'react';
import { filtericon } from '../../assets/svgs.js'
import DivelogsHeader from '../generic/divelogsheader'
import { AggregationView } from './Aggregation'
import DiveListSelection from './DiveListSelection'
import AllDives from './AllDivesView'
import DiveDetail from '../divedetail'

const DivesNavigation = ({navigation, refreshApiData, imperial}:any) => {

  const [sort, setSort] = useState<string>("DESC");
  let selectedViewRef = useRef<any|null>(null)

  const toggleSort = () => setSort((sort == "DESC") ? "ASC" : "DESC")

  const sortindicator = (sort == "DESC") ? '↓' : '↑'

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
  
      if (selectedViewRef.current == null)
        return;

      e.preventDefault();

      navigation.navigate(selectedViewRef.current.name, selectedViewRef.current.params)
    });
  
    return unsubscribe;
  }, []);

  const Stack = createNativeStackNavigator();

  return (
    <View style={{flex:1, backgroundColor: '#FFFFFF'}}>
        <Stack.Navigator
          screenListeners={{
            state: (e) => {
              const lastRoute = e.data?.state?.routes?.at(-1)
              if (!lastRoute)
                return;

              switch (lastRoute.name){
                case "AggregatedView":
                case "AllDives":
                  selectedViewRef.current = {"name": lastRoute.name, "params": lastRoute.params}
                  break;
                case "DiveListSelection":
                  selectedViewRef.current = null
                  break;
              }
            }
          }}


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
              <Button onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}
                title="↺"
                accessibilityLabel="load from divelogs"
                color="#fff"/>   
              <View style={{width: 20}}></View>
              <Button
              onPress={toggleSort}
              title={sortindicator}
              accessibilityLabel="change sorting"
              color="#fff"/>              
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
              <Button onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}
                title="↺"
                accessibilityLabel="load from divelogs"
                color="#fff"/>   
              <View style={{width: 20}}></View>
              <Button
              onPress={toggleSort}
              title={sortindicator}
              accessibilityLabel="change sorting"
              color="#fff"/>              
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
              <Button onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}
                title="↺"
                accessibilityLabel="load from divelogs"
                color="#fff"/>   
              <View style={{width: 20}}></View>
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
              <Button onPress={() => navigation.replace("Onboarding", {screen: "Sync"})}
                title="↺"
                accessibilityLabel="load from divelogs"
                color="#fff"/>   
              <View style={{width: 20}}></View>
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

