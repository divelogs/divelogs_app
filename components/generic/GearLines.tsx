import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';

const GearLines = ({children, style, label}:any) => {

    return <View style={styles.oneliner}>
        <Text style={[styles.desc, style]}>{label}:</Text>
        <Text style={[styles.value, style]}>{children}</Text>  
    </View>  

}

const styles = StyleSheet.create({
    value: {
      flex: 2,
    },
    oneliner: {
      flexDirection: 'row',
    },
    desc: {
      flex: 2,
      maxWidth: 160,
      color: '#39ade2',
      textAlignVertical: "bottom",
    }
  });

  export default GearLines