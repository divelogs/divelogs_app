import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import RNFetchBlob from "rn-fetch-blob";
import { SwiperFlatList } from 'react-native-swiper-flatlist';

export const Scanslider = ({navigation, route}: any) => {
    
    const { config, fs } = RNFetchBlob;
    const PictureDir = fs.dirs.DocumentDir;

    // Use this const as key of the SwiperFlatList to enforce re-render on orientation-change
    const [orientation, setOrientation] = useState('');

    useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
        if (width<height) {
        setOrientation("PORTRAIT")
        } else {
        setOrientation("LANDSCAPE")    
        }
    })
    }, []);

    const win = Dimensions.get('window');
    const sliderstyles = StyleSheet.create({
    image: {
        flex: 1,
        alignSelf: 'stretch',
        width: win.width,
        height: win.height,
    }
    });

   const thekey = route.params.thekey
   const allScans = route.params.allScans

   return (
     <View style={{ flex: 1, }}>       
       <SwiperFlatList key={orientation} index={thekey} renderAll={true} data={allScans} renderItem={({ item }) => (
           <View style={{ justifyContent: 'center'}}>
             <Image style={sliderstyles.image} resizeMode={'contain'} source = {{uri: "file://" + PictureDir + item}}/>
           </View>
         )} />
     </View>
   )
}

export default Scanslider