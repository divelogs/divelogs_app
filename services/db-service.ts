import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { Dive, Certification, GearItem, APIDive, UserProfile, MapMarker } from '../models';
import RNFetchBlob from "rn-fetch-blob";
import { Platform } from 'react-native';
import dbUpgrade from "./db-upgrade.json";
import * as Keychain from "react-native-keychain";

enablePromise(true);

const dbupdates: { [key: string]: any } = dbUpgrade;

export const getDBConnection = async () => {
  if (Platform.OS === 'ios') return openDatabase({ name: 'divelogs.db', createFromLocation : 1 });
  else return openDatabase({ name: 'divelogs.db', createFromLocation : '~www/divelogs.db' });
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
              let result = upgradeFrom(instance, version);
              resolve(result);
            }
            else
              resolve(version)
            
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
    });   
};

export const getImperial = async (): Promise<boolean> => {
  const db = await getDBConnection()
  const result = await db.executeSql("SELECT imperial FROM settings")
  if (result[0].rows.length == 0) 
    return false;
  return result[0].rows.item(0).imperial == "1"
};

export const getSyncForced = async (): Promise<boolean> => {
  const db = await getDBConnection()
  const result = await db.executeSql("SELECT forceSync FROM settings")
  if (result[0].rows.length == 0) 
    return false;
  return result[0].rows.item(0).forceSync == "1"
};

