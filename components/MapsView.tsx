import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { getDBConnection, getCoordinates } from '../services/db-service';
import MapView, { Marker } from "react-native-maps";
import { Dive, MapMarker } from '../models';

export const MapsView = ({ route, navigation }:any) => { 

  const [dives, setDives] = useState<MapMarker[]>([]);

  const loadData = async () : Promise<MapMarker[]> => {
    try {
      const db = await getDBConnection();
      return await getCoordinates(db);
    } catch (error) {
      console.error(error);
      return []
    }
  }

  useEffect(() => {
    (async () => {
      const dives = await loadData()
      setDives(dives)
    })()
    return () => { }
  }, []);

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      flex: 1, //the container will fill the whole screen.
      justifyContent: "flex-end",
      alignItems: "center",
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });


  return (
    <View style={styles.container}> 
      <MapView style={styles.map}>
        {dives.map((item, i) => {
       
          return(<Marker
              key={i}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude
              }}
              title={item.divesite}
            />)
          
        })}

      </MapView>
    </View>
  );
  
};

export default MapsView

/*
        {Object.entries(dives).map(([key, value]) => {
          if(value.latitude != null) return <Marker key={key} title={value.divesite} coordinate={{latitude: value.latitude, longitude: value.longitude}} />
        })}

        {dives.map((item, index) => (
          <Marker key={index} title={item.divesite} coordinate={{latitude: item.latitude, longitude: item.longitude}} />
        ))}

*/