import React from 'react';
import { Appearance, StyleSheet,  Text,  View, useColorScheme } from 'react-native';
import { Dive } from '../../models';
import { DiveProfile } from '../divedetail/DiveProfile';
import { renderdepth } from '../functions.ts'

export const DiveListItem: React.FC<{
  Dive: Dive,
  imperial: boolean
}> = ({ Dive: {id, divesite, divedate, divenumber, divetime, maxdepth, location, sampledata, samplerate, duration} , imperial } ) => {
  var dd = new Date(Date.parse(divedate));

  const colorScheme = useColorScheme();

  const styles = StyleSheet.create({
    divelistcontainer: { 
      paddingLeft: 5,
      paddingTop: 2,
      paddingBottom: 6,
      marginLeft: 0,
      marginRight: 0,
      backgroundColor: (colorScheme == 'light' ? '#FFFFFF' : '#090909' ),
      color: (colorScheme == 'light' ? '#000000' : '#FFFFFF' ),
      borderBottomColor : '#c0c0c0',
      borderTopColor : 'transparent',
      borderLeftColor : 'transparent',
      borderRightColor : 'transparent',
      borderWidth: 0.5,
      flexDirection: 'row',
    },
    divelistnumbercontainer: {
      flex: 0.22,
      //alignItems: 'center',
    },
    divelisttextcontainer: {
      paddingLeft: 10,
      flex: 0.63
    },  
    divelistrightcontainer: {
      marginTop:18,
      flex: 0.15
    },
    diveNumber: {
      fontSize: 24,
      position: 'absolute',
      paddingLeft: 5,
      paddingTop: 7,
      fontWeight: '900',
      color: '#FFF',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: {width: 0, height: 0},
      textShadowRadius: 3
    },
    divedate: {
      fontSize: 16,
      fontWeight: '500',
      color: (colorScheme == 'light' ? '#000000' : '#FFFFFF' ),
      lineHeight:20
    },
    divelistLocationContainer: {
      fontSize: 14,
      fontWeight: '400',
      color: (colorScheme == 'light' ? '#000000' : '#FFFFFF' ),
      marginLeft: 0
    }, 
    divelistDetailContainer: {
      fontSize: 12,
      color: (colorScheme == 'light' ? '#000000' : '#FFFFFF' ),
      marginTop: 3
    }
  });

  return (
    <View style={styles.divelistcontainer}>
      <View style={styles.divelistnumbercontainer}>
        <DiveProfile SampleData={{sampledata: sampledata, samplerate: samplerate, duration: duration, height: 60, width: 85, lines: false, forlist: true }} imperial={imperial} formodal={false} /> 
        <Text style={styles.diveNumber}>{divenumber}</Text> 
      </View>
      <View style={styles.divelisttextcontainer}>
        <Text style={styles.divedate}>
          {dd.toLocaleDateString(undefined, { 
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })} {divetime.substring(0,5)}
        </Text>
        <Text style={styles.divelistLocationContainer}>
          {location}
        </Text>
        <Text style={styles.divelistLocationContainer}>
          {divesite}
        </Text>
      </View>
      <View style={styles.divelistrightcontainer}>
        <Text style={styles.divelistDetailContainer}>
        {renderdepth(maxdepth, imperial)}
        </Text>
        <Text style={styles.divelistDetailContainer}>
          {Math.round(duration/60)} min
        </Text>
      </View>
    </View>
  );
};


