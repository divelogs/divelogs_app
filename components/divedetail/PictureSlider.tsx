import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, useColorScheme, TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { close } from '../../assets/svgs.js';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

export const PictureSlider = ({navigation, route}: any) => {
    
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
   const allPictures = route.params.allPictures

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
        <SwiperFlatList key={orientation} index={thekey} renderAll={true} data={allPictures} renderItem={({ item }) => (
           <View accessibilityLabel='picture' style={{ justifyContent: 'center'}}>
             <Image accessibilityLabel='picture' style={sliderstyles.image} resizeMode={'contain'} source = {{uri: item}}/>
           </View>
         )} />
        <TouchableOpacity accessibilityLabel='close' style={styles.close} onPress={closeView}>
          <View style={{width: 48, height: 48}}><SvgXml xml={close} width={30} height={30} /></View>
        </TouchableOpacity>  
     </View>
   )
}

export default PictureSlider