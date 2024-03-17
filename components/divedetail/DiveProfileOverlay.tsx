import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, Pressable, Dimensions, useColorScheme } from 'react-native';
import { SvgXml } from 'react-native-svg';

//import {ProfileDimensions} from './DiveProfile'

import { SampleData, Dive } from '../../models';
//import { Float } from 'react-native/Libraries/Types/CodegenTypes';


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
    speed: string,
    temp: number,
}

type ConcreteSample = {
    index: number,
    depth: number,

    x: number,
    y: number
}

type SpotlightArea = {
    left: ConcreteSample,
    right: ConcreteSample,
    depth: number
    duration: number
    speed: number
}

const dimensions = Dimensions.get('window');

function extractDepth(data:any) {
    if (typeof data == "object") return data.d;
    else return data;
}

export const DiveProfileOverlay = ({sampleData, dive, imperial}:{sampleData: SampleData, dive: Dive, imperial: boolean}) => {

    //console.log('imp:'+imperial);

    const [position, setPosition] = useState<SpotlightSample|null>(null)
    const [area, setArea] = useState<SpotlightArea|null>(null)
    const [samples, setSamples] = useState<number[]>([])
    const [temps, setTemps] = useState<number[]>([])
    const [calculated, setCalculated] = useState<Calculated|null>(null)
    const [timePerSample, setTimePerSample] = useState<number>(0)

    const [lpos, setlpos] = useState<any>(null)

    const {width, height} = sampleData

    const { duration } = dive
    
    useEffect(() => {
        const sampledata = sampleData.sampledata;
        const samplejson = (sampledata != null && sampledata.length > 5 ? JSON.parse("["+sampledata+"]") : []);

        var temps:any = [];
        var samples:any = [];
		var hastemps = false;
		// Data extraction
		for (const [index, val] of samplejson.entries()) {
			if (typeof val=="object") {
				samples.push(val.d);
                temps.push(val.t);
				hastemps = true;
			}
			else {
				var lasttemp = parseFloat(temps.slice(-1));
				temps.push((isNaN(lasttemp) ? Infinity : lasttemp));
                samples.push(val);
			};
		};

        //console.log(samples);

        if (samples[0] != 0) {
            samples.unshift(0)
            temps.unshift(Infinity)
        }            
        if (samples[samples.length-1] !== 0) {
            samples.push(0)
            temps.push(Infinity)
        }

        setSamples(samples)
        setTemps(temps)

        setTimePerSample(duration / samples.length)

        var calculated:Calculated = { maxDepth: Math.max(...samples)}
        setCalculated(calculated)
        //console.log(samples)
    }, [sampleData, duration])

    useEffect(() => { 
        if (!lpos) return
        const s = calculateSample(lpos)
        setPosition(s)
       }, [])

    const getSelectedSample = (position:any) => {
        const padding = 25
        const width = (Math.max(dimensions.width, dimensions.height)) - 25 - 10
        
        if (position.x - padding < 0) return null;
        if (position.x - padding > width) return null;
        if (samples?.length < 1) return null;
                
        const pick = (position.x - padding) / (width)

        const time = (samples.length-1) * pick
        const percent = (time) % 1
        const index = Math.floor(time)

        if (samples.length <= index) return null

        const theSample = samples[index]
        const nextSample = samples[index +1] ?? 0
        const temp = temps[index]

        //console.log(index , 'of' , samples.length-1, " --> " + theSample, "n:" + nextSample)
        return {current: theSample, next: nextSample, index, percent, temp: temp}
    }

    const calculateSample = (position:any) : SpotlightSample | null  => {

        if (!calculated) return null; 

        const sam = getSelectedSample(position)
        if (!sam) return null;

        const {current: theSample, next: nextSample, index, percent, temp: temp } = sam!

        const actual = theSample + ((nextSample - theSample) * percent)

        const mult = (height*0.9)/calculated.maxDepth

        var ycolumn = Math.ceil(actual * mult) //+ 5;

        const [ passedLabel, timeLabel ] = makeTimeLabel(index, percent)

        const currentSpeed = calculateSpeed([theSample, nextSample])
        let arrow = '↘';
        if (currentSpeed === 0)
            arrow = '→'
        if (currentSpeed > 0)
            arrow = '↗'

        let currentSpeedLabel = (imperial ? `${arrow}${Math.abs((Math.round(currentSpeed/0.3048)))}ft/min` : `${arrow}${Math.abs(currentSpeed)}m/min`);

        return { 
                 x: position.x, 
                 y: ycolumn-1, 
                 sample: theSample, 
                 depth: `${(Math.round(actual*100)/100)}`, 
                 passedMinutes: passedLabel, 
                 time: timeLabel, 
                 speed: currentSpeedLabel,
                 temp: temp }
    }

    const travel = (prevSample: number, position:number, direction:[boolean, boolean]) : number => 
    {
        const [down, right] = direction
        const idxAdd = right ? +1 : -1;

        const currIdx = position + idxAdd
        if (currIdx >= samples.length || currIdx < 0)  return position

        const currSample = samples[currIdx]

        //if (right) console.log("cp:" , currSample, prevSample, "right:", direction, `(${currIdx})` )

        const cb = ((currSample - prevSample) >= 0) 
        
        if (cb !== down) return position;
        return travel(currSample, currIdx, direction);
    }

    const calculateAreaOfCurrentSample = (position:any) : SpotlightArea | null  => {

        const sam = getSelectedSample(position)
        if (!sam) return null;
        if (!calculated) return null; 

        const {current: theSample, next: nextSample, index } = sam!

        if (theSample === nextSample) return null

        const changeBy = (nextSample - theSample) > 0 // true === down

        const right = travel(theSample, index, [changeBy, true])
        
        
        const left = travel(theSample, index, [!changeBy, false])
        
        //console.log("l", left, "r", right, samples)

        const mult = (height*0.9)/calculated.maxDepth


        return {
            right: { index: right, depth: samples[right], x: 40, y: Math.ceil(samples[right] * mult)  },
            left: { index: left, depth: samples[left], x: 100, y: Math.ceil(samples[left] * mult) },
            depth: samples[right] - samples[left],
            duration: (right - left) * timePerSample,
            speed: (samples[right] - samples[left]) / ((right - left) * timePerSample)
        }
    }

    const calculateSpeed = (samples: number[]) : number => {
        const [first, ...rest] = samples
        const diff = rest.reduce((a, b) => a - b, first)

        return Math.round((60 / (timePerSample * samples.length -1)  ) * (diff) * 10) / 10
    }

    const makeTimeLabel = (index: number, percent: number) : [string, string] =>  {
        //console.log(percent);
        var passed = (index) * timePerSample + timePerSample * percent
        //console.log('passed');
        //console.log(passed);
        var seconds = Math.floor(passed)
        var minutes = Math.floor(passed / 60)
        var passedLabel = `${minutes}min ${(seconds-minutes*60).toString().padStart(2, '0')}s`

        const result = new Date(dive.divedate + " " + dive.divetime)
        //console.log(result);
        result.setSeconds(seconds + result.getSeconds());
        //console.log(result);

        return [passedLabel, result.toLocaleString('de', {hour: 'numeric', minute: 'numeric', second: 'numeric'})]
    }

    const tapped = ({nativeEvent: evt}:any) => {
        //console.log('tapped');
        const pos = {x: evt.locationX, y: evt.locationY}
        setlpos(pos)
        const sample = calculateSample(pos)
        setPosition(sample)
        //console.log(sample);
        setArea(null)
    } 

    const stopTapped = ({nativeEvent: evt}:any) => {
        //console.log('stoptapped');
        tapped({nativeEvent: evt})

        const pos = {x: evt.locationX, y: evt.locationY}
        // const area = calculateAreaOfCurrentSample(pos)
        // setArea(area)
        // //console.log(area)

        setlpos(pos)
        const sample = calculateSample(pos)
        setPosition(sample)
        //console.log(sample);
        setArea(null)
    } 


    const svg = SvgOverlay(position, area, height, width, imperial)

    return (<View style={{ flex: 1, position: 'absolute', top: 0, left: 0, height: 500}} onStartShouldSetResponder={() => true} onResponderMove={tapped} onTouchStart={tapped} onResponderEnd={stopTapped}>

        <SvgXml xml={svg} width={width} height={height} />      

    </View>)

}

