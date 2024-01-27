
import React, { useCallback, useEffect, useState, useLayoutEffect } from 'react';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Image, StyleSheet, Vibration, TouchableOpacity } from 'react-native';

import { getDBConnection, getDives, getBearerToken, getProfile, saveDives, saveStatistics, writeBearerToken, saveCertifications, resetSyncForced, saveGearItems, saveSettings, getImperial, saveProfile, } from '../../services/db-service';
import { Api } from '../../services/api-service'
import { APIDive, Certification } from '../../models';
import { UserProfile } from '../../models'

import '../../translation'
import { useTranslation } from 'react-i18next';

import Loader from '../generic/loader'

import { ProfilePictureWithLoader } from '../generic/userprofile';

type SyncStep = {
    name?: string;
    action: () => Promise<void>;
  };

const Sync = ({navigation}:any) => {

    const [currentStep, setCurrentStep] = useState<number>(0)
    const [userprofile, setUserProfile] = useState<UserProfile|null>()
    const [diveCount, setDiveCount] = useState(0)
    const [bag, setBag] = useState<any>()

    const { t } = useTranslation();

    const SYNC_STEPS:SyncStep[] = [
        { name: "Get profile from database",
          action: async () => {
            const db = await getDBConnection();         
            const profile = await getProfile(db)
            if (!!profile)
                setUserProfile(profile) 
        }},
        { name: "Ensure connectivity and bearer token",
          action: async () => {
            await Api.isApiAvailable()

            const db = await getDBConnection();
            const token = await getBearerToken(db)
            Api.setBearerToken(token!)
            
            const valid = await Api.isBearerTokenValid()

            if (!valid)
                navigation.reset({index: 0, routes: [{ name: 'Login'}]})
        }},        
        { name: "Get user profile from API",
          action: async () => {        
            const profile = await Api.getUserProfile()
            setBag(profile) 
        }},
        { name: "Download profile picture",
          action: async () => {
            if (!bag?.profilePictureUrl) return;
            bag.profilePictureUrl = (await Api.downloadImages([bag.profilePictureUrl], "profile"))[bag.profilePictureUrl]
            setUserProfile(bag)
        }},
        { name: "Save profile in database",
          action: async () => {           
            const db = await getDBConnection();
            await saveProfile(db, userprofile!)
            await saveSettings(db, userprofile!.imperial, userprofile!.startnumber);
        }},
        { name: "Download logbook",
          action: async () => {
            const apiDives : any = await Api.getDives()
            setBag(apiDives)
            setDiveCount(apiDives.length)
        }},
        { name: "Store dives locally",
          action: async () => {
            const db = await getDBConnection();
            await saveDives(db, bag);
            const storedDives = await getDives(db,"ASC",'');
            setBag(storedDives)
        }},
        { name: "Prepare divelogs statistics",
          action: async () => {
            const db = await getDBConnection();
            await saveStatistics(db, bag);
        }},
        { name: "Download brevets",
          action: async () => {
            const db = await getDBConnection(); 
            const certifications:any = await Api.getCertifications()
            setBag(certifications)
        }},
        { name: "Download brevet images",
          action: async () => {
            const certs:Certification[] = bag
            const imageUrls = certs.flatMap((a:Certification) => a.scans)

            var downloadResult = await Api.downloadImages(imageUrls, "brevets")
            certs.forEach(c => {
                c.scans = c.scans.filter(a => a?.length > 0)
                                 .map((a:string) => downloadResult[a])
            })
            setBag(certs)
        }},
        { name: "Store brevets in database",
          action: async () => {
            const db = await getDBConnection(); 
            await saveCertifications(db, bag)
        }},
        { name: "Download and store gear",
          action: async () => {
            const db = await getDBConnection(); 
            const gearitems = await Api.getGear()
            await saveGearItems(db, gearitems);
        }},                
        { name: "Vibrate and done!",
          action: async () => {
            Vibration.vibrate(250);
            resetSyncForced();
            navigation.reset({index: 0, routes: [{ name: 'Home'}]})
        }}
    ]

    useEffect(() => {
        if (currentStep >= SYNC_STEPS.length) 
            return;
        
        (async () => {
            const step = SYNC_STEPS[currentStep]
            console.log(`Sync step: ${currentStep+1}/${SYNC_STEPS.length}: ${step.name}`)
            await step.action()
            setTimeout(() => setCurrentStep(currentStep+1), 150)
          })()
    }, [currentStep])

    return (<View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
        <View style={{position:'absolute', alignItems:'center', width: '100%', top: '25%'}}>
            <ProfilePictureWithLoader imageSize={170} userprofile={userprofile} style={styles.screen}/>

            <Text style={[styles.text]}>{t('loading')}</Text>
            <Text style={[styles.text]}>{t('step')} {currentStep} / {SYNC_STEPS.length}</Text>
        </View>
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
    },
    text: {
        color: '#fff'
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