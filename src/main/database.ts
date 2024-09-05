import * as sqlite3 from 'sqlite3'
import { devLog } from '../util/common'
import { rejects } from 'assert'
// import { ERROR } from 'sqlite3'
const db = new sqlite3.Database('app')

/**
 * データベースの初期化
 */
export const initDatabase = async(): Promise<void> => {
    let hasError = true
    try {
      await query<{ id: number }>('select id from category limit 1');
      hasError = false
    } catch (error) {
      console.error('Error query database:', error);
    }
    if (!hasError) {
      return
    }

    try {
    let sql = `
      CREATE TABLE category (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          sort INTEGER DEFAULT 0
      )
    `
    await modify(sql)

    sql = `
      CREATE TABLE item (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          categoryId INTEGER,
          name TEXT,
          sort INTEGER,
          url TEXT,
          explanation TEXT
      )
    `
    await modify(sql)
    } catch (error) {
      console.error('Error query database:', error);
    }
  }

  /**
   * データ検索
   * @param sql 実行するSQL 
   * @param params パラメータ
   * @returns レコードセット
   */
  const query = async <T>(sql: string, params: any[] = []): Promise<T[]> => {
    return new Promise<T[]>((resolve, reject) => {
      db.run(sql, params, function(err, rows) {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  /**
   * データ更新
   * @param sql 実行するSQL 
   * @param params パラメータ
   * @returns なし
   */
  const modify = async(sql: string, params: any[]=[]): Promise<void> => {
    return new Promise<void>((resolve, rejects) => {
      db.run(sql, params, function(err) {
        if (err) {
          rejects(err)
        } else {
          resolve()
        }
      })
    })
  }

//   const modify = async (sql: string, params: any[] = []): Promise<number> => {
//     return new Promise<number>((resolve, reject) => {
//         db.run(sql, params, function (err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(this.lastID); // 挿入されたレコードの ID を返す
//             }
//         });
//     });
// };
// const insertSql = 'INSERT INTO my_table (name, age) VALUES (?, ?)';
// const insertedId = await modify(insertSql, ['Taro', 30]);
// console.log('Inserted ID:', insertedId);