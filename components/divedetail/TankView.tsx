import React from 'react';
import { StyleSheet,  Text,  View, Dimensions } from 'react-native';
import { Tank } from '../../models';
import { renderpressure, liter2cuft } from '../functions.ts'
import { singletank, doubletank } from '../../assets/svgs.js'
import { SvgXml } from 'react-native-svg';
import '../../translation'
import { useTranslation } from 'react-i18next';

export const TankView: React.FC<{
  Tank: Tank,
  imperial: boolean
}> = ({ Tank: {id,index,tank,tankname,vol,wp,start_pressure,end_pressure,o2,he,dbltank}, imperial } ) => {

  const { t } = useTranslation(); 

  return (
    <View style={styles.tankcontainer}>
        <SvgXml style={styles.tankicon} xml={(dbltank ? doubletank : singletank)} width="50" height="75"/>
        <View style={styles.texts}>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('tank')}: </Text><Text>{tank}  </Text>
                <Text style={styles.desc}>{t('vol')}: </Text><Text>{(dbltank ? "2x" : "")}{liter2cuft(vol, wp, imperial)}  </Text>
                {wp > 0 && <><Text style={styles.desc}>{t('wp')}: </Text><Text>{renderpressure(wp, imperial)}  </Text></>}
            </View>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('start_pressure')}: </Text><Text>{renderpressure(start_pressure, imperial)}  </Text>
                <Text style={styles.desc}>{t('end_pressure')}: </Text><Text>{renderpressure(end_pressure, imperial)}  </Text>
            </View>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('o2')}: </Text><Text>{(o2 > 0 ? o2+'%' : '-')}  </Text>
                <Text style={styles.desc}>{t('he')}: </Text><Text>{(he > 0 ? he+'%' : '-')}  </Text>
            </View>
        </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  tankcontainer: {
    marginBottom: 15,
    paddingLeft: 5,
    paddingBottom: 5,
    marginLeft: 0,
    marginRight: 0,
    flexDirection: 'row',
  },
  textblock: {
    flexDirection: 'row',
    height: 23
  },
  texts: {
    paddingTop: 7,
    paddingLeft: 10,
    flexDirection: 'column',
    width: width-50
  },
  tankicon: {
    height: 40,
    width: 20
  },
  desc: {
    color: '#39ade2',     
  },
});
