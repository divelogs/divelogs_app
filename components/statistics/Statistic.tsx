import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { StatData, StatVal } from '../../models';

export const Statistic: React.FC<{
    StatData: StatData;
}> = ({ StatData: {values, xname, yname, width, height} }) => {
    const windowdim = Dimensions.get('window');
	var StatSVG = makeSVGStat(values, xname, yname, 950, 500);
	return (
		<View style={styles.flex}>
			<SvgXml width={windowdim.width-20} height={(windowdim.width-20)/1.9} xml={StatSVG} />
		</View>
	)  
};

const styles = StyleSheet.create({
	flex: {
		flex: 1
	}
  });

function makeSVGStat(values: StatVal[], xname: string, yname:string, width:number, height:number)
{
	const werte = values;
	const xbez = xname;
	
	// Bilddimensionen in Pixeln
	const pic_height = height;
	const breite = width;

	const padleft = 96;

	var ret = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" style="font-family:Arial, Helvetica, sans-serif; width:100%; height: auto;" viewBox="0 0 ' + width + ' ' + height + '">';

	let loffset = 2;
	
	var buchst = 0;
	for( let b of values )
	{
		buchst = buchst + b.bez.length;
	}

    let vielewerte = false;
    let add = 0
	if (werte.length > 40 || (werte.length > 8 && buchst > 60))
	{
		vielewerte = true;
		add = 16;
	}

	// Wieviele Balken gilt es zu verteilen?
	let balken = werte.length;
	if (balken<8) balken=8;

	//if ($vielewerte) imagefilledrectangle($image,0,470,950,500,$farbe_b); // 15 Pixel höherer blauer Balken unten!
	//else imagefilledrectangle($image,0,481,950,500,$farbe_b);

	const breitebalk = (width-100)/balken;
	//if ($breitebalk <= 10) $breitebalk = 10;
	const textalign = breitebalk/2;

    let meiste = 1;
	// Maximale Anzahl von TG pro balken:
    for (let w of werte) {
        if (w.val > meiste) meiste = w.val;
    }


    let mult;
	// wenn Gewisse Anzahl unterschritten wird, in $mult Schritten Linien einzeichnen
	if (meiste<30) mult=5;
	else if (meiste>70000) mult = 5000;
	else if (meiste>40000) mult = 2500;
	else if (meiste>20000) mult = 2000;
	else if (meiste>10000) mult = 1000;
	else if (meiste>5000) mult = 500;
	else if (meiste>2500) mult = 250;
	else if (meiste>1000) mult = 100;
	else if (meiste>400) mult = 40;
	else if (meiste>200) mult = 20;
	else mult=10;

	let linien = Math.ceil(meiste/mult);
	if (linien == 0) linien = 1;

	//echo $linien.$art;
	let linienabstand = (height-60)/linien;
	let hoehe_pro_tg = (height-60)/(mult*linien);

	// Wieviele Tauchgänge im Array?
	//let insgestg = array_sum(werte);
    //var insgestg = werte.reduce((e, i) => e + i)

	loffset = 40;

	// alle $mult der Azahl eine waagerechte Linie einzeichnen
	for (let w=0;w<=linien;w++)
	{
		let t = ((height-40)-w*linienabstand)-add;		
		let a = w*mult;
		//imageline($image,15,$t,950,$t,$farbe_l);
		//imagettftext($image, 9, 0, 15, $t-2, $farbe_l, $ff, $a);

		ret += '<line x1="'+loffset+'" y1="'+t+'" x2="'+breite+'" y2="'+t+'" style="stroke:#000;stroke-width:.5" />';  
		ret += '<text x="'+loffset+'" y="'+(t-4)+'" fill="#a8a8a8" style="font-size: 18px;">'+a+'</text>';		

	}

	let b=50;
	// für jeden Bereich den Balken einzeichnen
	for(let foo of werte)
	{
        let key = foo.bez;
        let val = foo.val;
		// Balkenhöhe ermitteln 
		let menge_tgs_in_bereich = foo.val;
		let hoehe = Math.ceil(hoehe_pro_tg*menge_tgs_in_bereich);

		let linksobenX = b+5;
		let linksobenY = (height-40)-hoehe-add;  // Hier war noch +1, was zu Balken "auf der untersten linie" bei sehr niedrigen Werten geführt hat. Ist jetzt weg, könnte aber verfälschen
		let rechtsuntenX = b+Math.round(breitebalk)-5;
		if (breitebalk < 15) rechtsuntenX = b+Math.round(breitebalk)-3;
		let rechtsuntenY = (height-42)-add;

		ret += '<rect x="'+(linksobenX + loffset + (breitebalk/10))+'" y="'+linksobenY+'" width="'+(breitebalk*0.8)+'" height="'+hoehe+'"  style="fill:#5dc0ee;" />';

		// x-Achsenbeschriftungen hoch oder quer
		if (vielewerte) ret += '<text fill="#a8a8a8" style="font-size: 18px;" text-anchor="middle" transform="rotate(270, '+(linksobenX + loffset  + breitebalk/2)+', '+(pic_height-30)+')"><tspan x="'+(linksobenX + loffset  + breitebalk/2)+'" y="'+(pic_height-20)+'">'+key+'</tspan></text>'; // Beschriftungen unten hochkant!
		//else imagettftext($image, 9, 0, $b-$textbreite/2+($breitebalk-5)/2-1 ,$pic_height-4 , $farbe_l, $ff, $key);
		else ret += '<text fill="#a8a8a8" style="font-size: 18px;" text-anchor="middle"><tspan x="'+(linksobenX + loffset  + breitebalk/2)+'" y="'+(pic_height-20)+'">'+key+'</tspan></text>';
		b = b+breitebalk;
	}

	//Angabe Achsenbeschriftung
	//imagettftext($image, 9, 0, 2, $pic_height-4, $farbe_l, $ff, $xbez.":");
	//imagettftext($image, 9, 90, 10, 300, $farbe_l, $ff, $text_number_of_dives);
		ret += '<text y="'+(pic_height-20)+'" x="2" fill="#a8a8a8" style="font-size: 18px;">'+xbez+':</text>';

		ret += '<text y="20" x="-'+(height/2)+'" fill="#a8a8a8" style="font-size: 18px;" transform="rotate(270)">'+yname+'</text>';
	ret += '</svg>';
	return ret;
}
