
import { Button, View, Modal, Pressable, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Dive } from '../../models';

import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';

import { getDBConnection, getDives, getImperial } from '../../services/db-service';

import { divelogs_logo } from '../../assets/svgs.js'

import DivesList from './DivesList';
import { AggregatedViews, AggregationView } from './Aggregation'

import styles from '../../stylesheets/styles'

const AllDivesView = ({navigation, refreshApiData}:any) => {

  const { t } = useTranslation(); 

  const [showAggregationModal, setShowAggregationModal] = useState<boolean>(false);
  const [dives, setDives] = useState<Dive[]>([]);
  const [sort, setSort] = useState<string>('DESC');
  const [search, setSearch] = useState<string>('');
  const [imperial, setImperial] = useState<boolean>(false);

  const [view, setView] = useState<AggregationView>(AggregatedViews[0])


  const grouping = [t("full list"), t("by months"), t("by partner"), t("by location"), t("by site"), t("by depth")]


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
    navigation.navigate('DiveDetail', {diveId: dive.id, dives: dives});
  } 

  const selectView = (view:AggregationView) => {
    setShowAggregationModal(false)
    setView(view)
  }

  const sortindicator = (sort == "DESC") ? '↓' : '↑'

  return (
    <View style={{flex:1, paddingBottom: 50, backgroundColor: '#FFFFFF'}}>
    <View style={styles.safeArea}>
      <View style={[styles.appTitleView]}>
        <View style={{ width:35, position: 'absolute', left: 10, top:-5 }}>
          <Button 
              onPress={refreshApiData}
              title='↺'
              color="#FFFFFF"
              accessibilityLabel="load from divelogs"
            />
        </View>
        <SvgXml style={styles.tinyLogo} xml={divelogs_logo} />

        <View style={{ width:35, position: 'absolute', right: 40, top:-5 }}>
          <Button
              onPress={() => setShowAggregationModal(!showAggregationModal)}
              title="🐝"
              color="#FFFFFF"
              accessibilityLabel="grouping"
            />
        </View>    

        <View style={{ width:35, position: 'absolute', right: 10, top:-5 }}>
          <Button
              onPress={toggleSort}
              title={sortindicator}
              color="#FFFFFF"
              accessibilityLabel="change sorting"
            />
        </View>      
      </View>
      {(!view.component ? 
          <DivesList navigation={navigation} selectDive={selectDive} dives={dives} doSearch={doSearch} imperial={imperial}/> :
          <view.component navigation={navigation} view={view} imperial={imperial}/> )}
      
    </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showAggregationModal}
        onRequestClose={() => setShowAggregationModal(!showAggregationModal)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {AggregatedViews.map((group, key) => (
            <Pressable style={{marginBottom: 20}}
              key={key} onPress={() => selectView(group)}>
              <Text>{group.name}</Text>
            </Pressable>  
            ))}
          </View>
        </View>
      </Modal> 


    </View>
  );
};

export default AllDivesView
