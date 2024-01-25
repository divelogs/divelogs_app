import React from 'react';
import {  Button,  StyleSheet,  Text,  View } from 'react-native';
import { Dive } from '../../models';
import { DiveProfile } from '../divedetail/DiveProfile';
import { renderdepth } from '../functions.ts'

export const DiveListItem: React.FC<{
  Dive: Dive,
  imperial: boolean
}> = ({ Dive: {id, divesite, divedate, divenumber, divetime, maxdepth, location, sampledata, samplerate, duration} , imperial } ) => {
  var dd = new Date(Date.parse(divedate));

  return (
    <View style={styles.divelistcontainer}>
      <View style={styles.divelistnumbercontainer}>
        <DiveProfile SampleData={{sampledata: sampledata, samplerate: samplerate, duration: duration, height: 60, width: 75, lines: false, forlist: true }} imperial={imperial}/> 
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

const styles = StyleSheet.create({
  divelistcontainer: {
    paddingLeft: 5,
    paddingTop: 2,
    paddingBottom: 6,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: '#FFFFFF',
    borderBottomColor : '#c0c0c0',
    borderTopColor : 'transparent',
    borderLeftColor : 'transparent',
    borderRightColor : 'transparent',
    borderWidth: 1,
    flexDirection: 'row',
  },
  divelistnumbercontainer: {
    flex: 0.2
  },
  divelisttextcontainer: {
    paddingLeft: 10,
    flex: 0.63
  },  
  divelistrightcontainer: {
    marginTop:15,
    flex: 0.15
  },
  diveNumber: {
    fontSize: 22,
    position: 'absolute',
    paddingLeft: 5,
    paddingTop: 3
  },
  divedate: {
    fontSize: 14,
    lineHeight:20
  },
  
  divelistLocationContainer: {
    fontSize: 16,
    fontWeight: '400',
  }, 
  divelistDetailContainer: {
    fontSize: 12,
  }
});
