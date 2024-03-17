import React from 'react';
import { Text, StyleSheet, View, useColorScheme } from 'react-native';

const GearLines = ({children, style, label}:any) => {

  const theme = useColorScheme();
  const styles = StyleSheet.create({
    value: {
      flex: 2,
      color: (theme == 'light' ? '#000000' : '#FFFFFF' ),
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

  return <View style={styles.oneliner}>
      <Text style={[styles.desc, style]}>{label}:</Text>
      <Text style={[styles.value, style]}>{children}</Text>  
  </View>  

}



  export default GearLines