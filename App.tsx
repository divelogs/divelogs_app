/**
 * Divelogs App
*/
import React, { useState, useLayoutEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Text,View } from 'react-native';
import { updateDB } from './services/db-service';
import './translation'
import Diver from './components/onboarding/diveranimation'
import Index from './components'

const App = () => {

  const [firstLoad, setFirstLoad] = useState<string|undefined>("")
  const [dbversion, setDbVersion] = useState<number>(0);

  const DBCheck = async () => {
    try {
        const res = await updateDB();
        setDbVersion(res);
    } catch (error) {
      console.error(error);
    }
  };

    // This gets called before the component renders. In case DB Updates are needed
    useLayoutEffect(() => {
      DBCheck();
    }, []);

  if (dbversion < 1) 
    return <View style={{flex: 1, backgroundColor: '#3fb9f2'}}><Text>DBVersion: {dbversion}</Text></View>

  return (<View style={{flex: 1, backgroundColor: '#3fb9f2'}}>
      <NavigationContainer
        onStateChange={(state) => {
          setFirstLoad(state?.routes[0].name)
          }}> 
        <Index/>
      </NavigationContainer>
      <Diver loaded={firstLoad} style={{position: 'absolute', top:0, left:0, width: '100%', height: '100%'}}/>

    </View>)
};

export default App; 
