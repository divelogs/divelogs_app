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
};

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


