import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import SearchBar from 'react-native-search-bar'; 
import React, { useState, useEffect } from 'react';
import { getDBConnection } from '../../services/db-service';
import { getSingleColumnStats, getDepthStats, getDurationStats, getPrecalcedStats } from '../../services/db-aggregation-service';
import '../../translation'
import { useTranslation } from 'react-i18next';
import { StatVal } from '../../models';
import divelogsStyles from '../../stylesheets/styles'


const StatRow = ({item, label}:any) => (<View
      style={styles.statRowStyle}>
      <Text style={styles.statRowText}>{label?.length > 0 ? label : "?"}</Text>
      <View style={styles.countlabel}><Text style={styles.countlabeltext}>{item.val}</Text></View>
    </View>) 

export const AggregationView = ({navigation, route, view, imperial}:any) => {

  const { t } = useTranslation();
  const [stats, setStats] = useState<StatVal[]>([])
  const [filteredStats, setFilteredStats] = useState<StatVal[]>([])
  const [filter, setFilter] = useState<string>("")
  const name = route.params.view.name

  useEffect(() => {
    (async () => {
      const statistics = await loadData()
      setStats(statistics)
      setFilteredStats(statistics)
    })()

    navigation.setOptions({title: route.params.view.name})

    return () => {  }
  }, [view]);

  useEffect(() => {
    if (filter.length <= 0){
      setFilteredStats(stats)
      return
    }
    const filtered = stats.filter(a => a.bez.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
                          .map(a => ({...a}))
    setFilteredStats(filtered)
  }, [filter])


  const loadData = async () : Promise<StatVal[]> => {
    try {
      const db = await getDBConnection();

      switch (route.params.view.aggregation){
        case "byDepth":
          return await getDepthStats(db, imperial)
        case "byDuration":
          return await getDurationStats(db)
        case "byPartner":
        case "byDiveGroup":
          return await getPrecalcedStats(db, route.params.view.column)
        default:
          return await getSingleColumnStats(db, route.params.view.column, route.params.view.sort)
      }
    } catch (error) {
      console.error(error);
      return []
    }
  }

  const selectStat = (item:StatVal, label:string) => {
    navigation.navigate('FilteredDives', { filter: {...item, label: label}, view: route.params.view})
  }

  const makeLabel = (item:StatVal, type:string) : string => {
    let label:string = "";
    
    switch (type){
      case "byMonth":
        const [year, month] = item.bez.split("-")
        return t("month"+month) + " " + year

      case "byDepth":
        const [left, right] = item.bez.split("-")
        const unit = imperial ? "ft" : "m"
  
        if (left == "0")
          return `< ${right} ${t(unit)}`
        return `${left} - ${right} ${t(unit)}`

      case "byDuration":
        const [from, until] = item.bez.split("-")
        if (from == "0")
          return `< ${until} ${t("minutes")}`
        return `${from} - ${until} ${t("minutes")}`
     
      case "byDiveGroup":
        const search = item.bez;
        const lastIndex = search.lastIndexOf(',');
        if (lastIndex < 0)
          return search;
        return search.slice(0, lastIndex) + " " + (t('and')) + search.slice(lastIndex + 1);

      default:
        return item.bez
    }
  }

  const startSearch = (searchFor:string) => {
    setFilter(searchFor)
  }

  const cancelSearch = () => setFilter('')

  const Filter = () => {
    if (!route.params.view.search) return null
    return <SearchBar
      placeholder={t('search')}
      onChangeText={cancelSearch}
      onSearchButtonPress={startSearch}
      cancelButtonText={t('reset')}
      onCancelButtonPress={cancelSearch}
      showsCancelButton={true}
      autoCapitalize={'none'}
      text={filter}
    /> 
  }

  return <View style={{flex: 1}}>
          <FlatList
            ListHeaderComponent={() => <>
              <Filter/>
              <Text style={divelogsStyles.viewHeader}>{name}</Text>
              </>
              }
            data={filteredStats} 
            renderItem={({item}) => {
              const label = makeLabel(item,route.params.view.aggregation)
              return (<TouchableOpacity onPress={() => selectStat(item, label)} >
                <StatRow label={label} item={item}/>
              </TouchableOpacity>
            )}}
          />
        </View>    
}


const styles = StyleSheet.create({
  listHeader: {
    fontSize: 25,
    
    fontWeight: '700',
    marginTop: 5,
    marginLeft: 10,
    color: '#3eb8f1'
  },
  countlabel: {
    height: 22,
    paddingHorizontal: 5, 
    marginLeft: 20, 
    borderRadius: 10, 
    borderColor: "#3fb9f2", 
    paddingTop:1,

    backgroundColor: '#3fb9f2',
    borderWidth: 1,
    minWidth:40,
    
    
  },
  countlabeltext: {
    fontSize: 14, 
    fontWeight: '700',
    color: "#FFFFFF", 
    textAlign:"center"
  },
  statRowStyle: {
    flex:1,
    padding:10,
    marginTop: 10,
    flexDirection: 'row',
  },
  statRowText: {
    flex: 3,
    fontSize: 18,
  },
  tinyLogo: {
    width:150,
    height:34
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  bold: {
    fontWeight: "700"
  },
  appTitleView: {
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#3fb9f2'
  },
});


