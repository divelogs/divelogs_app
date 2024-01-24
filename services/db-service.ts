import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { Dive, Certification, StatVal, GearItem, APIDive } from '../models';
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
            if (version < dbUpgrade.version) {
              //Call upgrade scripts
              console.log('need DB version '+dbUpgrade.version);
              let result = upgradeFrom(instance, version);
              resolve(result);
            }
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
    });   
};

export const getImperial = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    getDBConnection()
      .then((instance) => {
        instance.executeSql("SELECT imperial FROM settings")
          .then((results) => {
            let imperial = results[0].rows.item(0)['imperial'];
            imperial = (imperial == "1" ? true : false);
            resolve(imperial);
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

const getWhere = (searchPhrase:string) : string => {
  if (searchPhrase?.length == 0) return "" 
  
  searchPhrase = searchPhrase.replace("'", "\'");
  return " location LIKE '%"+searchPhrase+"%' OR divesite LIKE '%"+searchPhrase+"%'  OR boat LIKE '%"+searchPhrase+"%'  OR notes LIKE '%"+searchPhrase+"%'  OR buddy LIKE '%"+searchPhrase+"%'"
} 

export const getDives = async (db: SQLiteDatabase, dir:string, searchPhrase:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];

    const where = (searchPhrase.length > 0 ? "WHERE " + getWhere(searchPhrase) : "");
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

export const getFilteredDives = async (db: SQLiteDatabase, column: string, filter:string, dir:string, searchPhrase:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];

    const search = (searchPhrase.length > 0 ? " AND " + getWhere(searchPhrase) : "");
    const where = "WHERE "+column.replace("'", "\'")+"= '"+filter.replace("'", "\'")+"'" + search
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

export const getGearItems = async (db: SQLiteDatabase): Promise<GearItem[]> => {
  try {
    const GearItems: GearItem[] = [];
    const results = await db.executeSql(`SELECT name, servicemonths, servicedives, last_servicedate, type, purchasedate, discarddate, geartype, (
      SELECT count(*) FROM dives WHERE 
      (
        gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id OR gearitems = gi.id
      ) 
    ) as divecount,
    CASE 
      WHEN servicemonths > 0 THEN 
        CASE  
          WHEN last_servicedate IS NOT NULL THEN servicemonths - CAST((julianday('now') - julianday(last_servicedate)) / 30.41 as int)
          ELSE servicemonths - CAST((julianday('now') - julianday(purchasedate)) / 30.41 as int)
        END
      ELSE null
    END as monthsleft,
    CASE 
      WHEN servicedives > 0 THEN 
        CASE  
          WHEN last_servicedate IS NOT NULL THEN servicedives - (SELECT count(*) FROM dives WHERE (
            gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id OR gearitems = gi.id
          ) AND divedate > last_servicedate)
          ELSE servicedives - (SELECT count(*) FROM dives WHERE (
            gearitems LIKE gi.id || ',%' OR gearitems LIKE '%,' || gi.id || ',%' OR gearitems LIKE '%,' || gi.id OR gearitems = gi.id
          ) AND divedate > purchasedate)		
        END
      ELSE null
    END as divesleft
    
    FROM gearitems gi 
    JOIN geartypes ON gi.type = geartypes.id 
    ORDER BY sort
    
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => GearItem; }; }) => {
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
        var cert = result.rows.item(index);
        cert.scans = (cert.scans_string != undefined ? cert.scans_string.split(",") : []);
        Certifications.push(result.rows.item(index));
      }
    });
    return Certifications;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Certifications');
  }
};

export const saveSettings = async (db: SQLiteDatabase, imperial:boolean, startnumber:number): Promise<boolean> => {
  await db.executeSql("UPDATE settings SET imperial='"+(imperial ? "1" : "0")+"', firstdive='"+startnumber+"'");
  return true;
};

const writeDataAndReturnId = (db: SQLiteDatabase, insertQuery:string, values:any[]) => {
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

export const saveDives = async (db: SQLiteDatabase, data:APIDive[]): Promise<boolean> => {
  const deleteQuery = `DELETE from dives`;
  await db.executeSql(deleteQuery);

  const deleteQuery2 = `DELETE from tanks`;
  await db.executeSql(deleteQuery2);
 
  try {
    //Object.keys(data).forEach(function(key) {
    for (const divedata of data) {
      //const divedata = (<any>data)[key];

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
        const newdiveid = await writeDataAndReturnId(db, insertQuery, values);
        // write the tanks
        for( let tank of divedata.tanks) {
          let tankquery = "INSERT INTO tanks (dive_id, tank, tankname, vol, wp, start_pressure, end_pressure, o2, he, dbltank) VALUES (?,?,?,?,?,?,?,?,?,?)";
          let tankvals = [newdiveid, tank.tank, tank.tankname, tank.vol, tank.wp, tank.start_pressure, tank.end_pressure, tank.o2, tank.he, tank.dbltank];
          db.executeSql(tankquery, tankvals);
        }
        
      } catch (error) {
        console.error(error)
        throw Error("Failed to add dive")
      }
    };
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

export const saveGearItems = async (db: SQLiteDatabase, data:JSON | null): Promise<boolean> => {
  const deleteQuery = `DELETE from gearitems`;
  await db.executeSql(deleteQuery);
 
  try {
    if (data != null) {
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
    }
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
      console.log('The file ERROR', e.message);
    }); 
  return imageName.replace("/","");
};

