import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, Dimensions, ScrollView, View } from 'react-native';

const ValueView = ({children, label}:any) => {

    return <View style={styles.oneliner}>
        <Text style={styles.desc}>{label}:</Text>
        <Text style={styles.value}>{children}</Text>  
    </View>  

}

const styles = StyleSheet.create({
    value: {
      fontSize: 16,
    },
    oneliner: {
      flexDirection: 'row',
      height: 30,
    },
    desc: {
      minWidth: 140,
      color: '#39ade2',
      textAlignVertical: "bottom",
      height: 30,
      marginTop: 1,

      textAlign: 'right',
      marginRight: 5
    }
  });

  export default ValueView