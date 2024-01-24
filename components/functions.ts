export const makeDateObj = (date:string) => {
  return new Date(date);
}

export const rendertemp = (temp:number, imp:boolean) => {
  if (imp) {
    if (temp != 0) return ( Math.round( (9/5)*temp+32 ) ) + ' °F'; 
    else return ""; 
  } else {
    if (temp==0 || temp==undefined || temp==null) return '';
    else return temp+' °C'
  } 
}

export const renderpressure = (pressure:number, imp:boolean) => {
  if (imp) {
    if (pressure != 0) return ( Math.round( pressure/0.0689 ) ) + ' PSI'; 
    else return ""; 
  } else {
    if (pressure==0 || pressure==undefined || pressure==null) return '';
    else return  Math.round(pressure)+' Bar'
  } 
}

function psi2bar(psi:number)
{
  return Math.round(psi*0.0689);
}

export const liter2cuft = (liter:number, wp:number = 0, imp:boolean) => {
    if (imp) {
      if (wp != 0)
      {
          // wohl PSI...
          if (wp > 301) wp = psi2bar(wp);
          return Math.round(liter/28.3168*wp) + ' cuft';
      }
      return Math.round(liter*7) + ' cuft';
    } else {
      return liter + ' l'
    }
    
}


export const renderdepth = (depth:number, imp:boolean) => {
  if (imp) {
    if (depth != 0) return ( Math.round( depth/0.3048 * 10 ) / 10 ) + ' ft'; 
    else return ""; 
  } else {
    if (depth==0 ||depth==undefined || depth==null) return '';
    else return depth+' m'
  } 
}

export const makeendtime = (timeString:string, seconds:number) => {
  var d = new Date('1970-01-01T' + timeString );
  d.setSeconds(d.getSeconds() + seconds);
  return d.toTimeString().substring(0,5);
}

export const secondstotime = (seconds:number) => {
  var d = new Date('1970-01-01T00:00:00' );
  d.setSeconds(d.getSeconds() + seconds);
  return d.toTimeString().substring(0,8);
}