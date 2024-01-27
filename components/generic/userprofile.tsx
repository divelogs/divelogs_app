
import { useEffect, useState } from 'react';
import {SafeAreaView,Text,TextInput,View,Dimensions, ActivityIndicator, Alert, Modal, Pressable, NativeModules, Image, StyleSheet, Vibration, TouchableOpacity } from 'react-native';
import { UserProfile } from '../../models';

import { getDBConnection, getDives, getBearerToken, saveDives, saveStatistics, writeBearerToken, saveCertifications, updateDB, saveGearItems, saveSettings, getImperial, saveProfile, getProfile, } from '../../services/db-service';

const ProfilePicture = ({userprofile, style}:any) : any => 
{
    const [profile, setProfile] = useState<UserProfile|null>(userprofile)

    useEffect(() => {
        if (profile != null) return;

        (async () => {
            const db = await getDBConnection();
            const p = await getProfile(db)
            setProfile(p)
        })()
    }, [])

    if (!profile) 
        return null;

    return <View style={[style]}>
            <Image style={styles.image} source={{ uri: profile!.profilePictureUrl }} />
            <Text style={styles.profile}>{profile!.username}</Text>
        </View>
}

const styles = StyleSheet.create({
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

export default ProfilePicture