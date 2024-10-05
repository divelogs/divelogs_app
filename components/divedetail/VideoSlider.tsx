import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, useColorScheme, TouchableOpacity, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { close } from '../../assets/svgs.js';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import VideoPlayer from './videoplayer'

export const VideoSlider = ({navigation, route}: any) => {
    
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

   const thekey = route.params.thekey
   const allvideos = route.params.allvideos

   const closeView = () => {
     navigation.pop()
   }

   const theme = useColorScheme();
   const styles = StyleSheet.create({
     page: {
       backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909' ),
       color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
       flex: 1
     },
     close: {
        position: 'absolute',
        top: 50,
        right: 40
    }
   });

   return (
     <View style={styles.page}>       
        <SwiperFlatList key={orientation} index={thekey} renderAll={true} data={allvideos} renderItem={({ item }) => (
           <View style={{ width: win.width, height: win.height }}>
              <VideoPlayer
                  videoId={item.videoid}
                  type={item.type}
              /> 
           </View>           
         )} />
        <TouchableOpacity style={styles.close} onPress={closeView}>
            <SvgXml xml={close} width={30} height={30} />
        </TouchableOpacity>  
     </View>
   )
}

export default VideoSlider