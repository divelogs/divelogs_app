import React, {useContext} from 'react';
import { StyleSheet,  Text,  View, Dimensions, useColorScheme } from 'react-native';
import { Tank } from '../../models';
import { renderpressure, rendervolume } from '../functions.ts'
import { singletank, doubletank } from '../../assets/svgs.js'
import { SvgXml } from 'react-native-svg';
import '../../translation'
import { useTranslation } from 'react-i18next';
import { DivelogsContext } from '../../App'; 

export const TankView: React.FC<{
  Tank: Tank,
  imperial: boolean
}> = ({ Tank: {id,index,tank,tankname,vol,wp,start_pressure,end_pressure,o2,he,dbltank}, imperial } ) => {

  const { t } = useTranslation(); 
  const [context] = useContext(DivelogsContext);

  const theme = useColorScheme();

  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    text: {
      color: (theme == 'light' ? '#000000' : '#FFFFFF')
    },
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

  return (
    <View style={styles.tankcontainer}>
        <SvgXml style={styles.tankicon} xml={(dbltank ? doubletank : singletank)} width="50" height="75"/>
        <View style={styles.texts}>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('tank')}: </Text><Text style={styles.text}>{tank}  </Text>
                <Text style={styles.desc}>{t('vol')}: </Text><Text style={styles.text}>{(dbltank ? "2x" : "")}{rendervolume(vol, wp, imperial)}  </Text>
                {wp > 0 && <><Text style={styles.desc}>{t('wp')}: </Text><Text style={styles.text}>{renderpressure(wp, imperial)}  </Text></>}
            </View>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('start_pressure')}: </Text><Text style={styles.text}>{renderpressure(start_pressure, imperial)}  </Text>
                <Text style={styles.desc}>{t('end_pressure')}: </Text><Text style={styles.text}>{renderpressure(end_pressure, imperial)}  </Text>
            </View>
            <View style={styles.textblock}>
                <Text style={styles.desc}>{t('o2')}: </Text><Text style={styles.text}>{(o2 > 0 ? o2+'%' : '-')}  </Text>
                <Text style={styles.desc}>{t('he')}: </Text><Text style={styles.text}>{(he > 0 ? he+'%' : '-')}  </Text>
            </View>
        </View>
    </View>
  );
};


