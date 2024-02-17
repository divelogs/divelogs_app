
import RNFetchBlob from "rn-fetch-blob";
import { PermissionsAndroid } from 'react-native';
import { UserProfile } from "../models";
import * as Keychain from "react-native-keychain";

export type LoginResult = {
  success: boolean;
  bearerToken: string;
  error: string;
};

export const CheckFilePermissions = async (platform:any) => {
  if(platform === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      if (granted['android.permission.READ_EXTERNAL_STORAGE'] && granted['android.permission.WRITE_EXTERNAL_STORAGE']) {
        // user granted permissions
        return true;
      } else {
        // user didn't grant permission... handle with toastr, popup, something...
        return false;
      }
    } catch (err) {
      // unexpected error
      return false;
    }
  } else {
    // platform is iOS
    return true;
  }
};

const apiUrl = "https://divelogs.de/api/"
const clientString = "Divelogs App v.1.0"

var bearerToken: string | null = null;

const setBearerToken = (bearer:string) => {
  bearerToken = bearer
}

const isApiAvailable = async () : Promise<boolean> => {

  const t = 1000 * 5;
  const timeout:Promise<any> = new Promise((_, reject) => setTimeout(() => reject(new Error(`${apiUrl} did not answer in ${t/1000} seconds` )), t))

	const result = fetch(apiUrl, {
    method: 'OPTIONS',
    headers: {
      'User-Agent': clientString,
    },
  });

  return await Promise.race([result, timeout]).then(a => true).catch(a => {
    return false;
  })
}

const isBearerTokenValid = async (bearer?:string) : Promise<boolean> => {
	const url = getUrl("user");

  const token = (bearer ?? bearerToken)
  if (!token)
    return false

	const p = fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': clientString,
      Authorization: 'Bearer ' + token
    }
  });

  return await p.then(res => res.ok).catch(a => false)
}

const getUrl = (endpoint:string) : string => 
apiUrl + endpoint

const getDataFromApi = async (endpoint:string, method?: string) : Promise<JSON | null> => {
	const url = getUrl(endpoint);
	const result = await fetch(url, {
    method: method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': clientString,
      Authorization: 'Bearer ' + bearerToken
    }
  });

  if (result.status == 200) {
    const json = await result.json();
    return json
  } else {
    throw `${result.url} returns ${result.status}`
  }  	
}

const getGear = async () : Promise<JSON | null> => 
  getDataFromApi("gear")

const getCertifications = async () : Promise<JSON | null> => 
{
	var userdata:any = await getDataFromApi("user")
	if (userdata != null){
		return userdata.certifications
	}
	return null
}

const getUserProfile = async () : Promise<UserProfile | null> => 
{
	var userdata:any = await getDataFromApi("user")
	if (userdata != null)
		return { 
			imperial: userdata.imperial,
      startnumber: userdata.startnumber,
      username: userdata.user,
      profilePictureUrl: userdata.avatar,
      firstname: userdata.firstname,
      lastname: userdata.lastname
    }
  return null
}

const getDives = async() : Promise<JSON | null> =>
  getDataFromApi("dives")

const login = async (username:string, password:string ) : Promise<LoginResult> => {
  var data = new FormData()
  data.append('user', username);
  data.append('pass', password);

  const loginoutcome: LoginResult = { success: false, bearerToken: '', error: ''};

  try{
    const url = getUrl("login")
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'User-Agent': clientString
      },
      body: data
    });

    const json = await response.json();

    if (response.status == 200) {
      loginoutcome.success = true;
      loginoutcome.bearerToken = json.bearer_token
      await Keychain.setGenericPassword('divelogsuser', loginoutcome.bearerToken);
      setBearerToken(json.bearer_token)
    }
    else
      loginoutcome.error = json.error
  }
  finally{
    return loginoutcome
  }
 }

interface ImageDownloadResult {
  [key: string]: string;
} 

const downloadImages = async (images:string[], subfolder:string = '') : Promise<ImageDownloadResult> => {
  const result:ImageDownloadResult = {}

  const downloads = images.map(async image => [image, (await downloadImage(image, subfolder))]);
  (await Promise.all(downloads)).forEach(a => result[a[0]] = a[1])
  return result
}

const downloadImage = (image_URL:string, subfolder:string = '') : Promise<string> => new Promise<string>(async (resolve, reject) => 
  {
    const { config, fs } = RNFetchBlob;

    let newImgUri = image_URL.lastIndexOf('/');
    let imageName = image_URL.substring(newImgUri);

    let pathBuild = [ 'divelogs', subfolder, imageName]
    const imagePath:string = pathBuild.map(a => a.replace(/^\//, ''))
                                      .filter(a => a.length > 0)
                                      .reduce((a,b) => a + "/" + b, "")

    let DocumentDir = RNFetchBlob.fs.dirs.DocumentDir;
    console.log(DocumentDir);

    RNFetchBlob
      .config({ path: DocumentDir + imagePath, fileCache: true })
      .fetch('GET', image_URL)
      .then((res) => {
        console.log(res);
        console.log('The file saved to ', res.path())
        resolve(imagePath);
      })

    // config(options)
    //   .fetch('GET', image_URL)
    //   .then( (res) => {
    //     return res.readFile('base64');
    //   }).then(base64Data => {
    //     if (Platform.OS == 'ios'){
    //       fs.writeFile(fs.dirs.DocumentDir + '/' + imagePath, base64Data, 'base64').then( (res) => {
    //         console.log(imagePath);
    //         resolve(imagePath)
    //       });
    //     }
    //     else {
    //       throw "Other Platforms not implemented"
    //     }
    //   })
    //   .catch((e) => {
    //     reject(`The file ${image_URL} ERROR: ${e.message}`);
    //   }); 
  });

export const Api = 
{
  setBearerToken: setBearerToken,
  getGear: getGear,
  getCertifications: getCertifications,
  getUserProfile: getUserProfile,
  getDives: getDives,
  login: login,
  downloadImages: downloadImages,
  isApiAvailable: isApiAvailable,
  isBearerTokenValid: isBearerTokenValid
}



