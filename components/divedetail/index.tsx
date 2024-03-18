import React, { useState, useEffect } from 'react';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { View, Dimensions, useColorScheme, StyleSheet } from 'react-native';
import DiveDetail from './Dive'

const DiveSwipe = ({navigation, route}:any) => {

  // Use this const as key of the SwiperFlatList to enforce re-render on orientation-change
  const [orientation, setOrientation] = useState('');
  const dives = route.params.dives
  const diveindex = dives.findIndex((obj: { id: any; }) => obj.id === route.params.diveId);
  
  useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
      if (width<height) {
        setOrientation("PORTRAIT")
      } else {
        setOrientation("LANDSCAPE")    
      }
    })
  }, []);

  const theme = useColorScheme();
  const style = StyleSheet.create({
    page: {
      backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909'),
      flex: 1
    }
  })

  return (
    <>
       <View style={style.page} key={diveindex}>
        <SwiperFlatList key={orientation} index={diveindex} renderAll={false} data={dives}
          renderItem={({ item }) => (             
            <DiveDetail navigation={navigation} dive={item}/>
          )} />
      </View>         
    </>

  )
};

export default DiveSwipe
