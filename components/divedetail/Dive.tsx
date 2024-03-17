
import { Image, View, ScrollView, Text, Dimensions, NativeModules, FlatList, Platform, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import React, { useContext } from 'react';
import '../../translation'
import { useTranslation } from 'react-i18next';
import { makeDateObj, rendertemp, renderdepth, makeendtime, secondstotime, renderweights, secondstotimeHMS } from '../functions.ts'
import DiveProfile from './DiveProfile'
import { TankView } from './TankView'
import { Tank } from '../../models'
import { useState } from 'react';
import { DivelogsContext } from '../../App'; 

const DiveDetail = ({navigation, dive}:any) => {

  // console.log(dive);

  const width = Dimensions.get('window').width
  const [context] = useContext(DivelogsContext);
  //const [ divepagestyles, setDivepagestyles ] = useState<any>(getDivePageStyles(width))
  const theme = useColorScheme();

  const divepagestyles = StyleSheet.create({ 
    child: { width: width, justifyContent: 'center', padding: 5 },
    profileblock: {
      width:350,
      height:200,
      marginLeft:5,
      marginTop:20,
      marginBottom: 20,
    },
    profileitem: {
      position: 'absolute'
    },
    profileback: {
      width:350,
      height:200
    },
    bg: {
      backgroundColor: (theme == 'light' ? '#FFFFFF' : '#090909'),
      color: (theme == 'light' ? '#000000' : '#FFFFFF'),
    },
    locationbox: {
      width: width-190
    },
    numberdatebox: {
      borderRadius: 5,
      backgroundColor: (theme == "light" ? '#eaf3f7' : '#444'),
      position: 'absolute',
      right: 10,
      top: 10,
      height: 60,
      width: 170,
      justifyContent: 'center',
      textAlign: 'center',
      paddingRight: 50
    },
  
    entry: {
      marginTop: 5,
      marginBottom: 5,
      paddingLeft: 5,
      flexDirection: 'row',
      color: (theme == 'light' ? '#000000' : '#FFFFFF'),
      flex: 1,
    },
    twocolumn: {
      flexDirection: 'row',
      color: (theme == 'light' ? '#000000' : '#FFFFFF'),
      flex: 1
    },  
    halfentry: {
      marginTop: 5,
      marginBottom: 5,
      paddingLeft: 5,
      flexDirection: 'row',
      color: (theme == 'light' ? '#000000' : '#FFFFFF'),
      width: width*.49
    },
    desc: {
      color: '#39ade2',     
    },
    text: {
      flexWrap: 'wrap',
      flexShrink: 1,
      color: (theme == 'light' ? '#000000' : '#FFFFFF')
    },
    fullwidthentry: {
      marginTop: 10,
      paddingLeft: 5,
      paddingRight: 10,
      width: width-10
    },
    datetext1: {
      textAlign: 'center',
      color: '#39ade2'
    },
    datetext2: {
      textAlign: 'center',
      color: (theme == 'light' ? '#000000' : '#FFFFFF')
    },
    datetext3: {
      textAlign: 'center',
      color: '#39ade2',
      fontSize: 17,
      fontWeight: '500'
    },
    numberbox : {
      borderRadius: 4,
      backgroundColor: '#39ade2',
      position: 'absolute',
      right: 3,
      top: 3,
      height: 54,
      width: 50,
      justifyContent: 'center',
      textAlign: 'center'
    },
    white: {
      width: 50,
      color: '#FFFFFF',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 18
    }
  });

  const imperial = context.userProfile?.imperial || false

  const { t } = useTranslation(); 
  const locale =
    (Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
      : NativeModules.I18nManager.localeIdentifier).replace("_","-");

  let tanks = (dive.tanks != null ? JSON.parse(dive.tanks) : []);

  let sac = (dive.tanks != null ? calculate_sac(tanks, imperial, dive.duration, dive.meandepth) : false);

  const focusDiveProfile = () => {
    navigation.push("DiveProfilFocus", {dive: dive});
  }

  return (<ScrollView style={divepagestyles.bg}>
      <View style={[divepagestyles.bg, divepagestyles.child]}>                
        <View style={divepagestyles.numberdatebox}>
          <View style={divepagestyles.numberbox}>
            <Text style={divepagestyles.white}>{dive.divenumber}</Text>
          </View>
          <Text style={divepagestyles.datetext1}>{makeDateObj(dive.divedate).toLocaleString(locale, {weekday: 'long'})}</Text>
          <Text style={divepagestyles.datetext2}>{makeDateObj(dive.divedate).toLocaleString(locale, {day: 'numeric', month: 'long'})}</Text>
          <Text style={divepagestyles.datetext3}>{makeDateObj(dive.divedate).toLocaleString(locale, {year: 'numeric'})}</Text>
        </View>
        <View style={divepagestyles.locationbox}>
          <View style={divepagestyles.entry}>
            <Text style={divepagestyles.desc}>{t("location")}: </Text>
            <Text style={divepagestyles.text}>{dive.location}</Text>
          </View>
          <View style={divepagestyles.entry}>
              <Text style={divepagestyles.desc}>{t("divesite")}: </Text>
              <Text style={divepagestyles.text}>{dive.divesite}</Text>
          </View>
          <View style={divepagestyles.entry}>
            <Text style={divepagestyles.desc}>{t("buddy")}: </Text>
            <Text style={divepagestyles.text}>{dive.buddy.replaceAll(",", ", ")}</Text>
          </View>
          <View style={divepagestyles.twocolumn}>
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("boat")}: </Text>
              <Text style={divepagestyles.text}>{dive.boat}</Text>
            </View>
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("weather")}: </Text>
              <Text style={divepagestyles.text}>{dive.weather}</Text>
            </View>
          </View>
          <View style={divepagestyles.twocolumn}>            
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("vizibility")}: </Text>
              <Text style={divepagestyles.text}>{dive.vizibility}</Text>
            </View>
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("weights")}: </Text>
              <Text style={divepagestyles.text}>{renderweights(dive.weights, imperial)}</Text>
            </View>
          </View>
          <View style={divepagestyles.twocolumn}>            
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("si")}: </Text>
              <Text style={divepagestyles.text}>{secondstotimeHMS(dive.surfaceinterval)}</Text>
            </View>
            <View style={divepagestyles.halfentry}>
              <Text style={divepagestyles.desc}>{t("sac")}: </Text>
              <Text style={divepagestyles.text}>{sac}</Text>
            </View>
          </View>
        </View>
        <View style={divepagestyles.profileblock} >
          <Image style={divepagestyles.profileback} source={require('../../assets/profile.png')} />
          <Text style={[{position: 'absolute', top:6, left:18}, divepagestyles.text]}>{dive.divetime.substr(0,5)}</Text>
          <Text style={[{position: 'absolute', top:6, left:299}, divepagestyles.text]}>{makeendtime(dive.divetime, dive.duration)}</Text>
          <Text style={[{position: 'absolute', top:80, left:18}, divepagestyles.text]}>{renderdepth(dive.maxdepth, imperial)} </Text>
          <Text style={[{position: 'absolute', top:104, left:18}, divepagestyles.text]}>{renderdepth(dive.meandepth, imperial)}</Text>
          <Text style={[{position: 'absolute', top:6, left:140}, divepagestyles.text]}>{rendertemp(dive.airtemp, imperial)}</Text>
          <Text style={[{position: 'absolute', top:51, left:140}]}>{rendertemp(dive.surfacetemp, imperial)}</Text>
          <Text style={[{position: 'absolute', top:150, left:140}]}>{rendertemp(dive.depthtemp, imperial)}</Text>
          <Text style={[{position: 'absolute', top:176, left:115}, divepagestyles.text]}>{secondstotime(dive.duration)}</Text>

        </View>
        <View>
        <FlatList
            data={tanks} 
            renderItem={({item}) => (
              <TankView Tank={item} imperial={imperial}/>
            )}
          />
        <View style={divepagestyles.fullwidthentry}><Text style={divepagestyles.desc}>{t("notes")}: </Text><Text style={divepagestyles.text}>{dive.notes}</Text></View>    
        </View>
        
        <TouchableOpacity onPress={() => focusDiveProfile()}>
          <DiveProfile SampleData={{sampledata: dive.sampledata, samplerate: dive.samplerate, duration: dive.duration, height: width*0.7, width: width*0.98, lines: true, forlist: false }} imperial={imperial} formodal={false}/>
        </TouchableOpacity>
      </View>
    </ScrollView>)
  }

export default DiveDetail

function calculate_sac (tanks:Tank[], imp:boolean, duration:number, meandepth:number) {
  let literused = 0;
  for (let tank of tanks) {
    literused += (tank.start_pressure - tank.end_pressure)*tank.vol;
    if (tank.dbltank) literused += (tank.start_pressure - tank.end_pressure)*tank.vol;
  } 
  // if no liters can be calculated or no meandepth, there is not enough data
  if (literused == 0) return false;
  if (meandepth == 0) return false;
  let sac = (literused / ((meandepth / 10) + 1) / (duration/60));
  let ret;
  if (imp) ret = Math.round(sac/28.3168*100)/100 + ' cuft/min';
  else ret = Math.round(sac*10)/10 + ' l/min';
  return ret;
} 