const textOverlay = (sample:SpotlightSample | null, height:number, width:number, imperial:boolean) : string => {
    if (!sample) return ""
    const move:boolean = (width - 80) < sample!.x 
    const pointRadius = 8;
    return `<g>
        <line x1="${sample.x}" y1="0" x2="${sample.x}" y2="${sample.y-pointRadius}" stroke="#666" />
        <circle r="${pointRadius}" cx="${sample.x}" cy="${sample.y}" stroke-width="1" fill="none"  stroke="#666"/>
        <line x1="${sample.x}" y1="${sample.y+pointRadius}" x2="${sample.x}" y2="${height}"  stroke="#666"/>
        <g transform="${move ? "translate(-80,0)" : ""}">
            <text x="${sample.x + pointRadius + 4}" y="${sample.y-5}" stroke="#666" style="font-size: 10px;">↓${(imperial ? Math.round(parseFloat(sample.depth)/0.3048*10)/10 : sample.depth)}${(imperial ? ' ft' : ' m')}</text>
            <text x="${sample.x + pointRadius + 4}" y="${sample.y+5}" stroke="#666" style="font-size: 10px;">${sample.speed}</text>
            <text x="${sample.x + pointRadius + 4}" y="${sample.y+15}" stroke="#666" style="font-size: 10px;">${(isFinite(sample.temp) ? (imperial ? ( Math.round( (9/5)*sample.temp+32 )) + ' °F'  : sample.temp + '°C') : '')} </text>
        </g>
        <line style="opacity:0.3" x1="${sample.x}" y1="${sample.y-7}" x2="${sample.x}" y2="${sample.y+7}" />
        <!--
        <line style="opacity:0.3" x1="${sample.x-20}" y1="${sample.y}" x2="${sample.x+20}" y2="${sample.y}" />
        -->
        <line x1="0" x2="${sample.x-10}" y1="${height-20}" y2="${height-20}" stroke="#666" fill="#666"  marker-end="url(#triangle)" />  
        <g transform="${move ? "translate(-80,-15)" : ""}">       
            <text x="${sample.x + pointRadius + 4}" y="${height-20}" stroke="#666" style="font-size: 10px;">${sample.passedMinutes}</text>
            <text x="${sample.x + pointRadius + 4}" y="${height-10}" stroke="#666" style="font-size: 10px;">${sample.time}</text>
        </g>
    </g>`
}

const areaOverlay = (area:SpotlightArea | null, height:number, width:number) : string => {
    if (!area) return ""

    const move:boolean = false;
    const pointRadius = 8;
    return `<g>
        <line x1="${27}" y1="${area.left.y}" x2="${width}" y2="${area.left.y}"  color="#666" />

        <g transform="${move ? "translate(-80,0)" : ""}">
        <text x="${100}" y="${area.left.y + 12}" stroke="#666" style="font-size: 10px;">${area.left.depth}</text>
        <text x="${100}" y="${area.right.y - 4}" stroke="#666" style="font-size: 10px;">${area.right.depth}</text>
        </g>


        <line x1="${27}" y1="${area.right.y}" x2="${width}" y2="${area.right.y}" />
    </g>`
}

const SvgOverlay = (sample:SpotlightSample | null, samplearea: SpotlightArea | null, height:number, width:number, imperial:boolean) : string => {

    const content = textOverlay(sample, height, width, imperial);

    const area = areaOverlay(samplearea, height, width)

    //console.log(area);

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
  <path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/>
</marker>
</defs>
    ${content}
    ${area}
</svg>
    `
}

export default DiveProfileOverlay