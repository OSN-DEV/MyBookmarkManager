/** アイテムテーブル操作クラス */

/**
 * テーブル作成SQLの作成
 * @returns SQL
 */
export const getCreateTableSql = (): string => {
  return `
    CREATE TABLE item (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        name TEXT,
        sort INTEGER,
        url TEXT,
        explanation TEXT
    )
  `
}

