import { View } from 'react-native';
import Load from '../generic/loader'
import { ProfilePictureWithLoader, ProfilePicture } from '../generic/userprofile';

const BlueScreen = ({navigation}:any) => {
  return (
    <View style={{flex: 1, backgroundColor:'#3fb9f2'}}>
        
        <ProfilePictureWithLoader style={{top: 70}}/>

        <ProfilePictureWithLoader imageSize={150} style={{top: 270, left: 10}} showPing={true} />
        
        <Load style={{position: 'absolute', left: 100, top: 200}}></Load>
        <ProfilePicture style={{position: 'absolute', left: 100, top: 200}}/>
    </View> 
  );
};

export default BlueScreen

