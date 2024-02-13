
import React, { useEffect, useState, useContext } from 'react';
import { Text, View, StyleSheet, Vibration, Platform } from 'react-native';
import { getDBConnection, getDives, getBearerToken, getProfile, saveDives, saveStatistics, writeBearerToken, saveCertifications, resetSyncForced, saveGearItems, saveSettings, saveProfile, } from '../../services/db-service';
import { Api } from '../../services/api-service'
import { Certification, UpdateableAppContext } from '../../models';
import { UserProfile } from '../../models'
import '../../translation'
import { useTranslation } from 'react-i18next';
import { ProfilePictureWithLoader } from '../generic/userprofile';

enum Recovery {
    Fail = 1,
    RetryAndFail,
    ReturnToApp,
    Login,
    Skip,
    RetryAndSkip,
  }

type SyncStep = {
    name: string;
    action: () => Promise<void>;
    recover?: Recovery;
  };

const Sync = ({navigation}:any) => {

    const [currentStep, setCurrentStep] = useState<number>(0)
    const [retry, setRetry] = useState<number>(0)
    const [userprofile, setUserProfile] = useState<UserProfile|null>()
    const [appContext, updateUserprofileContext ] = useContext(DivelogsContext)
    const [diveCount, setDiveCount] = useState(0)
    const [bag, setBag] = useState<any>()

    const { t } = useTranslation();

    const SYNC_STEPS:SyncStep[] = [
        { name: "Get profile from database", recover: Recovery.ReturnToApp,
          action: async () => {
            const db = await getDBConnection();         
            const profile = await getProfile(db)
            if (!!profile)
                setUserProfile(profile) 
        }},
        { name: "Ensure connectivity to divelogs API", recover: Recovery.RetryAndFail,
          action: async () => {
            
            const av = await Api.isApiAvailable() 
            if (!av)
                throw "The Divelogs API is not available - maybe your device has no connectivity to the internet"
        }},
        { name: "Ensure bearer token validity", recover: Recovery.Login,
          action: async () => {
            const db = await getDBConnection();
            const token = await getBearerToken(db)
            Api.setBearerToken(token!)
            const valid = await Api.isBearerTokenValid()
            
            if (!valid){
                Api.setBearerToken("expired")
                writeBearerToken(db, "expired")
                throw "Bearer Token Expired"
            }
        }},        
        { name: "Get user profile from API", recover: Recovery.RetryAndFail,
        action: async () => {        
            const profile = await Api.getUserProfile()

            setBag(profile)
            setUserProfile(profile)
            console.log(profile);
        }},
        { name: "Download profile picture", recover: Recovery.RetryAndSkip,
          action: async () => {
            if (!bag?.profilePictureUrl) return;
            const buff = bag?.profilePictureUrl
            bag.profilePictureUrl = (await Api.downloadImages([bag.profilePictureUrl], "profile"))[bag.profilePictureUrl]

            if (buff != bag.profilePictureUrl)
                setUserProfile(bag)
              
            updateUserprofileContext({...appContext, userProfile: bag})
        }},
        { name: "Save profile in database", recover: Recovery.RetryAndFail,
          action: async () => {           
            const db = await getDBConnection();
            await saveProfile(db, userprofile!)
            await saveSettings(db, userprofile!.imperial, userprofile!.startnumber);
        }},
        { name: "Download logbook", recover: Recovery.RetryAndFail,
          action: async () => {
            const apiDives : any = await Api.getDives()
            setBag(apiDives)
            setDiveCount(apiDives.length)
        }},
        { name: "Store dives locally", recover: Recovery.RetryAndFail,
          action: async () => {
            const db = await getDBConnection();
            await saveDives(db, bag);
            const storedDives = await getDives(db,"ASC",'');
            setBag(storedDives)
        }},
        { name: "Prepare divelogs statistics", recover: Recovery.RetryAndSkip,
          action: async () => {
            const db = await getDBConnection();
            await saveStatistics(db, bag);
        }},
        { name: "Download brevets", recover: Recovery.RetryAndSkip,
          action: async () => {
            const db = await getDBConnection(); 
            const certifications:any = await Api.getCertifications()
            setBag(certifications)
        }},
        { name: "Download brevet images", recover: Recovery.RetryAndSkip,
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
        { name: "Store brevets in database", recover: Recovery.RetryAndSkip,
          action: async () => {
            const db = await getDBConnection(); 
            await saveCertifications(db, bag)
        }},
        { name: "Download and store gear", recover: Recovery.RetryAndSkip,
          action: async () => {
            const db = await getDBConnection(); 
            const gearitems = await Api.getGear()
            await saveGearItems(db, gearitems);
        }}
        ,                
        { name: "Vibrate and done!", recover: Recovery.Fail,
          action: async () => {
            if (Platform.OS == 'ios') Vibration.vibrate(150);
            resetSyncForced();
            navigation.reset({index: 0, routes: [{ name: 'Home'}]})
        }}
    ]

    const makeFakeDelay = (timeout:number) : Promise<void> => 
        new Promise((res, _) => setTimeout(res, timeout))

    useEffect(() => {
        if (currentStep >= SYNC_STEPS.length) 
            return;
        
        (async () => {
            const step = SYNC_STEPS[currentStep]
            console.log(`Sync step: ${currentStep+1}/${SYNC_STEPS.length}: ${step.name}`)
            
            await Promise.all([makeFakeDelay(200), step.action()])
            .then(r => setCurrentStep(currentStep+1) )
            .then(r => setRetry(0) )
            .catch(async r => {
                await makeFakeDelay(2000)
                
                switch (step.recover ?? Recovery.Fail){
                    case Recovery.RetryAndSkip:
                    case Recovery.RetryAndFail:
                        if (retry > 2)
                            break;
                        setRetry(retry+1)
                        return;
                    default:
                        break;
                }

                switch (step.recover ?? Recovery.Fail)
                {
                    case Recovery.Fail:
                    case Recovery.RetryAndFail:
                        navigation.replace('SyncFail', {err: r, step: step.name})
                        break;
                    case Recovery.ReturnToApp:
                        navigation.replace('Home')
                        break;
                    case Recovery.Login:
                        navigation.replace('Login')
                        break;
                    case Recovery.Skip:
                    case Recovery.RetryAndSkip:
                        setCurrentStep(currentStep+1)
                        break;
                }
            })
            
          })()
    }, [currentStep, retry])

    return (<View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
        <View style={{position:'absolute', alignItems:'center', width: '100%', top: '25%'}}>
            <ProfilePictureWithLoader imageSize={170} userprofile={userprofile} style={styles.screen}/>

            <Text style={[styles.text]}>{t('loading')}</Text>
            <Text style={[styles.text]}>{t('step')} {currentStep+1} / {SYNC_STEPS.length+1}</Text>
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