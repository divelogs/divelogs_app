import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';
import { getDBConnection, getCoordinates } from '../services/db-service';
import MapView, { Marker } from "react-native-maps";
import { Dive, MapMarker } from '../models';

export const MapsView = ({ route, navigation }:any) => { 

  const [markers, setMarkers] = useState<MapMarker[]>([]);

  const loadData = useCallback(async () => {
    try {
        const db = await getDBConnection();
        const m = await getCoordinates(db);
        setMarkers(m);
    } catch (error) {
        console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

       {Object.entries(markers).map(([key, value]) => {
          if(value.latitude != null) {
            return <Marker key={key} title={value.divesite} coordinate={{latitude: value.latitude, longitude: value.longitude}} />
          }
        })}

      </MapView>
    </View>
  );
  
};

export default MapsView