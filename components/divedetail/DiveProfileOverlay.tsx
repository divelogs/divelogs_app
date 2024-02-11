
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {ProfileDimensions} from './DiveProfile'

import { SampleData } from '../../models';


type Calculated = {
    maxDepth:number
  };

type SpotlightSample = {
    x: number,
    y: number,
    sample: number,
    depth: string
}


export const DiveProfileOverlay = ({sampleData, imperial}:any) => {

    const [position, setPosition] = useState<SpotlightSample|null>(null)
    const [samples, setSamples] = useState<number[]>([])
    const [calculated, setCalculated] = useState<Calculated|null>(null)

    const {width, height} = sampleData
    
    useEffect(() => {
        const sampledata = sampleData.sampledata;
        const samples = (sampledata != null && sampledata.length > 5 ? sampledata.split(",") : []).map(parseFloat);
        samples.unshift(0)
        setSamples(samples)

        var calculated:Calculated = { maxDepth: Math.max(...samples)}
        setCalculated(calculated)
        console.log(samples)
    }, [sampleData])

    const calculateSample = (position:any) : SpotlightSample | null  => {

        const padding = ProfileDimensions.padleft + ProfileDimensions.loffset + 1

        if (position.x - padding < 0) return null;
        if (samples?.length < 1) return null;
        if (!calculated) return null; 

        const pick = (position.x - padding) / (width - ProfileDimensions.padleft*2)
        const index = Math.floor(samples.length * pick)

        if (samples.length <= index) return null

        const theSample = samples[index]
        const nextSample = (samples.length-1 > index) ? samples[index +1] : 0
        const percent = (samples.length * pick) % 1

        const actual = theSample + ((nextSample - theSample) * percent)
        console.log(samples.length * pick, theSample, nextSample, actual, percent)

        var mult = (height*0.9)/calculated.maxDepth

        var ycolumn = actual * mult;

        return { x: position.x, y: ycolumn, sample: theSample, depth: (Math.round(actual*100)/100) + " m" }
    }

    const tapped = ({nativeEvent: evt}:any) => {
        
        const pos = {x: evt.locationX, y: evt.locationY}
        const sample = calculateSample(pos)
        setPosition(sample)
    } 

    const svg = SvgOverlay(position, height, width)

    return (<View style={{ flex: 1, position: 'absolute', top: 0, left: 0, height: 500}} onStartShouldSetResponder={() => true} onResponderMove={tapped} onTouchStart={tapped}>

            <SvgXml xml={svg} width={width} height={height} />

    </View>)

}

const SvgOverlay = (sample:SpotlightSample | null, height:number, width:number) : string => {

    let content = "";

    const pointRadius = 4;

    if (sample){
        content = `<g>
            <line x1="${sample.x}" y1="0" x2="${sample.x}" y2="${sample.y-pointRadius}" />
            <circle r="${pointRadius}" cx="${sample.x}" cy="${sample.y}" stroke-width="1" fill="none" />
            <line x1="${sample.x}" y1="${sample.y+pointRadius}" x2="${sample.x}" y2="${height}" />
            <text x="${sample.x + pointRadius + 4}" y="${sample.y+10}" fill="#a8a8a8" style="font-size: 10px;">${sample.depth}</text>

            <line x1="28" x2="${sample.x-10}" y1="${height-20}" y2="${height-20}" marker-end="url(#triangle)" />
        </g>`
    }

    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg
  PUBLIC '-//W3C//DTD SVG 1.1//EN'
  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>
<svg style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;" version="1.1" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:serif="http://www.serif.com/" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ff0000" stroke="#333">


<defs>
<marker
  id="triangle"
  viewBox="0 0 10 10"
  refX="1"
  refY="5"
  markerUnits="strokeWidth"
  markerWidth="10"
  markerHeight="10"
  orient="auto">
  <path d="M 0 0 L 10 5 L 0 10 z" />
</marker>
</defs>


    ${content}
</svg>
    `
}

export default DiveProfileOverlay