
export type LoginResult = {
  success: boolean;
  bearerToken: string;
  error: string;
};

export type UserSettings = {
  imperial: boolean;
  startnumber: number;
};


const apiUrl = "https://divelogs.de/api/"
const clientString = "Divelogs App v.0"

var bearerToken: string | null = null;

const setBearerToken = (bearer:string) => {
  bearerToken = bearer
}

const getUrl = (endpoint:string) : string => 
apiUrl + endpoint

const getDataFromApi = async (endpoint:string, method?: string) : Promise<JSON | null> => {
console.log('Bearertoken in api getter' + bearerToken);
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
    //console.log(url, json)
    return json
  } else {
    console.log(endpoint + ' is ' + result.status);
    return null;
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

const getUserSettings = async () : Promise<UserSettings | null> => 
{
	var userdata:any = await getDataFromApi("user")
	if (userdata != null)
		return { 
			imperial: userdata.imperial,
      startnumber: userdata.startnumber
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
  //console.log(loginoutcome);

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
      setBearerToken(json.bearer_token)
    }
    else
      loginoutcome.error = json.error
  }
  finally{
    return loginoutcome
  }
 }

 export const Api = 
 {
   setBearerToken: setBearerToken,
   getGear: getGear,
   getCertifications: getCertifications,
   getUserSettings: getUserSettings,
   getDives: getDives,
   login: login
 }



