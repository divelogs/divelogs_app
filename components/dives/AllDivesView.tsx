
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Dive } from '../../models';
import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { getDBConnection, getDives, getFilteredDives, getFilteredDivesByPrecalcedStatistics, getImperial, getDivesByLatLng } from '../../services/db-service';
import DivesList from './DivesList';

const AllDivesView = ({navigation, route, sort, refreshApiData}:any) => {

  const [dives, setDives] = useState<Dive[]>([]);
  const [search, setSearch] = useState<string>('');
  const [imperial, setImperial] = useState<boolean>(false);
  const [fromMap, setFromMap] = useState<boolean>(false);

  const { t } = useTranslation(); 

  const styles = StyleSheet.create({
    text: {
      fontSize: (Platform.OS === 'ios' ? 20 : 26),
      color: '#FFFFFF',
      fontWeight: (Platform.OS === 'ios' ? '400' : '900'),
    }
  });

  useEffect(() => {
    if (!!route.params?.filter?.label)
      navigation.setOptions({title: route.params?.filter?.label});

    (async () => {
      const dives = await loadData()
      console.log('doin stuff');
      setDives(dives)
    })()
    return () => { }
  }, [sort, search, route]);

  useEffect(() => {
    (async () => {
      const imp = await getImperial();
      setImperial(imp);
    })()
    return () => {  }
  }, ["noreload"]);

  console.log(route);

  useEffect(() => {
      navigation.setOptions({
        headerLeft: () => (
          ((!!route.params?.aggregation && route.params.aggregation == "byLatLng") ? <>              
              <Pressable onPress={()=>navigation.navigate("Maps")}>
                  <Text style={styles.text}>❮ {t('maps')}</Text>
              </Pressable>           
            </> : navigation.headerDEFAULT)
          )     
      })
  }, [route]);

  const loadData = async () : Promise<Dive[]> => {
    try {
      const db = await getDBConnection();

      if (!!route.params?.aggregation && route.params.aggregation == "byLatLng") {
        setFromMap(true);
        return await getDivesByLatLng(db, route.params.lat, route.params.lng, 'ASC');
      } else setFromMap(false);

      if (!!route.params?.filter){
        let column:string;
        let value:string;
        switch (route.params.view.aggregation)
        {
          case "byDepth":
            value = route.params.filter.bez.replace(/\-.+/, "")
            if (imperial)
              column = "CAST(CAST(maxdepth/0.3048/10 as int)*10 as string)"
            else
              column = "CAST(CAST(maxdepth/5 as int)*5 as string)"
            break
          case "byDuration":
            value = route.params.filter.bez.replace(/\-.+/, "")
            column = "CAST(CAST((duration/60)/5 as string)*5 as string)"
            break
          case "byPartner":
          case "byDiveGroup":
            return await getFilteredDivesByPrecalcedStatistics(db, route.params.view.column, route.params.filter.bez, sort, search);
          default:
            value = route.params.filter.bez
            column = route.params.view.column
            break
        }
        return await getFilteredDives(db,column,value,sort,search)
      }
      return await getDives(db,sort,search);
    } catch (error) {
      console.error(error);
      return []
    }
  }

  const doSearch = (searchtext:string) => {
    setSearch(searchtext)
  }

  const selectDive = (dive:Dive) => {
    navigation.navigate('DiveDetail', {dive: dive, diveId: dive.id, dives: dives});
  } 

  return (
    <View style={{flex:1}}>
      <DivesList navigation={navigation} selectDive={selectDive} dives={dives} doSearch={doSearch} imperial={imperial} fromMap={fromMap}/>
    </View>
  );
};

export default AllDivesView
