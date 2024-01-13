import React from 'react';
import {  Button,  StyleSheet,  Text,  View } from 'react-native';
import { Dive } from '../models';
import { DiveProfile } from './DiveProfile';

export const DiveListItem: React.FC<{
  Dive: Dive;
}> = ({ Dive: {id, divesite, divedate, divenumber, divetime, maxdepth, location, sampledata, samplerate, duration} }) => {
  var dd = new Date(Date.parse(divedate));
  return (
    <View style={styles.divelistcontainer}>
      <View style={styles.divelistnumbercontainer}>
        <DiveProfile SampleData={{sampledata: sampledata, samplerate: samplerate, duration: duration, height: 60, width: 75, lines: false, forlist: true }} /> 
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
          {maxdepth} m
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
    paddingBottom: 5,
    marginLeft: 0,
    marginRight: 0,
    borderBottomColor : 'black',
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
