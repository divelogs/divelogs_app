import React, {useContext} from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { DivelogsContext } from '../../App'; 

const ValueView = ({children, label}:any) => {

  const [context] = useContext(DivelogsContext);

  const styles = StyleSheet.create({
    value: {
      fontSize: 16,
      color: (context.theme=='dark' ? '#FFFFFF' : '#000000')
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

  return <View style={styles.oneliner}>
  <Text style={styles.desc}>{label}:</Text>
  <Text style={styles.value}>{children}</Text>  
  </View>  
}


  export default ValueView