export const resetSyncForced = async (): Promise<void> => {
  const db = await getDBConnection()
  await db.executeSql("UPDATE settings SET forceSync = 0")
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
  
  searchPhrase = searchPhrase.replace(/'/g, "''");
  return " (location LIKE '%"+searchPhrase+"%' OR divesite LIKE '%"+searchPhrase+"%' OR boat LIKE '%"+searchPhrase+"%'  OR notes LIKE '%"+searchPhrase+"%'  OR buddy LIKE '%"+searchPhrase+"%')"
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

export const getCoordinates = async (db: SQLiteDatabase): Promise<[]> => {
  try {
    const coords = <any>[];
    const results = await db.executeSql(`SELECT distinct CAST(CAST(lat*1000 as int) as REAL)/1000 as latitude, 
    CAST(CAST(lng*1000 as int) as REAL)/1000 as longitude, 
    CASE WHEN GROUP_CONCAT(DISTINCT divesite) = '' THEN '?' ELSE GROUP_CONCAT(DISTINCT divesite) END as divesite from dives
    WHERE lat != 0 AND lng != 0 
    GROUP BY ROUND(lat*1000), ROUND(lng*1000)
    order by divesite ASC
    `);
    results.forEach((result: { rows: { length: number; item: (arg0: number) => MapMarker; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        coords.push(result.rows.item(index));
      }
    });
    return coords;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Maps');
  }
};


export const getFilteredDives = async (db: SQLiteDatabase, column: string, filter:string, dir:string, searchPhrase:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];

    const search = (searchPhrase.length > 0 ? " AND " + getWhere(searchPhrase) : "");
    const where = "WHERE "+column.replace(/'/g, "''")+" LIKE '"+filter.replace(/'/g, "''")+"'" + search
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


export const getDivesByLatLng = async (db: SQLiteDatabase, lat: number, lng:number, dir:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];
    const where = "WHERE lat LIKE '"+lat+"%' AND lng LIKE '"+lng+"%'"
    const results = await db.executeSql("SELECT * FROM dives "+where+" ORDER BY divedate " + dir + ", divetime " + dir + ' ');
    results.forEach((result: { rows: { length: number; item: (arg0: number) => Dive; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        Dives.push(result.rows.item(index));
      }
    });
    return Dives;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Dives by location');
  }
};

export const getFilteredDivesByPrecalcedStatistics = async (db: SQLiteDatabase, type: string, filter:string, dir:string, searchPhrase:string): Promise<Dive[]> => {
  try {
    const Dives: Dive[] = [];

    const search = (searchPhrase.length > 0 ? " AND " + getWhere(searchPhrase) : "");
    const where = "WHERE statistics.value LIKE '"+filter.replace(/'/g, "''")+"'" + search

    const results = await db.executeSql(`SELECT dives.* 
    FROM dives INNER JOIN statistics ON dives.id = statistics.diveId AND type = '${type.replace(/'/g, "''")}' ${where} ORDER BY divedate ${dir}, divetime ${dir}`);
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

 
export const getProfile = async (db: SQLiteDatabase): Promise<UserProfile|null> => {
  try {
    const results = await db.executeSql("SELECT * FROM profile");
    if (results[0].rows.length == 0) 
      return null
    return results[0].rows.item(0);
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Bearer Token');
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

  /*
  IMPORTANT: Everytime Dives are persisted into the database, the result should be sent to the saveStatistics() method
  */

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
          id,
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
          sampledata,
          tanks,
          lat,
          lng
      )
      values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

      //const profiledatastring = divedata.sampledata.join(",");

      var gi = <any>[];
      if (divedata.gearitems != undefined && divedata.gearitems.length > 0) {
        divedata.gearitems.forEach((i: { id: number; }) => {
          gi.push(i.id);
        });
      }

      // "cleanup" the buddy string to make it easier to find single entries
      // split string by , and ;
      // trim entries
      // sort array
      var bdy = divedata.buddy.split(/[;,]+/).map(s => s.trim()).sort();

      const values = [
        divedata.id,
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
        (bdy.length > 0 ? bdy.join(",") : ''),
        divedata.boat,
        divedata.weights,
        divedata.notes,
        (gi.length > 0 ? gi.join(",") : null),
        divedata.samplerate,
        (divedata.sampledata != null ? divedata.sampledata.join(",") : ''),
        JSON.stringify(divedata.tanks),
        divedata.lat,
        divedata.lng
      ]
     
      try {
        db.executeSql(insertQuery, values);

        /* tanks are now JSON Object in table dives
        const newdiveid = await writeDataAndReturnId(db, insertQuery, values);
        // write the tanks
        for( let tank of divedata.tanks) {
          let tankquery = "INSERT INTO tanks (dive_id, tank, tankname, vol, wp, start_pressure, end_pressure, o2, he, dbltank) VALUES (?,?,?,?,?,?,?,?,?,?)";
          let tankvals = [newdiveid, tank.tank, tank.tankname, tank.vol, tank.wp, tank.start_pressure, tank.end_pressure, tank.o2, tank.he, tank.dbltank];
          db.executeSql(tankquery, tankvals);
        }
        */
        
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

export const saveStatistics = async (db: SQLiteDatabase, data:Dive[]): Promise<boolean> => 
{
  const deleteQuery2 = `DELETE from statistics`;
  await db.executeSql(deleteQuery2);

  const buddySplit = (b:string) => {
    if (b?.length == 0) return []
    return b?.split(/[;,\/\\\|\n\r]/)
  }

  try {
    // split buddies
    await data.map((dive:Dive) => ({ diveId: dive.id, buddy: buddySplit(dive.buddy), type: 'buddy' }))
        .flatMap(buddies => ( buddies.buddy.map(buddy => ({...buddies, buddy: buddy.trim()})) ))
        .filter(a => a.buddy?.length > 0)
        .forEach(async (element) => {

          const insertQuery = `INSERT into statistics
          ( type, value, diveid )
          values(?,?,?)`;
          const values = [ element.type, element.buddy, element.diveId ]
          db.executeSql(insertQuery, values);
        });
    // grouped buddies
    
    await data.map((dive:Dive) => ({ diveId: dive.id, buddy: buddySplit(dive.buddy), type: 'buddyflock' }))
    .filter(a => a.buddy?.length > 0)
    .map(a => ({...a, buddy: a.buddy.map(a => a.trim()).sort().join(", ") }))
    .forEach(async (element) => {
      const insertQuery = `INSERT into statistics
      ( type, value, diveid )
      values(?,?,?)`;
      const values = [ element.type, element.buddy, element.diveId ]
      db.executeSql(insertQuery, values);
    });
  }
  catch (error) {
    console.error(error);
    throw Error('Failed to create statistics');
  } 

  return true;
}

export const saveCertifications = async (db: SQLiteDatabase, data:JSON[]): Promise<boolean> => {
  const deleteQuery1 = `DELETE from certifications`;
  const deleteQuery2 = `DELETE from certifications_files;`;
  const insertQuery = `INSERT into certifications (name, org, date) values(?,?,?)`;
  const fileInsertQuery = "INSERT INTO certifications_files (certification_id, filename) VALUES (?,?)";
  
  await db.executeSql(deleteQuery1);
  await db.executeSql(deleteQuery2);

  const storeCerts = data.map((cert:any) => {
    const values = [ cert.name, cert.org, cert.date];
    return new Promise<any>((resolve, reject) => { 
      db.transaction(tx => { 
        tx.executeSql(insertQuery, values, (_, results) => resolve({id: results.insertId, scans: cert.scans})) 
      })
    })
  })

  try {
    const storeCertsResult = (await Promise.all(storeCerts))
    const storeFilePromises = (await Promise.all(storeCerts))
      .flatMap(({id, scans}) => scans.map((scan:any) => ([id, scan])))
      .map(async (filevalues:string[]) => await db.executeSql(fileInsertQuery,filevalues))
    await Promise.all(storeFilePromises)
  }
  catch(a) {
    console.error(a)
    return false;
  }
  return true
};

export const saveProfile = async (db: SQLiteDatabase, data:UserProfile | null): Promise<boolean> => {
  const deleteQuery = `DELETE from profile`; 
  const insertQuery = `INSERT into profile
  (
    username,
    profilePictureUrl,
    firstname,
    lastname
  )
  values(?,?,?,?)`;
    
  const values = [ data?.username, data?.profilePictureUrl, data?.firstname, data?.lastname, ]
  try {
    await db.executeSql(deleteQuery);
    await db.executeSql(insertQuery, values)
  } catch (error) {
    console.error(error)
    throw Error("Could not store Profile")
  }
  return true
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
 
export const getBearerToken = async (db: SQLiteDatabase): Promise<string|null> => {
  // const results = await db.executeSql("SELECT apptoken FROM apptoken");
  // if (results[0].rows.length == 0) 
  //   return null
  // return results[0].rows.item(0)['apptoken'];
  const bt = await Keychain.getGenericPassword();
  if (bt != false) return bt.password;
  else return null;
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
    // const updatequery = "UPDATE apptoken SET apptoken = ?";
    // const values = [apptoken];
    // try {
    //   db.executeSql(updatequery, values);
    //   return true;
    // } catch (error) {
    //   console.error(error)
    //   throw Error("Failed to add dive")
    // }
    await Keychain.setGenericPassword('divelogsuser', apptoken);
    return true;

  } catch (error) {
    console.error(error);
    throw Error('Failed to get Bearer Token');
  }
};