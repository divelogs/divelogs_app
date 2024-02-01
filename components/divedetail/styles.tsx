import { StyleSheet } from 'react-native';

export const getDivePageStyles = (width:number) : any => StyleSheet.create({
  child: { width: width, justifyContent: 'center', padding: 5 },
  profileblock: {
    width:350,
    height:200,
    marginLeft:5,
    marginTop:20,
    marginBottom: 20,
  },
  profileitem: {
    position: 'absolute'
  },
  profileback: {
    width:350,
    height:200
  },
  bg: {
    backgroundColor: '#FFFFFF'
  },
  locationbox: {
    width: width-190
  },
  numberdatebox: {
    borderRadius: 5,
    backgroundColor: '#eaf3f7',
    position: 'absolute',
    right: 10,
    top: 10,
    height: 60,
    width: 170,
    justifyContent: 'center',
    textAlign: 'center',
    paddingRight: 50
  },

  entry: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 5,
    flexDirection: 'row',
    flex: 1,
  },
  twocolumn: {
    flexDirection: 'row',
    flex: 1
  },  
  halfentry: {
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 5,
    flexDirection: 'row',
    width: width*.49
  },
  desc: {
    color: '#39ade2',     
  },
  text: {
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  fullwidthentry: {
    marginTop: 10,
    paddingLeft: 5,
    paddingRight: 10,
    width: width-10
  },
  datetext1: {
    textAlign: 'center',
    color: '#39ade2'
  },
  datetext2: {
    textAlign: 'center',
    color: '#000000'
  },
  datetext3: {
    textAlign: 'center',
    color: '#39ade2',
    fontSize: 17,
    fontWeight: '500'
  },
  numberbox : {
    borderRadius: 4,
    backgroundColor: '#39ade2',
    position: 'absolute',
    right: 3,
    top: 3,
    height: 54,
    width: 50,
    justifyContent: 'center',
    textAlign: 'center'
  },
  white: {
    width: 50,
    color: '#FFFFFF',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 18
  }
});

