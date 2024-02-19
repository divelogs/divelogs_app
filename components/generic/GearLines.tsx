import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

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
      paddingRight: 15
    },
    desc: {
      flex: 2,
      maxWidth: 130,
      color: '#39ade2',
      textAlignVertical: "top",
    }
  });

  export default GearLines