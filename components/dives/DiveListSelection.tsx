import '../../translation'
import { useTranslation } from 'react-i18next';

import React, { useState, useEffect } from 'react';

import { getDBConnection } from '../../services/db-service';
import { getDiveCount } from '../../services/db-aggregation-service'

import { Button, View, Modal, Pressable, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';

const ListItem = ({name, label}:any) => {
  return <View style={[
        {
          flex:1,
          padding:13,
          paddingLeft: 30,
          flexDirection:'row',
        },]}>
          <Text style={[{fontSize: 20}]}>{name}</Text>
          {label ? <Text style={[{fontSize: 20, paddingHorizontal: 5, marginLeft: 20, borderRadius: 7, borderColor: "#3d3de3", color: "#3d3de3", borderWidth: 1 }]}>{label}</Text> : null }
        </View>
}

const DiveListSelection = ({navigation}:any) => {
  const { t } = useTranslation();

  const [diveCount, setDiveCount] = useState<number|null>(null)

  useEffect(() => {
    (async () => {
      const db = await getDBConnection()
      const number = await getDiveCount(db)
      setDiveCount(number)
    })()
    return () => {  }
  }, []);

  const views:any = [
    {
      section: "1",
      data: [
        {
          name: t("All Dives"),
          location: "AllDives",
          label: diveCount
        }
      ]
    }
    ,
    {
      section: "2",
      data: [
        {
          name: t("By Year"),
          location: "AggregatedView",
          aggregation: "byYear",
          column: `strftime("%Y",divedate)`
        },
        {
          name: t("By Months"),
          location: "AggregatedView",
          aggregation: "byMonth",
          column: `strftime("%Y-%m",divedate)`
        },
        {
          name: t("By Partner"),
          location: "AggregatedView",
          aggregation: "byPartner",
          column: `buddy`
        },
        {
          name: t("By Location"),
          location: "AggregatedView",
          aggregation: "byLocation",
          column: `location`
        },
        {
          name: t("By Site"),
          location: "AggregatedView",
          aggregation: "bySite",
          column: `divesite`
        },
        {
          name: t("By Boat"),
          location: "AggregatedView",
          aggregation: "byBoat",
          column: `boat`
        },                   
        {
          name: t("By Depth"),
          location: "AggregatedView",
          aggregation: "byDepth"
        },
        {
          name: t("By Duration"),
          location: "AggregatedView",
          aggregation: "byDuration"
        }
      ]
    }
  ]

  const navigate = (item:any) => {
    
  }

  if (!diveCount) return;

  return <View style={{flex:1}}>
            <SectionList
              sections={views}
              keyExtractor={(item, index) => item.location + index}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => navigation.reset({index: 0, routes: [{ name: item.location, view: item }]}) } >
                  <ListItem {...item}/>
                </TouchableOpacity>
              )}
              renderSectionHeader={({section: {section}}) => (
                <View style={{height: 10 }}></View>
              )}
            />
        </View>   
}

export default DiveListSelection


/*
          <SectionList
            ListHeaderComponent={() => <Text>Image?</Text>}
            data={views} 

          />
*/