
import { View, Text } from 'react-native';
import { Dive } from '../../models';
import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useContext } from 'react';
import { getDBConnection, getDives, getFilteredDives, getFilteredDivesByPrecalcedStatistics, getDivesByLatLng } from '../../services/db-service';
import DivesList from './DivesList';

import { DivelogsContext } from '../../App'; 

const AllDivesView = ({navigation, route, sort}:any) => {

  const [dives, setDives] = useState<Dive[]>([]);
  const [search, setSearch] = useState<string>('');

  const context = useContext(DivelogsContext);
  const imperial = context.userProfile?.imperial || false

  useEffect(() => {
    if (!!route.params?.filter?.label)
      navigation.setOptions({title: route.params?.filter?.label});

    (async () => {
      const dives = await loadData()
      setDives(dives)
    })()
    return () => { }
  }, [sort, search, route]);

  const loadData = async () : Promise<Dive[]> => {
    try {
      const db = await getDBConnection();

      if (!!route.params?.filter){
        let column:string;
        let value:string;
        switch (route.params.view.aggregation)
        {
          case "byLatLng":
            const {lat, lng} = route.params.filter
            return await getDivesByLatLng(db, lat, lng, sort, search);
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
      <DivesList navigation={navigation} selectDive={selectDive} dives={dives} doSearch={doSearch}/>
    </View>
  );
};

export default AllDivesView
