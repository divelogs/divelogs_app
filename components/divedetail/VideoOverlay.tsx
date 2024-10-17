import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, useColorScheme, TouchableOpacity, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { close } from '../../assets/svgs.js';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import VideoPlayer from './videoplayer'

export const VideoOverlay = ({navigation, route}: any) => {
    
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

   const videoId = route.params.videoId
   const type = route.params.type

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
        <View style={{ width: win.width, height: win.height }}>
          <VideoPlayer
              videoId={videoId}
              type={type}
          /> 
        </View>
        <TouchableOpacity accessibilityLabel='close' style={styles.close} onPress={closeView}>
            <View style={{width: 48, height: 48}}><SvgXml xml={close} width={30} height={30} /></View>
        </TouchableOpacity>  
     </View>
   )
}

export default VideoOverlay