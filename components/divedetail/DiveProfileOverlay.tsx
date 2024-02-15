
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {ProfileDimensions} from './DiveProfile'

import { SampleData, Dive } from '../../models';


type Calculated = {
    maxDepth:number
  };

type SpotlightSample = {
    x: number,
    y: number,
    sample: number,
    depth: string,
    passedMinutes: string,
    time: string,
    speed: string
}


export const DiveProfileOverlay = ({sampleData, dive, imperial}:{sampleData: SampleData, dive: Dive, imperial: boolean}) => {

    const [position, setPosition] = useState<SpotlightSample|null>(null)
    const [samples, setSamples] = useState<number[]>([])
    const [calculated, setCalculated] = useState<Calculated|null>(null)
    const [timePerSample, setTimePerSample] = useState<number>(0)

    const [lpos, setlpos] = useState<any>(null)

    const {width, height} = sampleData

    const { duration } = dive
    
    useEffect(() => {
        const sampledata = sampleData.sampledata;
        const samples = (sampledata != null && sampledata.length > 5 ? sampledata.split(",") : []).map(parseFloat);

        if (samples[0] != 0)
            samples.unshift(0)
        if (samples[samples.length-1] !== 0)
            samples.push(0)

        setSamples(samples)

        setTimePerSample(duration / samples.length)

        var calculated:Calculated = { maxDepth: Math.max(...samples)}
        setCalculated(calculated)
        console.log(samples)
    }, [sampleData, duration])

    useEffect(() => { 

        if (!lpos) return
        const s = calculateSample(lpos)
        setPosition(s)


       }, [])

    const calculateSample = (position:any) : SpotlightSample | null  => {

        const padding = ProfileDimensions.padleft + ProfileDimensions.loffset // 27
        const width = 628
        
        if (position.x - padding < 0) return null;
        if (position.x - padding > width) return null;
        if (samples?.length < 1) return null;
        if (!calculated) return null; 
        
        
        const pick = (position.x - padding) / (width)


        const time = (samples.length-1) * pick
        const percent = (time) % 1
        const index = Math.floor(time)




        if (samples.length <= index) return null

        const prevSample = samples[index - 1] ?? 0
        const theSample = samples[index]
        const nextSample = samples[index +1] ?? 0

        console.log(index , 'of' , samples.length-1, " --> " + theSample, "n:" + nextSample)

        const actual = theSample + ((nextSample - theSample) * percent)
        ///console.log(samples.length * pick, theSample, nextSample, actual, percent)

        var mult = (height*0.9)/calculated.maxDepth

        var ycolumn = Math.ceil(actual * mult) //+ 5;

        const [ passedLabel, timeLabel ] = makeTimeLabel(index, percent)

        const currentSpeed = calculateSpeed([theSample, nextSample])
        let arrow = '↘';
        if (currentSpeed === 0)
            arrow = '→'
        if (currentSpeed > 0)
            arrow = '↗'

        let currentSpeedLabel = `${arrow}${Math.abs(currentSpeed)}m/min`
        
        return { x: position.x, y: ycolumn-1, sample: theSample, depth: `↓${(Math.round(actual*100)/100)}m`, passedMinutes: passedLabel, time: timeLabel, speed: currentSpeedLabel }
    }

    const calculateSpeed = (samples: number[]) : number => {
        const [first, ...rest] = samples
        const diff = rest.reduce((a, b) => a - b, first)

        return Math.round((60 / (timePerSample * samples.length -1)  ) * (diff) * 10) / 10
    }

    const makeTimeLabel = (index: number, percent: number) : [string, string] =>  {
        var passed = (index) * timePerSample + timePerSample * percent
        var seconds = Math.floor(60 * ((passed / 60) % 1))
        var minutes = Math.floor(passed / 60)
        var passedLabel = `${minutes}min ${seconds.toString().padStart(2, '0')}s`

        const result = new Date(dive.divedate + " " + dive.divetime)
        result.setSeconds(seconds + result.getSeconds());

        return [passedLabel, result.toTimeString().substring(0, 8)]
    }

    const tapped = ({nativeEvent: evt}:any) => {
        
        const pos = {x: evt.locationX, y: evt.locationY}
        setlpos(pos)
        const sample = calculateSample(pos)
        setPosition(sample)
    } 

    const stopTapped = ({nativeEvent: evt}:any) => {
        tapped({nativeEvent: evt})
    } 


    const svg = SvgOverlay(position, height, width)

    return (<View style={{ flex: 1, position: 'absolute', top: 0, left: 0, height: 500}} onStartShouldSetResponder={() => true} onResponderMove={tapped} onTouchStart={tapped} onResponderEnd={stopTapped}>

            <SvgXml xml={svg} width={width} height={height} />

    </View>)

}

const textOverlay = (sample:SpotlightSample | null, height:number, width:number) : string => {
    if (!sample) return ""
    const move:boolean = (width - 80) < sample!.x 
    const pointRadius = 8;
    return `<g>
        <line x1="${sample.x}" y1="0" x2="${sample.x}" y2="${sample.y-pointRadius}" />
        <circle r="${pointRadius}" cx="${sample.x}" cy="${sample.y}" stroke-width="1" fill="none" />
        <line x1="${sample.x}" y1="${sample.y+pointRadius}" x2="${sample.x}" y2="${height}" />
        <g transform="${move ? "translate(-80,0)" : ""}">
            <text x="${sample.x + pointRadius + 4}" y="${sample.y-0}" fill="#a8a8a8" style="font-size: 10px;">${sample.depth}</text>
            <text x="${sample.x + pointRadius + 4}" y="${sample.y+10}" fill="#a8a8a8" style="font-size: 10px;">${sample.speed}</text>
        </g>
        <line style="opacity:0.3" x1="${sample.x}" y1="${sample.y-7}" x2="${sample.x}" y2="${sample.y+7}" />
        <!--
        <line style="opacity:0.3" x1="${sample.x-20}" y1="${sample.y}" x2="${sample.x+20}" y2="${sample.y}" />
        -->
        <line x1="0" x2="${sample.x-10}" y1="${height-20}" y2="${height-20}" marker-end="url(#triangle)" />  
        <g transform="${move ? "translate(-80,-15)" : ""}">       
            <text x="${sample.x + pointRadius + 4}" y="${height-20}" fill="#a8a8a8" style="font-size: 10px;">${sample.passedMinutes}</text>
            <text x="${sample.x + pointRadius + 4}" y="${height-10}" fill="#a8a8a8" style="font-size: 10px;">${sample.time}</text>
        </g>
    </g>`
}

const SvgOverlay = (sample:SpotlightSample | null, height:number, width:number) : string => {

    const content = textOverlay(sample, height, width);

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