import React from 'react';
import { StyleSheet,  Text,  View, NativeModules } from 'react-native';
import { GearItemType } from '../models';
import GearImages from './GearImages'
import { SvgXml } from 'react-native-svg';

const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

export const Gear: React.FC<{
  gi: GearItemType;
}> = ({ gi }) => {
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
                <Text>Dives: {gi.divecount}</Text>
                {gi.purchasedate != null && <Text>Purchasedate: {pd.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</Text>}
                {gi.discarddate != null && <Text>Discarded: {dd.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</Text>}
                {gi.last_servicedate != null && <Text>Last Servicedate: {ls.toLocaleString(locale, {year: "numeric",month: "2-digit",day: "2-digit"})}</Text>}
                {((gi.servicemonths > 0 || gi.servicedives > 0) && gi.discarddate == null) && <View>{calculateService(gi.monthsleft, gi.divesleft)}</View>}
            </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    gearblock: {height: 106, borderBottomColor: '#c0c0c0', borderBottomWidth: 1},
    texts: {left:120},
    bold: {fontWeight:'500'},
    gearitem: { width:90, height: 90 },
    icon: {position: 'absolute', left: 10},
    overdue: {color: '#FF0000'},
    notoverdue: {color: '#019149'}
});

const calculateService = (monthsleft:number, divesleft:number) => {
    // Both months and date are set
    if (monthsleft != null && divesleft != null) {
        // months negative only
        if (monthsleft < 0 && divesleft >= 0) return (<Text style={styles.overdue}>Service overdue: {monthsleft*-1} Months</Text>);
        // dives negative only
        else if (divesleft < 0 && monthsleft >= 0) return (<Text style={styles.overdue}>Service overdue: {divesleft*-1} Dives</Text>);
        // both negative
        else if (divesleft < 0 && monthsleft < 0) return (<Text style={styles.overdue}>Service overdue: {divesleft*-1} Dives / {monthsleft*-1} Months</Text>);
        // none negative
        else if (divesleft >= 0 && monthsleft >= 0) return (<Text style={styles.notoverdue}>Next Service: {divesleft} Dives / {monthsleft} Months</Text>);
    }
    else if (monthsleft != null && divesleft == null) {
        if (monthsleft < 0) return (<Text style={styles.overdue}>Service overdue: {monthsleft*-1} Months</Text>);
        else if (monthsleft >= 0) return (<Text style={styles.notoverdue}>Next Service: {monthsleft} Months</Text>);
    }
    else if (monthsleft == null && divesleft != null) {
        if (divesleft < 0) return (<Text style={styles.overdue}>Service overdue: {divesleft*-1} Dives</Text>);
        else if (divesleft >= 0) return (<Text style={styles.notoverdue}>Next Service: {divesleft} Dives</Text>);
    }
    else return null;
    
    
}