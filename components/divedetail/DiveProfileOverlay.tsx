
import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { SampleData } from '../../models';


export const DiveProfileOverlay = ({sampleData, imperial}:any) => {

    const [position, setPosition] = useState({x: 100, y: 50})

    const {width, height} = sampleData

    const tapped = ({nativeEvent: evt}:any) => {
        
        const pos = {x: evt.locationX, y: evt.locationY}
        setPosition(pos)
    } 

    const svg = SvgOverlay(position, height, width)

    return (<View style={{ flex: 1, position: 'absolute', top: 0, left: 0, height: 500}} onStartShouldSetResponder={() => true} onResponderMove={tapped} onTouchStart={tapped}>

            <SvgXml xml={svg} width={width} height={height} />

    </View>)

}

const SvgOverlay = (position:any, height:number, width:number) => {


    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg
  PUBLIC '-//W3C//DTD SVG 1.1//EN'
  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>
<svg style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;" version="1.1" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ff0000">
	<g>
        <rect x="0" y="0" width="${width}" height="${height}" style="opacity:0.3"/>
        <line x1="${position.x}" y1="0" x2="${position.x}" y2="${height}" stroke="black" />
    </g>
</svg>
    `
}

export default DiveProfileOverlay