import { Float } from "react-native/Libraries/Types/CodegenTypes";

export type SampleData = {
  sampledata: string;
  samplerate: number;
  duration: number;
  width: number;
  height: number;
  lines: boolean;
  forlist: boolean;
};

export type Dive = {
  id: number;
  divenumber: number;
  divedate: string;
  divetime: string;
  duration: number;
  surfaceinterval: number;
  maxdepth: number;
  meandepth: number;
  location: string;
  divesite: string;
  weather: string;
  vizibility: string;
  airtemp: number;
  depthtemp: number;
  surfacetemp: number;
  buddy: string;
  boat: string;
  weights: number;
  notes: string;
  samplerate: number;
  sampledata: string;
  created: Date;
  modified: Date;
  tanks: string | JSON;
};

export type UserProfile = {
  imperial: boolean;
  startnumber: number;
  username: string;
  profilePictureUrl: string;
  firstname: string;
  lastname: string;
};

export type APIDive = {
  id: number;
  divenumber: number;
  date: Date;
  time: string;
  duration: number;
  surface_interval: number;
  maxdepth: Float;
  meandepth: Float;
  location: string;
  divesite: string;
  weather: string;
  visibility: string;
  airtemp: Float;
  depthtemp: Float;
  surfacetemp: Float;
  buddy: string;
  boat: string;
  weights: string;
  notes: string;
  gearitems: GearItem[];
  samplerate: number;
  sampledata: string[];
  tanks: Tank[];
}

export type Tank = {
  id: number;
  index: number;
  tank: string;
  tankname: string ;
  vol: Float;
  wp: number;
  start_pressure: number;
  end_pressure: number;
  o2: Float;
  he: Float;
  dbltank: boolean;
}

export type Certification = {
  id: number;
  certdate: string;
  name: string;
  org: string;
  scans_string: string;
  scans: string[];
};

export type StatData = {
  values: StatVal[];
  xname: string;
  yname: string;
  width: number;
  height: number
};

export type StatVal = {
  bez: string;
  val: number
};

export type BragFacts = {
  avgdepth: number;
  avgduration: number;
  deepestid: number;
  longestid: number;
  maxdepth: number;
  maxduration: number;
  totalduration: number;
  coldest: number;
  warmest: number;
}

export type GearItem = {
  id: number;
  name: string;
  geartype: string;
  servicemonths: number;
  servicedives: number;
  last_servicedate: Date;
  purchasedate: Date;
  discarddate: Date;
  divecount: number;
  monthsleft: number;
  divesleft: number;
  type: number;
};

