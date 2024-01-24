import '../../translation'
import { useTranslation } from 'react-i18next';

import { Button, View, Modal, Pressable, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

//   const grouping = [t("full list"), t("by months"), t("by partner"), t("by location"), t("by site"), t("by depth")]

const ListItem = ({name}:any) => {
  return <View
      style={[
        {
          flex:1,
          padding:10,
          flexDirection:'row',
        },]}><Text style={[{fontSize: 20, fontWeight: 'bold'}]}>{name}</Text></View>
}

const DiveListSelection = ({navigation}:any) => {
  const { t } = useTranslation();

  const views = [{
      name: "All Dives",
      location: "AllDives"
    },
    {
      name: "By Year",
      location: "AggregatedView",
      aggregation: "byYear",
      column: `strftime("%Y",divedate)`
    },
    {
      name: "By Months",
      location: "AggregatedView",
      aggregation: "byMonth",
      column: `strftime("%Y-%m",divedate)`
    },
    {
      name: "By Partner",
      location: "AggregatedView",
      aggregation: "byPartner",
      column: `buddy`
    },
    {
      name: "By Location",
      location: "AggregatedView",
      aggregation: "byLocation",
      column: `location`
    },
    {
      name: "By Site",
      location: "AggregatedView",
      aggregation: "bySite",
      column: `divesite`
    },
    {
      name: "By Boat",
      location: "AggregatedView",
      aggregation: "byBoat",
      column: `boat`
    },                   
    {
      name: "By Depth",
      location: "AggregatedView",
      aggregation: "byDepth"
    },
    {
      name: "By Duration",
      location: "AggregatedView",
      aggregation: "byDuration"
    }
  ]



  return <View style={{flex:1}}>
          <FlatList
            ListHeaderComponent={() => <Text>Image?</Text>}
            data={views} 
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => navigation.reset({index: 0, routes: [{ name: item.location, view: item }]}) } >
                <ListItem name={t(item.name)}/>
              </TouchableOpacity>
            )}
          />
        </View>   
}

export default DiveListSelection
