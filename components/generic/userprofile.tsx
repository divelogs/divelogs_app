import { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { UserProfile } from '../../models';
import RNFetchBlob from "rn-fetch-blob";
import '../../translation'
import { useTranslation } from 'react-i18next';
import { getDBConnection, getProfile, } from '../../services/db-service';
import Loader from './loader'

export const ProfilePicture = ({userprofile, style, imageSize}:any) : any => 
{
    const { t } = useTranslation(); 
    const [profile, setProfile] = useState<UserProfile|null>(userprofile)
    const { config, fs } = RNFetchBlob;
    
    useEffect(() => {
        if (profile != null) return;

        (async () => {
            const db = await getDBConnection();
            const p = await getProfile(db)
            setProfile(p)
        })()
    }, [])

    useEffect(() => {
        if (userprofile == null) return;
        setProfile(userprofile)
    }, [userprofile])

    let s : any
    if (!!imageSize)
        s = { width: imageSize, height: imageSize }

    return <View style={[style, { width: '100%', alignItems: 'center' }]}>
            {!profile ? <>
                <View style={[styles.image, s]}></View>
                <Text style={styles.profile}>{t("welcome")}</Text>
            </> : <>
                <Image style={[styles.image, s]} source={{ uri: fs.dirs.DocumentDir + profile!.profilePictureUrl }} />
                <Text style={styles.profile}>{profile!.username}</Text>
            </>}
        </View>
}

export const ProfilePictureWithLoader = (props:any) => {

    const imageSize = props.imageSize ?? 100
    const pingSize = imageSize * 1.1
    const pingpos = {left: (300 / 2) - (pingSize / 2), top: (imageSize - pingSize) / 2 }

    const showPing = props.showPing ?? true

    let s = {}
    if (!!props.style.top)
        s = {'top': props.style.top ?? 0}
    if (!!props.style.left)
        s = {'left': props.style.left ?? 0}
    if (!!props.style.right)
        s = {'right': props.style.right ?? 0}
    if (!!props.style.bottom)
        s = {'bottom': props.style.bottom ?? 0}
    if (Object.keys(s).length > 0)
        s = {'position': 'absolute'}

    return <View {...props} style={[{width: 300}, s]}>
        <Loader active={showPing} pingSize={pingSize} style={pingpos}/>
        <ProfilePicture {...props} imageSize={imageSize}/><Text>{showPing}</Text>
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
      backgroundColor: '#3eb8f1'
    },
    profile: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '300'
    }
  });

export default ProfilePicture