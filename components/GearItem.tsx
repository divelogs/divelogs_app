import React from 'react';
import {  Image,  StyleSheet,  Text,  View } from 'react-native';
import { GearItemType } from '../models';
import GearImages from './GearImages'

export const Gear: React.FC<{
  gi: GearItemType;
}> = ({ gi }) => {
  var dd = new Date(gi.purchasedate);
  return (
    <View style={{padding: 10}}>
        <Image source={GearImages[gi.geartype]} style={{width:96, height:96}}/>
        <Text>{gi.name}</Text>
    </View>
  );
};

