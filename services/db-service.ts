import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { Dive, Certification, StatVal, GearItemType } from '../models';
import RNFetchBlob from "rn-fetch-blob";
import {  NativeModules, Platform } from 'react-native';
import dbUpgrade from "./db-upgrade.json";

enablePromise(true);

const dbupdates: { [key: string]: any } = dbUpgrade;

const { config, fs } = RNFetchBlob;
const PictureDir = fs.dirs.DocumentDir;

export const getDBConnection = async () => {
  return openDatabase({ name: 'divelogs.db', createFromLocation : 1 });
};

export const updateDB = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    getDBConnection()
      .then((instance) => {
        instance.executeSql("SELECT version FROM version")
          .then((results) => {
            let version = results[0].rows.item(0)['version']
            console.log('current DB version is ' + version);
            if (version < dbUpgrade.version) {
              //Call upgrade scripts
              console.log('wanting DB version '+dbUpgrade.version);
              let result = upgradeFrom(instance, version);
              resolve(result);
            }
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
    });   
};

export const upgradeFrom = (db: SQLiteDatabase, previousVersion:number) => {
  let statements:string[] = [];
  let version = dbUpgrade.version - (dbUpgrade.version - previousVersion) + 1;
  let length = Object.keys(dbUpgrade.upgrades).length;

  for (let i = 0; i < length; i += 1) {
    const toVersion:string = `to_v${version}`;
    let upgrade = dbupdates.upgrades[toVersion];

    if (upgrade) {
      statements = [...statements, ...upgrade];      
    } else {
      break;
    }

    version++;
  } 

  statements = [
    ...statements,
    ...["UPDATE version SET version = "+dbUpgrade.version],
  ];

  for (let stmt of statements) {
    // Split all contained  queries into separate ones
    let all = stmt.split(";");
    for (let a of all) {
      // if the statmenet length is longer than 10 characters
      if (a.length > 10) writeStatement(db,a);
    }
  }
  return dbUpgrade.version;
};

export const writeStatement = async (db: SQLiteDatabase, query:string,): Promise<boolean> => {
  try {
    const results = await db.executeSql(query);
    return true;
  } catch (error) {
    console.error(error);
    throw Error('Failed to execute statement '+query);
  }
};


export const getDives = async (db: SQLiteDatabase, dir:string, searchPhrase:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];
    searchPhrase = searchPhrase.replace("'", "\'");
    const where = (searchPhrase.length > 0 ? "WHERE location LIKE '%"+searchPhrase+"%' OR divesite LIKE '%"+searchPhrase+"%'  OR boat LIKE '%"+searchPhrase+"%'  OR notes LIKE '%"+searchPhrase+"%'  OR buddy LIKE '%"+searchPhrase+"%'" : "");
    const results = await db.executeSql("SELECT * FROM dives "+where+" ORDER BY divedate " + dir + ", divetime " + dir + ' ');
    results.forEach((result: { rows: { length: number; item: (arg0: number) => Dive; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        Dives.push(result.rows.item(index));
      }
    });
    return Dives;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Dives');
  }
};

export const getGearItems = async (db: SQLiteDatabase): Promise<GearItemType[]> => {
  try {
    const GearItems: GearItemType[] = [];
    const results = await db.executeSql(`SELECT name, servicemonths, servicedives, last_servicedate, type, purchasedate, discarddate, geartype, (
      SELECT count(*) FROM dives WHERE 
      (
        gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id
      ) 
    ) as divecount,
    CASE 
      WHEN servicemonths > 0 THEN 
        CASE  
          WHEN last_servicedate IS NOT NULL THEN servicemonths - FLOOR((julianday('now') - julianday(last_servicedate)) / 30.41)
          ELSE servicemonths - FLOOR((julianday('now') - julianday(purchasedate)) / 30.41)
        END
      ELSE null
    END as months_left,
    CASE 
      WHEN servicedives > 0 THEN 
        CASE  
          WHEN last_servicedate IS NOT NULL THEN servicedives - (SELECT count(*) FROM dives WHERE (
            gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id
          ) AND divedate > last_servicedate)
          ELSE servicedives - (SELECT count(*) FROM dives WHERE (
            gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id
          ) AND divedate > purchasedate)		
        END
      ELSE null
    END as dives_left
    
    FROM gearitems gi 
    JOIN geartypes ON gi.type = geartypes.id 
    ORDER BY sort`);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => GearItemType; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        GearItems.push(result.rows.item(index));
      }
    });
    return GearItems;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get GearItems');
  }
};

