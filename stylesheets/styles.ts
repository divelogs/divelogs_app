
import { StyleSheet , Dimensions} from 'react-native';

const windowdim = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topcentered: {
    justifyContent: 'center',
    alignItems: 'center',
    width: windowdim.width-30,
    position: 'absolute',
    borderWidth:1,
    borderColor: '#000000',
    flexDirection: 'row'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logininputs: {
    width:200,
    height:30,
    fontSize:16,
    borderRadius: 5,
    borderWidth:1,
    borderColor: '#000000',
    marginBottom:5
  }, 
  button: {
    borderRadius: 5,
    backgroundColor: '#3fb9f2',
    padding: 10,
    elevation: 2,
  },  
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  tinyLogo: {
    width:150,
    height:34
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  appTitleView: {
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#3fb9f2'
  },
  noListContent: {
    justifyContent: 'center', 
    alignItems: 'center',
  },
  noListContentText: {
    fontSize: 18,
    marginTop: 50,
    color: '#777'
  },
  viewHeader: {
    fontSize: 25,    
    fontWeight: '700',
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 15,
    color: '#3eb8f1'
  },
});

export default styles
