import { SQLiteDatabase } from 'react-native-sqlite-storage';
import {  NativeModules, Platform } from 'react-native';
import { StatVal } from '../models';
import { readResultSet,readResultScalar } from './db-service';
import * as RNLocalize from "react-native-localize";


export const getMonthStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
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

    return readResultSet<StatVal>(results)

  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getHourStats = async (db: SQLiteDatabase): Promise<StatVal[]> => {
  try {
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

    return readResultSet<StatVal>(results)
  } catch (error) {
    console.error(error);
    throw Error('Failed to get MontStats');
  }
};

export const getDiveCount = async (db: SQLiteDatabase): Promise<number> => {
  try {
    const results = await db.executeSql(`SELECT count(1) as val FROM dives`);

    return readResultScalar<number>(results, "val") ?? 0
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Single Column Stats Stats');
  }
};

export const getBragFacts = async (db: SQLiteDatabase): Promise<any> => {
  try {
    const results = await db.executeSql(`SELECT *,
    (SELECT count(1) FROM dives) AS totaldives, 
    (SELECT id FROM dives WHERE duration = subq.maxduration LIMIT 1) AS longestid, 
    (SELECT id FROM dives WHERE maxdepth = subq.maxdepth LIMIT 1) AS deepestid,
    (SELECT min(depthtemp) FROM dives WHERE depthtemp != 0) as coldest,
    (SELECT max(depthtemp) FROM dives WHERE depthtemp != 0) as warmest
    
    FROM 
    (
    SELECT SUM(duration) AS totalduration, round(AVG(duration)) AS avgduration, MAX(duration) AS maxduration, 
    ROUND(AVG(maxdepth),2) AS avgdepth, MAX(maxdepth) AS maxdepth
    FROM dives 
    ) subq`);
    if (results[0].rows.length == 0)
      return {avgdepth: null, avgduration: null, deepestid: null, longestid: null, maxdepth: null, maxduration: null, totalduration: null};
    else {
      let res = results[0].rows.item(0);
      return res;
    }


    

  } catch (error) {
    console.error(error);
    throw Error('Failed to get BragValues');
  }
};

export const getSingleColumnStats = async (db: SQLiteDatabase, column: string, sort: string = 'ASC'): Promise<StatVal[]> => {
  try {
    const results = await db.executeSql(`SELECT count(1) as val , COALESCE(TRIM(`+column+`),'') as bez FROM dives
    GROUP BY COALESCE(TRIM(`+column+`),'')
    ORDER BY COALESCE(TRIM(`+column+`),'') `+sort);
    
    return readResultSet<StatVal>(results)
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Single Column Stats');
  }
};

export const getPrecalcedStats = async (db: SQLiteDatabase, type: string): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    
    /*
    ATTENTION: This query works too, but the line "substr(csv, 0, instr(csv, ',')-1), " works here only. I an SQLite UI locally, the "-1" at the end needs to be removed. Zerobased <=> nonzerobased difference, possibly between engine versions.

    const results = await db.executeSql(`WITH split(word, csv) AS (
      SELECT 
        '', buddy||','  FROM dives   
      UNION ALL SELECT
        substr(csv, 0, instr(csv, ',')-1), 
        substr(csv, instr(csv, ',') + 1) 
      FROM split -- recurse
      WHERE csv != '' -- break recursion once no more csv words exist
    ) SELECT DISTINCT 
    (SELECT count(1) FROM dives WHERE 
    buddy LIKE word || ',%' OR buddy LIKE '%,' || word || ',%' OR buddy LIKE '%,' || word OR buddy = word
    ) as val, word as bez
    FROM split 
    WHERE word!=''
    ORDER BY bez ASC; `)
    */

    const results = await db.executeSql(`SELECT count(1) as val, value as bez FROM statistics
    WHERE type = '`+type+`'
    GROUP BY LOWER(value)
    ORDER BY value ASC`);

    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        data.push(result.rows.item(index));
      }
    });
    
    return data;
    
  } catch (error) {
    console.error(error);
    throw Error('Failed to get Precalced Stats');
  }
};

export const getYearStats = async (db: SQLiteDatabase): Promise<StatVal[]> => getSingleColumnStats(db, `strftime("%Y",divedate)`, 'ASC')

const locale = RNLocalize.getLocales()[0].languageCode;

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

export const getDepthStats = async (db: SQLiteDatabase, imperial:boolean): Promise<StatVal[]> => {
  try {
    let data:StatVal[] = [];
    let results;
    if (imperial) {
      results = await db.executeSql(`SELECT count(1) as val , CAST(maxdepth/0.3048/10 as int)*10 as bez FROM dives
      GROUP BY CAST(maxdepth/0.3048/10 as int)*10
      ORDER BY CAST(maxdepth/0.3048/10 as int)*10 ASC`);
    }
    else {
      results = await db.executeSql(`SELECT count(1) as val , CAST (maxdepth/5 as int )*5 as bez FROM dives
      GROUP BY CAST(maxdepth/5 as int)*5
      ORDER BY CAST(maxdepth/5 as int) ASC`);
    }
    
    results.forEach((result: { rows: { length: number; item: (arg0: number) => StatVal; }; }) => {
      for (let index = 0; index < result.rows.length; index++) {
        result.rows.item(index).bez = result.rows.item(index).bez + '-' + (result.rows.item(index).bez + (imperial ? 10 : 5))
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
    const results = await db.executeSql(`SELECT count(1) as val , CAST((duration/60)/5 as int)*5 as bez FROM dives
    GROUP BY CAST((duration/60)/5 as int)*5
    ORDER BY CAST((duration/60)/5 as int)*5 ASC
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

