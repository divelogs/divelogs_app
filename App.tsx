/**
 * Divelogs App
*/
import React, { useEffect, useState, useLayoutEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Dimensions, Appearance } from 'react-native';
import { updateDB, getProfile, getDBConnection } from './services/db-service';
import './translation'
import Diver from './components/onboarding/diveranimation'
import Index from './components'
import { AppContext, UpdateableAppContext } from './models'

export const DivelogsContext = createContext<UpdateableAppContext>([{ theme: (Appearance.getColorScheme()=='dark' ? 'dark' : 'light'), userProfile: null }]);

const App = () => {

  const [appContext, setAppContext] = useState<UpdateableAppContext>([{ theme: (Appearance.getColorScheme()=='dark' ? 'dark' : 'light'), userProfile: null }])
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

  const updateContextState = (appContext:AppContext) => {
    //console.log("updating application context", appContext)
    setAppContext([appContext, updateContextState])
  }

  useEffect(() => {
    ;(async () => {
      const db = await getDBConnection()
      const profile = await getProfile(db)
      

      const [appCtx] = appContext
      const ctx:AppContext = {...appCtx, theme: (Appearance.getColorScheme()=='dark' ? 'dark' : 'light'), userProfile: profile}
      updateContextState(ctx);
    })()
  }, [])

    const window = Dimensions.get('window');

  // this shows briefly on Android, even if the DB is ok
  // if (dbversion < 1) 
  //   return <View style={{flex: 1, backgroundColor: '#3fb9f2'}}><Text>DBVersion: {dbversion}</Text></View>

  return (<View style={{flex: 1, backgroundColor: '#3fb9f2'}}>
        <DivelogsContext.Provider value={appContext}>
          <NavigationContainer
            onStateChange={(state) => {
              setFirstLoad(state?.routes[0].name)
              }}> 
            <Index/>
          </NavigationContainer>
          <Diver loaded={firstLoad} style={{position: 'absolute', top:0, left:0, width: '100%', height: window.height}}/>
        </DivelogsContext.Provider>
      </View>)
};

export default App; 
