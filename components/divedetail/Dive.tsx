

import { Image, View, ScrollView, Text, Dimensions, NativeModules } from 'react-native';
import '../../translation'
import { useTranslation } from 'react-i18next';

import { makeDateObj, rendertemp, renderdepth, makeendtime, secondstotime } from '../functions.ts'
import divepagestyles from './styles'

import DiveProfile from './DiveProfile'

const DiveDetail = ({navigation, dive, imperial}:any) => {

  const { t } = useTranslation(); 
  const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
               NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

  const { width } = Dimensions.get('window');

  return (<ScrollView>
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
            <Text style={divepagestyles.text}>{dive.buddy}</Text>
          </View>
          <View style={divepagestyles.entry}>
            <Text style={divepagestyles.desc}>{t("boat")}: </Text>
            <Text style={divepagestyles.text}>{dive.boat}</Text>
          </View>
        </View>
        <View style={divepagestyles.profileblock} >
          <Image style={divepagestyles.profileback} source={require('../../assets/profile.png')} />
          <Text style={{position: 'absolute', top:6, left:18}}>{dive.divetime.substr(0,5)}</Text>
          <Text style={{position: 'absolute', top:6, left:299}}>{makeendtime(dive.divetime, dive.duration)}</Text>
          <Text style={{position: 'absolute', top:80, left:18}}>{renderdepth(dive.maxdepth, imperial)} </Text>
          <Text style={{position: 'absolute', top:104, left:18}}>{renderdepth(dive.meandepth, imperial)}</Text>
          <Text style={{position: 'absolute', top:6, left:140}}>{rendertemp(dive.airtemp, imperial)}</Text>
          <Text style={{position: 'absolute', top:51, left:140}}>{rendertemp(dive.surfacetemp, imperial)}</Text>
          <Text style={{position: 'absolute', top:150, left:140}}>{rendertemp(dive.depthtemp, imperial)}</Text>
          <Text style={{position: 'absolute', top:176, left:115}}>{secondstotime(dive.duration)}</Text>
        </View>
        <View>
        <View style={divepagestyles.fullwidthentry}><Text style={divepagestyles.desc}>{t("notes")}: </Text><Text>{dive.notes}</Text></View>    
        </View>
        
        <DiveProfile SampleData={{sampledata: dive.sampledata, samplerate: dive.samplerate, duration: dive.duration, height: width*0.7, width: width*0.98, lines: true, forlist: false }} imperial={imperial} /> 
      </View>
    </ScrollView>)
  }

export default DiveDetail
