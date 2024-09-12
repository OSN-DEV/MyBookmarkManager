/** カテゴリテーブル操作クラス */

import { Database } from "sqlite3"
import { TCategory } from "../../@types/TCategory"
import { getDatabase, insert, modify, query } from "./database"
import { warn } from "console"

/**
 * テーブル作成SQLの作成
 * @returns SQL
 */
export const getCreateTableSql = (): string => {
  return `
    CREATE TABLE category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        sort INTEGER DEFAULT 0
    )
  `
}

/**
 * カテゴリを作成
 * @param カテゴリ情報
 * @returns データ作成後のカテゴリ情報(idとsortを設定)
 */
export const create = async(category: TCategory): Promise<TCategory | undefined> => {
  try {
    
    let sql = `
      insert into category(name) values(?)
    `
    category.id = await insert(sql, [category.name])

    sql = `
      select max(sort) as max_sort from category
    `
    const rows = await query(sql) as number[]
    category.sort = rows[0] + 1

    sql = `
      update category set
        sort=?
      where id=?
    `
    modify(sql, [category.sort, category.id])
    return category
  } catch (error) {
    console.error('Error query database:', error)
    return undefined
  }
}
