import * as sqlite3 from 'sqlite3'
import * as category from './categoryTable'
import * as item from './itemTable'
import { devLog } from '../../util/common'

const db = new sqlite3.Database('app.db')
type TSqlParam = number | string

/**
 * データベースの初期化
 */
export const initDatabase = async (): Promise<void> => {
  devLog(`initDatabase`)
  let hasError = true
  try {
    await query<{ id: number }>('select id from category limit 1')
    hasError = false
  } catch (error) {
    console.error('Error query database:', error)
  }
  if (!hasError) {
    return
  }

  try {
    devLog(`create table`)
    await modify(category.getCreateTableSql())
    await modify(item.getCreateTableSql())
  } catch (error) {
    console.error('Error query database:', error)
  }
}

/**
 * データ検索
 * @param sql 実行するSQL
 * @param params パラメータ
 * @returns レコードセット
 */
export const query = async <T>(sql: string, params: TSqlParam[] = []): Promise<T[]> => {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) {
        reject(err)
      } else {
        resolve(rows as T[])
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
export const modify = async (sql: string, params: TSqlParam[] = []): Promise<void> => {
  return new Promise<void>((resolve, rejects) => {
    db.run(sql, params, function (err) {
      if (err) {
        rejects(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * データ作成
 */
export const insert = async (sql: string, params: TSqlParam[] = []): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
  })
}

/**
 * トランザクションを開始
 * @returns なし
 */
export const beginTrans = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.run('BEGIN', function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * コミット
 * @returns なし
 */
export const commitTrans = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.run('BEGIN', function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * ロールバック
 * @returns なし
 */
export const rollbackTrans = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.run('ROLLBACK', function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * データベースのインスタンスを取得
 * @returns データベースのインスタンス
 */
export const getDatabase = (): sqlite3.Database => {
  return db
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
