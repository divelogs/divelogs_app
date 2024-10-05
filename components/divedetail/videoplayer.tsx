import React, { useEffect, useState } from 'react';
import WebView from 'react-native-autoheight-webview';
import { Dimensions } from 'react-native';


export const VideoPlayer = ({videoId, type}: any) => {

  const win = Dimensions.get('window');
  const [orientation, setOrientation] = useState('');

  useEffect(() => {
    Dimensions.addEventListener('change', ({window:{width,height}})=>{
      if (width<height) {
      setOrientation("PORTRAIT")
      } else {
      setOrientation("LANDSCAPE")    
      }
  })
  }, []);

  return (
    (type=="vimeo") ?
    <>    
    <WebView
      allowsFullscreenVideo
      scrollEnabled={false}
      automaticallyAdjustContentInsets
      style={{ width: win.width, height: win.height,  flex: 1 }}
      source={{
        html: `<iframe title="vimeo-player" src="https://player.vimeo.com/video/${videoId}" width="${win.width}" height="${win.height}" frameborder="0" allowfullscreen></iframe>`
      }}
    />
    </>
    :
    <>       
      <WebView
      allowsFullscreenVideo
      scrollEnabled={false}
      automaticallyAdjustContentInsets
      style={{ width: win.width, height: win.height,  flex: 1 }}
      source={{
        html: `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" ></iframe>`
      }}
    />
    </>
  );

}

export default VideoPlayer