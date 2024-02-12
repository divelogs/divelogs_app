import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View, Pressable } from 'react-native';
import { getDBConnection, getCoordinates } from '../../services/db-service';
import MapView, { Marker, Callout } from "react-native-maps";
import { Dive, MapMarker } from '../../models';
import '../../translation'
import { useTranslation } from 'react-i18next';

export const MapsView = ({ route, navigation }:any) => { 

  const { t } = useTranslation(); 

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
    showdives: {
      backgroundColor: '#3fb9f2',
      color: '#FFF',
      borderRadius: 5,
      padding: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    showdivestext: {
      color: '#FFF',
    }
  });

  const showMarkerDives = (value:any) => {
    navigation.push("Map.FilteredDives", {aggregation: "byLatLng", lat: value.latitude, lng: value.longitude})
  }

  return (
    <View style={styles.container}> 
      <MapView style={styles.map}>

       {Object.entries(markers).map(([key, value]) => {
          if(value.latitude != null) {
            return <Marker key={key} title={value.divesite} coordinate={{latitude: value.latitude, longitude: value.longitude}} > 
            <Callout>
                <View>
                    <Text>{value.divesite}</Text>
                    <Pressable onPress={() => showMarkerDives(value)}>
                      <View style={styles.showdives}><Text style={styles.showdivestext}>{t('showdives')}</Text></View>
                    </Pressable>  
                </View>
            </Callout>
            </Marker>
          }
        })}

      </MapView>
    </View>
  );
  
};

export default MapsView