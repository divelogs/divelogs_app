
import { Button, View, Modal, Pressable, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Dive } from '../../models';

import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { getDBConnection, getDives, getFilteredDives, getImperial } from '../../services/db-service';

import { divelogs_logo } from '../../assets/svgs.js'

import DivesList from './DivesList';
import { AggregationView } from './Aggregation'

import styles from '../../stylesheets/styles'

const AllDivesView = ({navigation, route, refreshApiData}:any) => {

  const { t } = useTranslation(); 

  const [showAggregationModal, setShowAggregationModal] = useState<boolean>(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState<string>('DESC');
  const [search, setSearch] = useState<string>('');
  const [imperial, setImperial] = useState<boolean>(false);

  const [view, setView] = useState<AggregationView|null>(null)

  useEffect(() => {

    (async () => {
      const dives = await loadData()
      setDives(dives)
    })()
    return () => { console.log("unmount") }
  }, [sort, search]);

  useEffect(() => {
    (async () => {
      const imp = await getImperial();
      setImperial(imp);
    })()
    return () => {  }
  }, ["noreload"]);

  const loadData = async () : Promise<Dive[]> => {
    try {
      const db = await getDBConnection();

console.log(route.params)

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

  const toggleSort = () => {
    if (sort == `DESC`) {
      setSort('ASC');
    } else {
      setSort('DESC');
    }   
  };

  const doSearch = (searchtext:string) => {
    setSearch(searchtext)
  }

  const selectDive = (dive:Dive) => {
    navigation.navigate('DiveDetail', {dive: dive, diveId: dive.id, dives: dives});
  } 

  const selectView = (view:AggregationView) => {
    setShowAggregationModal(false)
    setView(view)
  }

  const sortindicator = (sort == "DESC") ? '↓' : '↑'
  return (
    <View style={{flex:1}}>
      <DivesList navigation={navigation} selectDive={selectDive} dives={dives} doSearch={doSearch} imperial={imperial}/>
    </View>
  );
};

export default AllDivesView
