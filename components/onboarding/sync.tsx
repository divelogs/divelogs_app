
import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Image, StyleSheet, Vibration, TouchableOpacity } from 'react-native';

import { getDBConnection, getDives, getBearerToken, saveDives, saveStatistics, writeBearerToken, saveCertifications, resetSyncForced, saveGearItems, saveSettings, getImperial, saveProfile, } from '../../services/db-service';
import { Api } from '../../services/api-service'
import { APIDive, Certification } from '../../models';
import { UserProfile } from '../../models'

import ProfilePicture from '../generic/userprofile';

const Sync = ({navigation}:any) => {

    const [currentStep, setCurrentStep] = useState<number>(0)
    const [userprofile, setUserProfile] = useState<UserProfile|null>()
    const [diveCount, setDiveCount] = useState(0)
    const [bag, setBag] = useState<any>()

    const SYNC_STEPS = [
        async () => {
            console.log("loadUserProfile")             
            const profile = await Api.getUserProfile()
            setBag(profile) 
        },
        async () => {
            console.log("downloadImage")
            if (!bag?.profilePictureUrl) return;
            bag.profilePictureUrl = (await Api.downloadImages([bag.profilePictureUrl], "profile"))[bag.profilePictureUrl]
            setUserProfile(bag)
        },
        async () => {
            console.log("storeUserProfile")             
            const db = await getDBConnection();
            await saveProfile(db, userprofile!)
            await saveSettings(db, userprofile!.imperial, userprofile!.startnumber);
        },
        async () => {
            console.log("loadDives")   
            const apiDives : any = await Api.getDives()
            setBag(apiDives)
            setDiveCount(apiDives.length)
        },
        async () => {
            console.log("saveDives")   
            const db = await getDBConnection();
            await saveDives(db, bag);
            const storedDives = await getDives(db,"ASC",'');
            setBag(storedDives)
        },
        async () => {
            console.log("prepareStatistics")   
            const db = await getDBConnection();
            await saveStatistics(db, bag);
        },
        async () => {
            console.log("certifactions")  
            const db = await getDBConnection(); 
            const certifications:any = await Api.getCertifications()
            setBag(certifications)
        },
        async () => {
            console.log("downloading brevets")

            const certs:Certification[] = bag
            const imageUrls = certs.flatMap((a:Certification) => a.scans)

            var downloadResult = await Api.downloadImages(imageUrls, "brevets")
            certs.forEach(c => {
                c.scans = c.scans.filter(a => a?.length > 0)
                                 .map((a:string) => downloadResult[a])
            })
            setBag(certs)
        },
        async () => {
            const db = await getDBConnection(); 

            await saveCertifications(db, bag)
        },
        async () => {
            console.log("gear")  
            const db = await getDBConnection(); 
            const gearitems = await Api.getGear()
            await saveGearItems(db, gearitems);
        },                
        async () => {
            console.log("vibe!")   
            Vibration.vibrate(250);
        },
        async () => {
            resetSyncForced();
            //navigation.reset({index: 0, routes: [{ name: 'Home'}]})
        }
    ]

    useEffect(() => {
        if (currentStep >= SYNC_STEPS.length) 
            return;
        
        (async () => {
            console.log(`Sync step: ${currentStep+1}/${SYNC_STEPS.length}`)
            await SYNC_STEPS[currentStep]()
            setTimeout(() => setCurrentStep(currentStep+1), 150)
          })()
    }, [currentStep])

    return (<View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
        <Text>Downloading the logbook</Text>
        <ProfilePicture user={userprofile} style={styles.screen}/>
        <Text >Step: {currentStep}</Text>
        <TouchableOpacity onPress={() => setCurrentStep(0)}>
            <Text >Redo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.reset({index: 0, routes: [{ name: 'Home'}]})}>
            <Text >Open App</Text>
        </TouchableOpacity>

    </View>)
}

const styles = StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    // styling the image
    image: {
      width: 100,
      height: 100,
      borderRadius: 1000,
      borderColor: '#fff',
      borderWidth: 3,      
    },
    profile: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '300'
    }
  });



export default Sync


/*

    <View style={styles.screen}>
      <Image style={styles.image} source={{ uri: IMG_URI }} />
    </View>



  source={{
    uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSYzYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg==',
  }}
*/