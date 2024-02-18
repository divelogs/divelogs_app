import React, {useState} from 'react';
import { View, StyleSheet, Pressable, Platform, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import '../../translation'
import { useTranslation } from 'react-i18next';
import AppHeader from '../generic/divelogsheader';
import Map from './MapsView';
import AllDives from '../dives/AllDivesView';
import DiveDetail from '../divedetail'

export const MapHome = () => {

  const { t } = useTranslation(); 

  const [sort, setSort] = useState<string>("DESC");

  const toggleSort = () => setSort((sort == "DESC") ? "ASC" : "DESC")

  const sortindicator = (sort == "DESC") ? '↓' : '↑'

  const Stack = createNativeStackNavigator();

  return (
    <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{
          headerStyle: { backgroundColor: '#3fb9f2'},
          headerTitle: () => <AppHeader/>,
          headerTintColor: '#fff',
          headerTitleAlign: 'center'
        }}>
        <Stack.Screen name="Map" component={Map} options={{ 
        headerShown: false,
        title: t("maps")       
        }}/>

        <Stack.Screen name="Map.FilteredDives" options={{ 
          title: "",
          headerRight: () => (
            <>              
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

export default MapHome

