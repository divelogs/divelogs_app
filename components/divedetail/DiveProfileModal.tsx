import React, { useEffect, useReducer, useState, useContext } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View, TouchableOpacity, useWindowDimensions, useColorScheme } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { close } from '../../assets/svgs.js';
import DiveProfile from './DiveProfile';
import DiveProfileOverlay from './DiveProfileOverlay';
import { SampleData } from '../../models';
import { DivelogsContext } from '../../App'; 

export const DiveProfileModal = ({navigation, route}:any) => {

    const [dive] = useState(route.params.dive)

    const [context] = useContext(DivelogsContext);

    const {width, height} = useWindowDimensions()

    const isLandscape = width > height
    const profileDim = { width: Math.max(width, height), height: Math.min(width, height) }

    const theme = useColorScheme();

    const [key, setKey] = useState<any>()

    const closeView = () => {
        navigation.pop()
    }

    useEffect(() => {setKey(Math.random())}, [])

    const styles = StyleSheet.create({
        page: {
            flex: 1, 
            backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909'),
        },
        profilePortrait: {
            transform: [
                { translateX: width -0 },
                { rotate: '90deg'},
            ],
            transformOrigin: "bottom left"
        },
        close: {
            position: 'absolute',
            top: 50,
            right: 40
        }
      });

    const style = isLandscape ? {} : styles.profilePortrait

    const sampleData:SampleData = {
        sampledata: dive.sampledata, 
        samplerate: dive.samplerate, 
        duration: dive.duration, 
        height: profileDim.height, 
        width: profileDim.width, 
        lines: true, 
        forlist: false 
    }
console.log(context);
    return <View style={styles.page}>
        <View style={style}>
            <DiveProfile SampleData={sampleData} imperial={context.userProfile?.imperial || false} key={key} formodal={true}/>
            <DiveProfileOverlay sampleData={sampleData} dive={dive} imperial={context.userProfile?.imperial || false}/>
        </View>
        <TouchableOpacity style={styles.close} onPress={closeView}>
            <SvgXml xml={close} width={30} height={30} />
        </TouchableOpacity>
        
    </View>
}

export default DiveProfileModal
