/** カテゴリテーブル操作クラス */

import { devLog } from '../../util/common'
import { TCategory } from '../../@types/TCategory'
import { beginTrans, commitTrans, insert, modify, query, rollbackTrans } from './database'

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
export const create = async (category: TCategory): Promise<TCategory | undefined> => {
  devLog(`categoryTable.create: ${JSON.stringify(category)}`)
  try {
    let sql = `
      insert into category(name) values(?)
    `
    category.id = await insert(sql, [category.name])
    sql = `
      select max(sort) as max_sort from category
    `
    const rows = (await query(sql)) as { max_sort: number }[]
    category.sort = rows[0].max_sort + 1

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

/**
 * カテゴリを更新
 * @param カテゴリ情報
 * @returns データ更新後のカテゴリ情報
 */
export const update = async (category: TCategory): Promise<TCategory | undefined> => {
  devLog(`categoryTable.update:${JSON.stringify(category)}`)
  try {
    const sql = `
      update category set name = ?
      where id = ?
    `
    modify(sql, [category.name, category.id])
    return category
  } catch (error) {
    console.error('Error query database:', error)
    return undefined
  }
}

/**
 * カテゴリIDをキーとして削除
 * @param id カテゴリID
 */
export const deleteByCategoryId = async (id: number): Promise<void> => {
  devLog(`deleteByCategoryId`)
  try {
    const sql = `
      delete from category
      where id = ?
    `
    modify(sql, [id])
  } catch (error) {
    console.error('Error query database:', error)
    return undefined
  }
}

/**
 * カテゴリ情報の一覧取得
 * @returns カテゴリ情報
 */
export const selectAll = async (): Promise<TCategory[]> => {
  devLog(`categoryTable.selectAll`)
  try {
    const sql = `
      SELECT id, name, sort FROM category
        ORDER BY sort
    `
    return (await query(sql)) as TCategory[]
  } catch (error) {
    console.error('Error query database:', error)
    return []
  }
}

/**
 * カテゴリのソートキーを更新
 * @param カテゴリ情報
 * @returns データ更新後のカテゴリ情報
 */
export const updateOrder = async (categoryList: TCategory[]): Promise<TCategory[] | undefined> => {
  devLog(`categoryTable.updateOrder:${JSON.stringify(categoryList)}`)
  try {
    await beginTrans()
    const sql = `
      update category set sort = ?
      where id = ?
    `
    for (let i = 0; i < categoryList.length; i++) {
      categoryList[i].sort = i
      await modify(sql, [i, categoryList[i].id])
    }
    await commitTrans()
    return categoryList
  } catch (error) {
    console.error('Error query database:', error)
    await rollbackTrans()
    return undefined
  }
}
