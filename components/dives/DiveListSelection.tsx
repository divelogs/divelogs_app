import '../../translation'
import { useTranslation } from 'react-i18next';

import { Button, View, Modal, Pressable, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

//   const grouping = [t("full list"), t("by months"), t("by partner"), t("by location"), t("by site"), t("by depth")]

const ListItem = ({name}) => {
  return <View
      style={[
        {
          flex:1,
          padding:10,
          flexDirection:'row',
        },]}><Text style={[{fontSize: 20, fontWeight: 'bold'}]}>{name}</Text></View>
}

const DiveListSelection = ({navigation}) => {
  const { t } = useTranslation();

  const views = [{
    name: "All Dives",
    location: "AllDives"
  },
  {
    name: "By Year",
    location: "AggregatedView",
    aggregation: "byYear"
  },
  {
    name: "By Depth",
    location: "AggregatedView",
    aggregation: "byDepth"
  }
  ]



  return <View>
          <FlatList
            ListHeaderComponent={() => <Text>Image?</Text>}
            data={views} 
            renderItem={({item, key}) => (
              <TouchableOpacity key={key} onPress={() => navigation.reset({index: 0, routes: [{ name: item.location, view: item }]}) } >
                <ListItem name={t(item.name)}/>
              </TouchableOpacity>
            )}
          />
        </View>   
}

export default DiveListSelection