export const getCertifications = async (db: SQLiteDatabase): Promise<Certification[]> => {
  try {
    const Certifications: Certification[] = [];
    const results = await db.executeSql("SELECT certifications.id, date as certdate, name, org, GROUP_CONCAT(certifications_files.filename) as scans_string FROM certifications LEFT JOIN certifications_files ON certifications.id = certifications_files.certification_id GROUP BY certifications.id ORDER BY date DESC");
    results.forEach((result: { rows: { length: number; item: (arg0: number) => Certification; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        console.log('adding cert with index ' + index);
        var cert = result.rows.item(index);
        cert.scans = (cert.scans_string != undefined ? cert.scans_string.split(",") : []);
        Certifications.push(result.rows.item(index));
      }
    });
    console.log(Certifications);
    return Certifications;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Certifications');
  }
};


export const saveDives = async (db: SQLiteDatabase, data:JSON): Promise<boolean> => {
  const deleteQuery = `DELETE from dives`;
  await db.executeSql(deleteQuery);
 
  try {
    Object.keys(data).forEach(function(key) {
      const divedata = (<any>data)[key];

      const insertQuery = `INSERT into dives
      (
          divenumber,
          divedate,
          divetime,
          duration,
          surfaceinterval,
          maxdepth,
          meandepth,
          location,
          divesite,
          weather,
          vizibility,
          airtemp,
          depthtemp,
          surfacetemp,
          buddy,
          boat,
          weights,
          notes,
          gearitems,
          samplerate,
          sampledata
      )
      values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      //const profiledatastring = divedata.sampledata.join(",");

      var gi = <any>[];
      if (divedata.gearitems != undefined && divedata.gearitems.length > 0) {
        divedata.gearitems.forEach((i: { id: number; }) => {
          gi.push(i.id);
        });
      }

      const values = [
        divedata.divenumber,
        divedata.date,
        divedata.time,
        divedata.duration,
        divedata.surface_interval,
        divedata.maxdepth,
        divedata.meandepth,
        divedata.location,
        divedata.divesite,
        divedata.weather,
        divedata.visibility,
        divedata.airtemp,
        divedata.depthtemp,
        divedata.surfacetemp,
        divedata.buddy,
        divedata.boat,
        divedata.weights,
        divedata.notes,
        (gi.length > 0 ? gi.join(",") : null),
        divedata.samplerate,
        (divedata.sampledata != null ? divedata.sampledata.join(",") : '')
      ]
     
      try {
        return db.executeSql(insertQuery, values)
      } catch (error) {
        console.error(error)
        throw Error("Failed to add dive")
      }
    });
    return true;

  } catch (error) {
    console.error(error);
    throw Error('Failed to save Dives');
  }
};

export const saveCertifications = async (db: SQLiteDatabase, data:JSON[]): Promise<boolean> => {
  const deleteQuery1 = `DELETE from certifications`;
  await db.executeSql(deleteQuery1);

  const deleteQuery2 = `DELETE from certifications_files`;
  await db.executeSql(deleteQuery2);
 
  try {
    for(let i = 0; i < data.length; i++) {
    //Object.keys(data).forEach(function(key) {
      const certificationsdata = (<any>data)[i];
      const insertQuery = `INSERT into certifications
      (
          name, org, date
      )
      values(?,?,?)`;

      const values = [
        certificationsdata.name,
        certificationsdata.org,
        certificationsdata.date
      ]

      const writeCertification = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    insertQuery,
                    values,
                    (tx, results) => {
                      resolve(results.insertId);
                    }
                );
            });
        });        
      };

      const certid = await writeCertification();
      console.log(certid);

      try {
        Object.keys(certificationsdata.scans).forEach(function(key) {
          const scanURI = (<any>certificationsdata.scans)[key];
          const imageName = downloadImage(scanURI);
          const certfileinsert = "INSERT INTO certifications_files (certification_id, filename) VALUES (?,?)";
          const filevalues = [
            certid,
            imageName
          ];
          db.executeSql(certfileinsert,filevalues);
        });

      } catch (error) {
        console.error(error)
        throw Error("Failed to add Certification")
      }
    };
    return true;

  } catch (error) {
    console.error(error);
    throw Error('Failed to save Certifications');
  }
};

export const saveGearItems = async (db: SQLiteDatabase, data:JSON): Promise<boolean> => {
  const deleteQuery = `DELETE from gearitems`;
  await db.executeSql(deleteQuery);
 
  try {
    Object.keys(data).forEach(function(key) {
      const geardata = (<any>data)[key];

      const insertQuery = `INSERT into gearitems
      (
          id,
          type,
          name,
          standard,
          purchasedate,
          discarddate,
          servicemonths,
          servicedives,
          last_servicedate,
          sort
      )
      values(?,?,?,?,?,?,?,?,?,?)`;

      const values = [
        geardata.id,
        geardata.geartype,
        geardata.name,
        geardata.standard,
        geardata.purchasedate,
        geardata.discarddate,
        geardata.servicemonths,
        geardata.servicedives,
        geardata.last_servicedate,
        geardata.sort
      ]
     
      try {
        return db.executeSql(insertQuery, values)
      } catch (error) {
        console.error(error)
        throw Error("Failed to add gearitem with id "+geardata.id)
      }
    });
    return true;

  } catch (error) {
    console.error(error);
    throw Error('Failed to save Gearitems');
  }
};
 
export const getBearerToken = async (db: SQLiteDatabase): Promise<string> => {
  try {
    const results = await db.executeSql("SELECT apptoken FROM apptoken");
    return results[0].rows.item(0)['apptoken'];
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Bearer Token');
  }
};

export const getDbVersion = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const results = await db.executeSql("SELECT version FROM version");
    return parseInt(results[0].rows.item(0)['version']);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get DB-Version');
  }
};

export const writeBearerToken = async (db: SQLiteDatabase, apptoken: string): Promise<boolean> => {
  try {
    const updatequery = "UPDATE apptoken SET apptoken = ?";
    const values = [apptoken];
    try {
      db.executeSql(updatequery, values);
      return true;
    } catch (error) {
      console.error(error)
      throw Error("Failed to add dive")
    }
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Bearer Token');
  }
};

export const getMonthStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT * FROM
    (
    select '01' as sorter, count(1) as val, 'Jan' as bez FROM dives WHERE  strftime('%m', divedate) = '01' UNION 
    select '02' as sorter, count(1), 'Feb' FROM dives WHERE   strftime('%m', divedate) = '02' UNION 
    select '03' as sorter, count(1), 'Mar' FROM dives WHERE   strftime('%m', divedate) = '03' UNION 
    select '04' as sorter, count(1), 'Apr' FROM dives WHERE   strftime('%m', divedate) = '04' UNION 
    select '05' as sorter, count(1), 'May' FROM dives WHERE   strftime('%m', divedate) = '05' UNION 
    select '06' as sorter, count(1), 'Jun' FROM dives WHERE   strftime('%m', divedate) = '06' UNION 
    select '07' as sorter, count(1), 'Jul' FROM dives WHERE   strftime('%m', divedate) = '07' UNION 
    select '08' as sorter, count(1), 'Aug' FROM dives WHERE   strftime('%m', divedate) = '08' UNION 
    select '09' as sorter, count(1), 'Sep' FROM dives WHERE   strftime('%m', divedate) = '09' UNION 
    select '10' as sorter, count(1), 'Oct' FROM dives WHERE   strftime('%m', divedate) = '10' UNION 
    select '11' as sorter, count(1), 'Nov' FROM dives WHERE   strftime('%m', divedate) = '11' UNION 
    select '12' as sorter, count(1), 'Dec' FROM dives WHERE   strftime('%m', divedate) = '12' 
    ) foo
    ORDER BY sorter ASC`);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        data.push(result.rows.item(index));
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getHourStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT * FROM
    (
    select count(1) as val, '00' as bez FROM dives WHERE  substr(divetime,1,2) = '00' UNION 
    select count(1), '01' FROM dives WHERE  substr(divetime,1,2) = '01' UNION
    select count(1), '02' FROM dives WHERE  substr(divetime,1,2) = '02' UNION
    select count(1), '03' FROM dives WHERE  substr(divetime,1,2) = '03' UNION
    select count(1), '04' FROM dives WHERE  substr(divetime,1,2) = '04' UNION
    select count(1), '05' FROM dives WHERE  substr(divetime,1,2) = '05' UNION
    select count(1), '06' FROM dives WHERE  substr(divetime,1,2) = '06' UNION
    select count(1), '07' FROM dives WHERE  substr(divetime,1,2) = '07' UNION
    select count(1), '08' FROM dives WHERE  substr(divetime,1,2) = '08' UNION
    select count(1), '09' FROM dives WHERE  substr(divetime,1,2) = '09' UNION
    select count(1), '10' FROM dives WHERE  substr(divetime,1,2) = '10' UNION
    select count(1), '11' FROM dives WHERE  substr(divetime,1,2) = '11' UNION
    select count(1), '12' FROM dives WHERE  substr(divetime,1,2) = '12' UNION
    select count(1), '13' FROM dives WHERE  substr(divetime,1,2) = '13' UNION
    select count(1), '14' FROM dives WHERE  substr(divetime,1,2) = '14' UNION
    select count(1), '15' FROM dives WHERE  substr(divetime,1,2) = '15' UNION
    select count(1), '16' FROM dives WHERE  substr(divetime,1,2) = '16' UNION
    select count(1), '17' FROM dives WHERE  substr(divetime,1,2) = '17' UNION
    select count(1), '18' FROM dives WHERE  substr(divetime,1,2) = '18' UNION
    select count(1), '19' FROM dives WHERE  substr(divetime,1,2) = '19' UNION
    select count(1), '20' FROM dives WHERE  substr(divetime,1,2) = '20' UNION
    select count(1), '21' FROM dives WHERE  substr(divetime,1,2) = '21' UNION
    select count(1), '22' FROM dives WHERE  substr(divetime,1,2) = '22' UNION
    select count(1), '23' FROM dives WHERE  substr(divetime,1,2) = '23'
    ) foo
    ORDER BY bez ASC`);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        data.push(result.rows.item(index));
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getYearStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT count(1) as val , strftime("%Y",divedate) as bez FROM dives
    GROUP BY strftime("%Y",divedate)
    ORDER BY strftime("%Y",divedate) ASC
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        data.push(result.rows.item(index));
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

const locale = (NativeModules.SettingsManager.settings.AppleLocale ||
  NativeModules.SettingsManager.settings.AppleLanguages[0]).replace("_","-");

export const getWeekdayStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT * FROM
    (
    select count(1) as val, 1 as bez FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 1 UNION 
    select count(1), 2 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 2 UNION 
    select count(1), 3 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 3 UNION 
    select count(1), 4 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 4 UNION 
    select count(1), 5 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 5 UNION 
    select count(1), 6 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 6 UNION 
    select count(1), 7 FROM dives WHERE CAST(strftime('%w', divedate) as integer) = 0
    ) foo ORDER BY bez ASC
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        const dummyDate = new Date(2001, 0, parseInt(result.rows.item(index).bez))
        result.rows.item(index).bez = dummyDate.toLocaleDateString(locale, { weekday: 'long' });
        data.push(result.rows.item(index));
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getDepthStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT count(1) as val , floor(maxdepth/5)*5 as bez FROM dives
    GROUP BY floor(maxdepth/5)*5
    ORDER BY floor(maxdepth/5)*5 ASC
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        result.rows.item(index).bez = result.rows.item(index).bez + '-' + (result.rows.item(index).bez + 5)
        data.push(result.rows.item(index));
      }
    });
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getDurationStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    const results = await db.executeSql(`SELECT count(1) as val , floor((duration/60)/5)*5 as bez FROM dives
    GROUP BY floor((duration/60)/5)*5
    ORDER BY floor((duration/60)/5)*5 ASC
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        result.rows.item(index).bez = result.rows.item(index).bez + '-' + (result.rows.item(index).bez + 5)
        data.push(result.rows.item(index));
      }
    });
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};



const downloadImage = (image_URL:string) => {
  let newImgUri = image_URL.lastIndexOf('/');
  let imageName = image_URL.substring(newImgUri);
  let imagePath:string;
  // Get config and fs from RNFetchBlob
  // config: To pass the downloading related options
  // fs: Directory path where we want our image to download
  let options = {
    fileCache: true,
    fileName: imageName,
    addAndroidDownloads: {
      // Related to the Android only
      useDownloadManager: true,
      notification: true,
      path:
        PictureDir +
        '/divelogs' + 
        imageName,
      description: 'Image',
    },
  };
  config(options)
    .fetch('GET', image_URL)
    .then( (res) => {
      imagePath = PictureDir + '/divelogs' + imageName;
      return res.readFile('base64');
    }).then(base64Data => {
      if (Platform.OS == 'ios'){
        RNFetchBlob.fs.writeFile(imagePath, base64Data, 'base64') .then( (res) => {
          //console.log(res);
        });
      }
    })
    .catch((e) => {
      console.log('The file  ERROR', e.message);
    }); 
  return imageName.replace("/","");
};

