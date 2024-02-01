import React, {useRef, useEffect} from 'react';
import {Animated, StyleSheet} from 'react-native';

const App = ({style, pingSize, active}:any) => {
   const sizeAnimation = useRef(new Animated.Value(0)).current;
   const opacityAnimation = useRef(new Animated.Value(0)).current;

const cycleAnimation = () : any => {
    return Animated.loop(
        Animated.sequence([
            Animated.parallel([
                Animated.timing(sizeAnimation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 0.25,
                    duration: 700,
                    useNativeDriver: true
                })            
            ]),

            Animated.parallel([
                Animated.timing(sizeAnimation, {
                    toValue: 0,
                    duration: 400,
                    delay: 240,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true
                })            
            ]),
        ])
    )
  }

   useEffect(() => {
    if (active)
        cycleAnimation().start()
    else{
        cycleAnimation().stop()
        cycleAnimation().reset()
    }
    return () => { cycleAnimation().stop(); cycleAnimation().reset() }
   }, [active])

   return (
       <Animated.View
          style = {[loaderStyle.Load, style, {         
            width: pingSize,
            height: pingSize,   
            transform: [
                         {
                           scale: sizeAnimation.interpolate({
                                     inputRange: [0, 1],
                                     outputRange: [1, 1.4],
                                  })
                         }
                       ],
              opacity: opacityAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
          })
        }]}
       />
   );
}

const loaderStyle = StyleSheet.create({
    Load: {
        position: 'absolute',
        backgroundColor: 'white',
        width: 70,
        height: 70,
        borderRadius: 1000
    }
})

export default App;
