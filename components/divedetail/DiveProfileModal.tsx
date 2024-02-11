import React, { useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View, TouchableOpacity, useWindowDimensions } from 'react-native';

import DiveProfile from './DiveProfile';
import DiveProfileOverlay from './DiveProfileOverlay';
import { SampleData } from '../../models';

export const DiveProfileModal = ({navigation, route}:any) => {

    const [dive] = useState(route.params.dive)

    const {width, height} = useWindowDimensions()
    const isLandscape = width > height
    const profileDim = { width: Math.max(width, height), height: Math.min(width, height) }

    const closeView = () => {
        navigation.pop()
    }

    const styles = StyleSheet.create({
        page: {
            flex: 1, 
            backgroundColor: "white"
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
            top: 30,
            right: 30
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

    return <View style={styles.page}>
        <View style={style}>
            <DiveProfile SampleData={sampleData} imperial={false} />
            <DiveProfileOverlay sampleData={sampleData}/>
        </View>


        <TouchableOpacity style={styles.close} onPress={closeView}>
            <Text style={{fontSize: 30}}>🦀</Text>
        </TouchableOpacity>
        
    </View>
}

export default DiveProfileModal
