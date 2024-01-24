
import { Button, View, Modal, Pressable, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Dive } from '../../models';

import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { getDBConnection, getDives, getFilteredDives, getImperial } from '../../services/db-service';

import { divelogs_logo } from '../../assets/svgs.js'

import DivesList from './DivesList';
import { AggregatedViews, AggregationView } from './Aggregation'

import styles from '../../stylesheets/styles'

const AllDivesView = ({navigation, route, refreshApiData}:any) => {

  const { t } = useTranslation(); 

  const [showAggregationModal, setShowAggregationModal] = useState<boolean>(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState<string>('DESC');
  const [search, setSearch] = useState<string>('');
  const [imperial, setImperial] = useState<boolean>(false);

  const [view, setView] = useState<AggregationView>(AggregatedViews[0])
console.log(route)
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

      if (!!route.params?.filter){
        return await getFilteredDives(db,sort,route.params.filter.bez)
      }

      return await getDives(db,sort,search);
    } catch (error) {
      console.error(error);
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
