import React, { useRef, useState, useEffect } from 'react';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { View, StatusBar, Button, Dimensions } from 'react-native';

import DiveDetail from './Dive'

const DiveSwipe = ({navigation, route, imperial}:any) => {

  console.log(imperial);

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

  return (
    <>
       <View style={{ flex: 1, backgroundColor: 'white' }} key={diveindex}>
        <SwiperFlatList key={orientation} index={diveindex} renderAll={false} data={dives}
          renderItem={({ item }) => (             
            <DiveDetail navigation={navigation} dive={item} imperial={imperial} />
          )} />
      </View>         
    </>

  )
};

export default DiveSwipe
