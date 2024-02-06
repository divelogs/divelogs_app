import React from 'react';
import { StyleSheet,  Text,  View, NativeModules, Dimensions } from 'react-native';
import { GearItem } from '../models';
import GearImages from './GearImages'
import { SvgXml } from 'react-native-svg';
import '../translation'
import { useTranslation } from 'react-i18next';
import OneLiner from './generic/GearLines'

const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");
    
export const Gear: React.FC<{
  gi: GearItem;
}> = ({ gi }) => {
  
  const { t } = useTranslation();

  var pd = new Date(gi.purchasedate);
  var dd = new Date(gi.discarddate);
  var ls = new Date(gi.last_servicedate);


  return (
    <View style={{padding: 10}}>
        <View style={styles.gearblock}>
            <View style={styles.icon}>
                <SvgXml style={styles.gearitem} xml={GearImages[gi.geartype]} width="90" height= "90"/>
            </View>
            <View style={styles.texts}>
                <Text style={styles.bold}>{gi.name}</Text>
                <OneLiner label={t('dives')}>{gi.divecount}</OneLiner>

                {gi.purchasedate != null && <OneLiner label={t('purchasedate')}>{pd.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</OneLiner>}

                {gi.discarddate != null && <OneLiner label={t('discarded')}>{dd.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</OneLiner>}

                {gi.last_servicedate != null && <OneLiner label={t('last_servicedate')}>{ls.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</OneLiner>}

                {((gi.servicemonths > 0 || gi.servicedives > 0) && gi.discarddate == null) && <View>{calculateService(gi.monthsleft, gi.divesleft,t)}</View>}
            </View>
        </View>
    </View>
  );
};
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    gearblock: {minHeight: 106, borderBottomColor: '#c0c0c0', borderBottomWidth: 1},
    texts: {left:110, width: width-110},
    bold: {fontWeight:'500', fontSize: 16, marginBottom: 4},
    gearitem: { width:90, height: 90 },
    icon: {position: 'absolute', left: 10},
    overdue: {color: '#FF0000'},
    notoverdue: {color: '#019149'}
});

const calculateService = (monthsleft:number, divesleft:number, t:any) => {
    // Both months and date are set
    if (monthsleft != null && divesleft != null) {
        
        // months negative only
        if (monthsleft < 0 && divesleft >= 0) return (<OneLiner style={styles.overdue} label={t('service_overdue')}>{monthsleft*-1} {t('months')}</OneLiner>);
        
        // dives negative only
        else if (divesleft < 0 && monthsleft >= 0) return (<OneLiner style={styles.overdue} label={t('service_overdue')}>{divesleft*-1} {t('dives')}</OneLiner>);
        
        // both negative
        else if (divesleft < 0 && monthsleft < 0) return (<OneLiner style={styles.overdue} label={t('service_overdue')}>{divesleft*-1} {t('dives')} / {monthsleft*-1} {t('months')}</OneLiner>);
        
        // none negative
        else if (divesleft >= 0 && monthsleft >= 0) return (<OneLiner style={styles.notoverdue} label={t('next_service')}>{divesleft} {t('dives')} / {monthsleft} {t('months')}</OneLiner>);
    }
    else if (monthsleft != null && divesleft == null) {

        if (monthsleft < 0) return (<OneLiner style={styles.overdue} label={t('service_overdue')}>{monthsleft*-1} {t('months')}</OneLiner>);
       
        else if (monthsleft >= 0) return (<OneLiner style={styles.notoverdue} label={t('next_service')}>{monthsleft} {t('months')}</OneLiner>);
    }
    else if (monthsleft == null && divesleft != null) {
        if (divesleft < 0) return (<OneLiner style={styles.overdue} label={t('service_overdue')}>{divesleft*-1} {t('dives')}</OneLiner>);
        
        else if (divesleft >= 0) return (<OneLiner style={styles.notoverdue} label={t('next_service')}>{divesleft} {t('dives')}</OneLiner>);
    }
    else return null;
    
    
}