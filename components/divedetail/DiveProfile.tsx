import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SampleData } from '../../models';

export const DiveProfile: React.FC<{
  SampleData: SampleData,
	imperial: boolean,
	formodal: boolean
}> = ({ SampleData: {sampledata, duration, width, height, lines = true, forlist = false}, imperial, formodal }) => {
  
	if (sampledata?.length > 5) {
		var samples = JSON.parse("["+sampledata+"]");

		var profileSVG = makeSVGprofile(samples, duration, lines, imperial, formodal);
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
		flex: 1,
		//marginTop: 5
	}
  });

export const ProfileDimensions = {
	width:700,
	height:400,
	padleft:25,
	loffset:2,	
}

function makeSVGprofile(samples: any[], duration: number, lines = true, imperial = false, formodal = false)
{
		const {width, height, padleft, loffset} = (formodal ? {	
			width: Math.max(Dimensions.get('window').width, Dimensions.get('window').height),
			height: Math.min(Dimensions.get('window').width, Dimensions.get('window').height),
			padleft:25,
			loffset:2,} : ProfileDimensions);

		// ensurs zero sample at top and bottom of dive
		if (samples[0] != 0)
			samples.unshift(0)
		if (samples[samples.length-1] !== 0)
			samples.push(0)

		const rate = duration / samples.length;	
		// get the hoizontal multiplier
		var horiz_mult = (width-padleft-8)/(samples.length-1);	

		var tempcolor = '#FF0000';

		// maximum depth
		var depthsonly = samples.map(function(entry){return parseFloat(typeof entry=="object" ? entry.d : entry)});
		var maxdepth = Math.max(...depthsonly);
		var tens = Math.floor(maxdepth/10)+1;

		var alltemps:any = [];
		var hastemps = false;
		// temps
		for (const [index, val] of samples.entries()) {
			if (typeof val=="object") {
				alltemps.push( (imperial ? (Math.round(((9/5)*val.t+32)*10))/10 : val.t ) );
				hastemps = true;
			}
			else {
				var lasttemp = parseFloat(alltemps.slice(-1));
				alltemps.push((isNaN(lasttemp) ? Infinity : lasttemp));
			};
		};

		// console.log(hastemps);
		var maxtemp = Math.ceil(Math.max(...alltemps.filter(Number.isFinite)))
		var mintemp = Math.floor(Math.min(...alltemps.filter(Number.isFinite)))
		var tempdiff = maxtemp - mintemp;
		var lasttemp_y = 0;
		var tempmult = (imperial ? (tempdiff > 10 ? 8 : 12) : 15);
		var padtempsfromtop = (imperial ? 25 : 45);

		// vertical multiplier
		var mult = (maxdepth > 0 ? (height*0.9)/maxdepth : 60);	

		// array for polygon points
		var koords = [];
		var tempkoords = [];

		// write all coordinates to array
		for (var e=0;e<samples.length;e++)
		{
			var lasample = samples[e], 
			ycolumn;			
			// transform samples to coordinates (in Pixels)
			var xcolumn = (e)*horiz_mult+padleft;
			if (typeof lasample == "object") ycolumn = Math.floor(lasample.d*mult);
			else ycolumn = Math.floor(lasample*mult);
			
		
			// push both values comma-separated to array
			koords.push(Math.round(xcolumn) + "," + Math.round(ycolumn));

			if (alltemps[e] != Infinity) {
				var tempxcolumn = (e+1)*horiz_mult+padleft;
				var tempycolumn = Math.floor((Math.round(maxtemp)-Math.round(alltemps[e]))*tempmult)+padtempsfromtop;		
				// Wertepaare in das Array schreiben
				tempkoords.push(Math.round(tempxcolumn) + "," + Math.round(tempycolumn));
				lasttemp_y = Math.round(tempycolumn);
			}
		}

		let linePerMin = duration / 60 / 8
		if (linePerMin > 60)
			linePerMin = 60
		else if (linePerMin > 30)
			linePerMin = 30
		else if (linePerMin > 15)
			linePerMin = 15
		else (linePerMin > 8)
			linePerMin = 10
		
		//else
		//	linePerMin = Math.round(linePerMin / 5 * 10) / 10

		var vert_10minute_lines =(((rate/60)*samples.length) / linePerMin) + 1;		

		var ret = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" style="font-family:Helvetica, sans-serif; width:100%; height: auto;" viewBox="0 0 ' + width + ' ' + height + '">'
+ '<linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">'
+ '      <stop offset="0%" style="stop-color:#ebf6fb;stop-opacity:1" />'
+ '      <stop offset="100%" style="stop-color:#88cee8;stop-opacity:1" />'
+ '</linearGradient>'
+ '  <polygon points="' + koords.join(" ") + '" style="fill:url(#grad2);stroke:#000;stroke-width:.5" />';

	// Temperaturkurve
	if (hastemps && lines) ret += "<polyline points='" + tempkoords.join(" ") + "' fill='none' stroke='"+tempcolor+"70' />";

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
			var iks = s*(60/rate*linePerMin)*horiz_mult+padleft-1;
			var d = s*linePerMin;


			if (iks <= width) {
				ret += '<line x1="' + iks + '" y1="0" x2="' + iks + '" y2="' + height + '" style="stroke:#a8a8a8;stroke-width:.5" />';
				ret += '<text x="' + (iks+2) + '" y="' + (height-2) + '" fill="#a8a8a8" style="font-size: 10px;">' + (d >= 180 ? d / 60 + "h" : d) + '</text>';
			}

		}
	
		// "min:" bottom left
		ret += '<text x="2" y="' + (height-2) + '" fill="#a8a8a8" style="font-size: 10px;">min:</text>';
	}

	// Temperaturlegende
	if (hastemps && lines) {
		const skipper = (tempdiff < 20 ? false : true) ; // skip every second value if there are too many
		for (var l=0; l<=tempdiff; l++) {
			if (skipper && l%2==1) continue;
			ret += '<text x="'+(width-30)+'" y="'+((l*tempmult)-3+padtempsfromtop)+'" fill="'+tempcolor+'70" style="font-size: 10px;">'+(maxtemp-l)+' '+(imperial ? '°F' : '°C')+'</text>';
		}
		// line for min temp
		ret += '<line x1="'+padleft+'" y1="'+(tempdiff*tempmult)+padtempsfromtop+'" x2="'+(width)+'" y2="'+(tempdiff*tempmult)+padtempsfromtop+'" style="stroke:'+tempcolor+'70;stroke-width:.5" />';  
	}

	ret += '</svg>';
	return ret;
}

export default DiveProfile
