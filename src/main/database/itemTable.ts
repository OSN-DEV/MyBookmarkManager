/** アイテムテーブル操作クラス */

import { devLog } from '../../util/common'
import { TItem } from '../../@types/TItem'
import { insert, modify, query } from './database'

/**
 * テーブル作成SQLの作成
 * @returns SQL
 */
export const getCreateTableSql = (): string => {
  return `
    CREATE TABLE item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        title TEXT,
        sort INTEGER,
        url TEXT,
        explanation TEXT,
        note TEXT
    )
  `
}

/**
 * アイテムを作成
 * @param アイテム情報
 * @returns データ作成後のアイテム情報(idとsortを設定)
 */
export const create = async (item: TItem): Promise<TItem | undefined> => {
  devLog(`itemTable.create: ${JSON.stringify(item)}`)
  try {
    let sql = `
      insert into item(category_id, title, url, explanation, note) values(?,?,?,?,?)
    `
    item.id = await insert(sql, [item.categoryId, item.title, item.url, item.explanation, item.note])
    devLog('###1')
    sql = `
      select max(sort) as max_sort from item
    `
    const rows = (await query(sql)) as { max_sort: number }[]
    devLog('###2')
    item.sort = rows[0].max_sort + 1

    sql = `
      update item set
        sort=?
      where id=?
    `
    modify(sql, [item.sort, item.id])
    devLog('###3')

    return item
  } catch (error) {
    console.error('Error query database:', error)
    return undefined
  }
}

/**
 * アイテムを更新
 * @param アイテム情報
 * @returns データ更新後のアイテム情報
 */
export const update = async (item: TItem): Promise<TItem | undefined> => {
  devLog(`itemTable.update:${JSON.stringify(item)}`)
  try {
    const sql = `
      update item set
        category_id = ?
       ,title = ?
       ,url = ?
       ,explanation = ?
       ,note = ?
      where id = ?
    `
    modify(sql, [item.categoryId, item.title, item.url, item.explanation, item.note, item.id])
    return item
  } catch (error) {
    console.error('Error query database:', error)
    return undefined
  }
}

/**
 * アイテム情報の一覧取得
 * @param categoryId: カテゴリID
 * @returns アイテム情報
 */
export const selectAll = async (categoryId: number): Promise<TItem[]> => {
  devLog(`categoryTable.selectAll`)
  try {
    const sql = `
      SELECT * FROM item
       WHERE category_id = ?
        ORDER BY sort
    `
    return (await query(sql, [categoryId])) as TItem[]
  } catch (error) {
    console.error('Error query database:', error)
    return []
  }
}

