
  import { Button,Image,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text, TextInput,View,TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Platform } from 'react-native';
  import { SvgXml } from 'react-native-svg';
  import SearchBar from 'react-native-search-bar'; 

  import { Dive } from '../../models'
  import '../../translation'
  import { useTranslation } from 'react-i18next';
  import React, { useState, useEffect } from 'react';

  import { divelogs_logo } from '../../assets/svgs.js'

  import { DiveListItem } from './DiveListItem';
  import DiveListFooterStats from './DiveListFooter';


  import styles from '../../stylesheets/styles'


  interface Statistics {
    [key: string]: number;
  }

  const DiveList = ({navigation, dives, doSearch, selectDive, imperial}:any) => {

    const [searchText, setSearchText] = useState<string>('');
    const [statistics, setStatistics] = useState<Statistics>({})
    const { t } = useTranslation(); 

    useEffect(() => {
      let s:Statistics = {};

      if (dives.length){
        s.dives = dives.length
        s.maxDepth = 0;
        s.maxDuration = 0;
        s.avgDuration = 0;
        
        dives.reduce((stat:Statistics, item:Dive) => {
          if (!!item.maxdepth) stat.maxDepth = Math.max(item.maxdepth, stat.maxDepth)
          if (!!item.duration) stat.maxDuration = Math.max(item.duration, stat.maxDuration)
          if (!!item.duration) stat.avgDuration = (item.duration + stat.avgDuration)
          return stat;
        }, s)
        
        s.avgDuration = s.avgDuration / s.dives
      }
      setStatistics(s)
    }, [dives])

    const startSearch = (searchtext:string) => {
      setSearchText(searchtext)
      doSearch(searchtext);
    }
    const cancelSearch = () => startSearch('')

    const changeSearch = (searchFor:string) => {
      if (searchFor.length == 0 && searchText.length != 0)
        cancelSearch()
    }

    const Filter = () => {
      if (!!doSearch)
        return <SearchBar
                placeholder={t('search')}
                onChangeText={changeSearch}
                onSearchButtonPress={startSearch}
                cancelButtonText={t('reset')}
                onCancelButtonPress={cancelSearch}
                showsCancelButton={true}
                autoCapitalize={'none'}
                text={searchText}
              /> 
      return null
    }
    
    return (      
        <View style={{flex: 1}}>
          <FlatList
            data={dives} 
            ListHeaderComponent={ 
              <Filter/> 
            }
            renderItem={({item}) => (
              <TouchableOpacity key={item.id} onPress={() => selectDive(item)} >
                <DiveListItem Dive={item} imperial={imperial}/>
              </TouchableOpacity>
            )}
            ListFooterComponent={({item}) => (
              <DiveListFooterStats {...item} dives={dives} imperial={imperial} />
            )}
            ListEmptyComponent={<View style={[styles.noListContent]}><Text style={[styles.noListContentText]}>{t('nodives')}</Text></View>}
          />
        </View>         
    );
  };

  export default DiveList
