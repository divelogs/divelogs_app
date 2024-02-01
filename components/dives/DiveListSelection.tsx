import '../../translation'
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { getDBConnection } from '../../services/db-service';
import { getDiveCount } from '../../services/db-aggregation-service'
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';

const ListItem = ({name, label}:any) => {
  return <View style={[
    {
      flex:1,
      padding:13,
      paddingLeft: 30,
      flexDirection:'row',
    },]}>
      <Text style={[{fontSize: 20}]}>{name}</Text>
      {label ? <View style={styles.countlabel}><Text style={styles.countlabeltext}>{label}</Text></View> : null }
    </View>
}

const DiveListSelection = ({navigation, route}:any) => {
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

  useEffect(() => {
    navigation.navigate("AllDivesNoAnimation")
  }, [])

  const views:any = [
    {
      section: "1",
      data: [
      {
        name: t("allDives"),
        location: "AllDives",
        label: diveCount
      }
      ]
    },{
      section: "2",
      data: [
      {
        name: t("byYear"),
        location: "AggregatedView",
        aggregation: "byYear",
        column: `strftime("%Y",divedate)`,
        sort: 'DESC',
        search: false
      },
      {
        name: t("byMonth"),
        location: "AggregatedView",
        aggregation: "byMonth",
        column: `strftime("%Y-%m",divedate)`,
        sort: 'DESC',
        search: false
      },
      {
        name: t("byPartner"),
        location: "AggregatedView",
        aggregation: "byPartner",
        column: `buddy`,
        search: true
      },
      {
        name: t("byDiveGroup"),
        location: "AggregatedView",
        aggregation: "byDiveGroup",
        column: `buddyflock`,
        search: true
      },
      {
        name: t("byLocation"),
        location: "AggregatedView",
        aggregation: "byLocation",
        column: `location`,
        search: true
      },
      {
        name: t("bySite"),
        location: "AggregatedView",
        aggregation: "bySite",
        column: `divesite`,
        search: true
      },
      {
        name: t("byBoat"),
        location: "AggregatedView",
        aggregation: "byBoat",
        column: `boat`,
        search: true
      },                   
      {
        name: t("byDepth"),
        location: "AggregatedView",
        aggregation: "byDepth",
        search: false
      },
      {
        name: t("byDuration"),
        location: "AggregatedView",
        aggregation: "byDuration",
        search: false
      }
      ]
    }]

  const navigate = (item:any) => {
    navigation.navigate(item.location, {name: item.location, view: item})
    //navigation.reset({index: 0, routes: [{ name: item.location, view: item }]}) 
  }

  //if (!diveCount) return;

  return <View style={{flex:1}}>
            <Text style={styles.listHeader}>{t('choosefilter')}:</Text>
            <SectionList
              sections={views}
              keyExtractor={(item, index) => item.location + index}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => navigate(item) } >
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

const styles = StyleSheet.create({
  listHeader: {
    fontSize: 25,    
    fontWeight: '700',
    marginTop: 5,
    marginLeft: 10,
    color: '#3eb8f1'
  },
  countlabel: {    
    paddingHorizontal: 5, 
    marginLeft: 20, 
    borderRadius: 10, 
    borderColor: "#3fb9f2", 
    paddingTop:3,
    backgroundColor: '#3fb9f2',
    borderWidth: 1,
    minWidth:40,
  },
  countlabeltext: {
    fontSize: 14, 
    fontWeight: '700',
    color: "#FFFFFF", 
    textAlign:"center"
  }
});
