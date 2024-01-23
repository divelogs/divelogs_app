import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SampleData } from '../../models';

export const DiveProfile: React.FC<{
    SampleData: SampleData,
	imperial: boolean
}> = ({ SampleData: {sampledata, samplerate, duration, width, height, lines = true, forlist = false}, imperial }) => {
  var samples = (sampledata != null && sampledata.length > 5 ? sampledata.split(",") : []);
  if (samples.length > 0) {
	var profileSVG = makeSVGprofile(samples, samplerate, duration, lines, imperial);
	return (
		<View style={forlist ? styles.forlist : styles.flex}>
			<SvgXml xml={profileSVG} width={width} height={height} />
		</View>
	)
  } else {
	return (
		<View>
			<Image
				style={styles.tinyprofile}
				source={require('../../assets/profileplaceholder.png')}
			/>
		</View>
	)
  }
};

const styles = StyleSheet.create({
	tinyprofile: {
	  width: 70,
	  height: 40
	},
	forlist: {
		top: -2,
		left: -3,
		position: 'absolute'
	},
	flex: {
		flex: 1
	}
  });

function makeSVGprofile(samples: string | any[], rate: number, duration: number, lines = true, imperial = false)
{
		var width = 700, height = 400, padleft = 25, loffset = 2;

		rate = duration / samples.length;

		// get the hoizontal multiplier
		var horiz_mult = (width-padleft-8)/(samples.length+1);		

		// maximum depth
		var maxdepth = Math.max(...samples);
		var tens = Math.floor(maxdepth/10)+1;

		// vertical multiplier
		var mult = (maxdepth > 0 ? (height*0.9)/maxdepth : 60);	

		// array for polygon points
		var koords = [];
		
		// first coordinates for start of dive
		koords.push(padleft + ",-1");

		// write all coordinates to array
		for (var e=0;e<samples.length;e++)
		{
			// transform samples to coordinates (in Pixels)
			var xcolumn = (e+1)*horiz_mult+padleft+2;
			var ycolumn = Math.floor(samples[e]*mult)+1;
		
			// push both values comma-separated to array
			koords.push(Math.round(xcolumn) + "," + Math.round(ycolumn));
		}

		// end of dive coordinate (Depth 0m)
		koords.push((e+2)*horiz_mult+padleft+2 + ",-1");

		var vert_10minute_lines =(((rate/60)*samples.length) / 10) + 1;		

		var ret = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" style="font-family:Arial, Helvetica, sans-serif; width:100%; height: auto;" viewBox="0 0 ' + width + ' ' + height + '">'
+ '<linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">'
+ '      <stop offset="0%" style="stop-color:#ebf6fb;stop-opacity:1" />'
+ '      <stop offset="100%" style="stop-color:#88cee8;stop-opacity:1" />'
+ '</linearGradient>'
+ '  <polygon points="' + koords.join(" ") + '" style="fill:url(#grad2);stroke:#63c5f3;stroke-width:.5" />';

	if (lines) {
		// horizontal line every 10 meters
		// more lines for imperial
		if (imperial) {
			tens = Math.floor((maxdepth/0.3048)/10)+1;
			mult = mult*0.3048;
		}
		for (var w=0; w< tens+1; w++)
		{
			if (w == 0) var t = w*mult*10;
			else var t = w*mult*10+1;
			var a = w*10;
			if (t < (height*0.9)) ret += '<line x1="' + padleft + '" y1="' + t + '" x2="' + width + '" y2="' + t + '" style="stroke:#a8a8a8;stroke-width:.5" />';  
			if (t < (height*0.9)) {
				ret  += '<text x="' + loffset + '" y="' + t + '" fill="#a8a8a8" style="font-size: 10px;">' + a + ''+(imperial ? 'ft' : 'm')+'</text>';		
			}
		}

		// vertical line every 10 minutes
		for (var s=0; s< vert_10minute_lines; s++)
		{
			var iks = s*(60/rate*10)*horiz_mult+padleft-1;
			var d = s*10;

			ret += '<line x1="' + iks + '" y1="0" x2="' + iks + '" y2="' + height + '" style="stroke:#a8a8a8;stroke-width:.5" />';
			ret += '<text x="' + (iks+2) + '" y="' + (height-2) + '" fill="#a8a8a8" style="font-size: 10px;">' + d + '</text>';
		}
	
		// "min:" bottom left
		ret += '<text x="2" y="' + (height-2) + '" fill="#a8a8a8" style="font-size: 10px;">min:</text>';
	}
	ret += '</svg>';
	return ret;
}

export default DiveProfile
