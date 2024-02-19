import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, View, Pressable, Platform } from 'react-native';
import { getDBConnection, getCoordinates, getLastDiveWithCoordinates } from '../../services/db-service';
import MapView, { Marker, Callout, Region } from "react-native-maps";
import { MapMarker } from '../../models';
import '../../translation'
import { useTranslation } from 'react-i18next';

export const MapsView = ({ route, navigation }:any) => { 

  const { t } = useTranslation(); 

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [initial, setInitial] = useState<Region|undefined>()

  const loadData = useCallback(async () => {
    try {
        const db = await getDBConnection();
        const m = await getCoordinates(db);
        const ld = await getLastDiveWithCoordinates(db);
        setMarkers(m);

        if (ld){
          const initial:Region = {latitude: ld.lat,
                            longitude: ld.lng,
                            latitudeDelta: 0.5922,
                            longitudeDelta: 0.5421};
          setInitial(initial)
        }

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
    navigation.navigate("Map.FilteredDives", {view: { aggregation: "byLatLng" }, filter: { lat: value.latitude, lng: value.longitude }})
  }

  // Android only allows onPress on Callout, while iOS allows a Pressable inside callout
  return (
    <View style={styles.container}> 
      <MapView style={styles.map} initialRegion={initial}>

       {Object.entries(markers).map(([key, value]) => {
          if(value.latitude != null) {
            return <Marker key={key} title={value.divesite} coordinate={{latitude: value.latitude, longitude: value.longitude}} > 
            
            {Platform.OS == 'ios' && <Callout>
                <View>
                    <Text>{value.divesite}</Text>
                    <Pressable onPress={() => showMarkerDives(value)}>
                      <View style={styles.showdives}><Text style={styles.showdivestext}>{t('showdives')}</Text></View>
                    </Pressable>
                </View>
            </Callout>}
            
            {Platform.OS == 'android' && <Callout onPress={() => showMarkerDives(value)}>
                <View>
                    <Text>{value.divesite}</Text>
                      <View style={styles.showdives}><Text style={styles.showdivestext}>{t('showdives')}</Text></View>
                </View>
            </Callout>}

            </Marker>
          }
        })}

      </MapView>
    </View>
  ) 
  
};

export default MapsView