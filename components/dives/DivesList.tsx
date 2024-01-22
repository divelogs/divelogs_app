
  import { Button,Image,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TextInput,View,TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Platform } from 'react-native';
  import { SvgXml } from 'react-native-svg';
  import SearchBar from 'react-native-search-bar'; 

  import '../../translation'
  import { useTranslation } from 'react-i18next';
  import React, { useState } from 'react';

  import { divelogs_logo } from '../../assets/svgs.js'

  import { DiveListItem } from './DiveListItem';


  import styles from '../../stylesheets/styles'

  const DiveList = ({navigation, dives, doSearch, selectDive, imperial}:any) => {

    const [searchText, setSearchText] = useState<string>('');
    const { t } = useTranslation(); 

    const startSearch = (searchtext:string) => {
      setSearchText(searchtext)
      doSearch(searchtext);
    }
    const cancelSearch = () => startSearch('')

    const Filter = () => {
      if (!!doSearch)
        return <SearchBar
                placeholder={t('search')}
                //onChangeText={setSearch}
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
        <View>
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
          />
        </View>         
    );
  };

  export default DiveList
