
import { Animated, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import React, { useState, useEffect, useRef } from 'react';
import { diveicon } from '../../assets/svgs.js'
import divelogsStyle from '../../stylesheets/styles'

const DiverAnimation = ({style, loaded}:any) => {

  const sizeAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;

  const [animationDone, setAnimationDone] = useState<boolean>(false)
  const [transform, setTransform] = useState<number>(0)
  
  const diverZooooom = () : any => {

    const delay = 600

    const anim = Animated.sequence([
            Animated.parallel([
                Animated.timing(sizeAnimation, {
                    toValue: 1,
                    duration: 500,
                    delay: delay,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 1,
                    duration: 200,
                    delay: delay + 350,
                    useNativeDriver: true
                  })

            ]),
/*


//            ACTIVATE THIS ANiMATION FOR LOOP!

            Animated.parallel([
                Animated.timing(sizeAnimation, {
                    toValue: 0,
                    duration: 0,
                    delay: 640,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 1,
                    duration: 0,
                    useNativeDriver: true
                })           
            ]),*/
        ])
    return anim
    return Animated.loop(anim)

  }

  const screenFade = () : any => {

    const delay = 300

    const anim = Animated.sequence([
            Animated.parallel([
                Animated.timing(opacityAnimation, {
                    toValue: 1,
                    duration: 250,
                    delay: delay,
                    useNativeDriver: true
                  })
            ]),
/*


//            ACTIVATE THIS ANiMATION FOR LOOP!

            Animated.parallel([
                Animated.timing(sizeAnimation, {
                    toValue: 0,
                    duration: 0,
                    delay: 640,
                    useNativeDriver: true
                }),
                Animated.timing(opacityAnimation, {
                    toValue: 1,
                    duration: 0,
                    useNativeDriver: true
                })           
            ]),*/
        ])
    return anim
    return Animated.loop(anim)
  }

  useEffect(() => {
    const listner = Dimensions.addEventListener('change', ({screen:{width,height}})=>{
      setTransform(Math.round(width/2+30))
    })

    const { width } = Dimensions.get('screen');
    setTransform(Math.round(width/2+30))

    return listner.remove;
  }, []);

  useEffect(() => {
    if (!loaded) return;

    // Done Animate if we go to login
    if (loaded == "Onboarding") setAnimationDone(true)

    const anim = (loaded == "Home") ? diverZooooom : screenFade;
    anim().start(() => { setAnimationDone(true) })

    return () => { }
   }, [loaded])

  if (animationDone) return null

  return (
    <Animated.View style={[divelogsStyle.centeredView, style, {backgroundColor:'#3fb9f2', 
            opacity: opacityAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
            })
    }]}>
      <Animated.View style={{height: 100, transformOrigin: `${(transform)}px center`, width: '100%', marginTop: -30, 
                             transform: [
                                {
                                    scale: sizeAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 30],
                                })
                            }]}}>
        <SvgXml xml={diveicon} height={100}/>
      </Animated.View>
    </Animated.View> 
  );
};

export default DiverAnimation

