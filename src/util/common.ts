/**
 * 開発用デバッグログの出力
 * @param message {string} 出力するメッセージ
 */
export const devLog = (message: string) => {
  console.log(`##### ${message}`)
}

/**
 * 開発用デバッグログの出力
 * @param obj {any} オブジェクト
 * @param indent { string} インデント
 */
export const debugObj = (obj: any, indent: string = '') => {
  // Handle null, undefined, strings, and non-objects.
  if (obj === null) return 'null'
  if (obj === undefined) return 'undefined'
  if (typeof obj === 'string') return '"' + obj + '"'
  if (typeof obj !== 'object') return String(obj)

  if (indent === undefined) indent = ''

  // Handle (non-null) objects.
  var str = '{\n'
  for (var key in obj) {
    str += indent + '  ' + key + ' = '
    str += debugObj(obj[key], indent + '  ') + '\n'
  }
  return str + indent + '}'
}

/**
 * ローカルストレージの情報を取得
 * @param key {string} キー
 * @param initialVlaue {T} 初期値
 */
export const getLocalStorageObject = <T>(key: string, initialValue: T): T => {
  const storedValue = localStorage.getItem(key)
  return storedValue ? JSON.parse(storedValue) : initialValue
}

/**
 * 配列をシャッフルする
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const clone = [...array]
  const result = clone.reduce((_, current, idx) => {
    let rand = Math.floor(Math.random() * (idx + 1))
    clone[idx] = clone[rand]
    clone[rand] = current
    return clone
  }, clone)

  return result
}

// export const getKeys = <T extends {[key: string]: unknown}>(obj: T): (keyof T)[] => {
//   return Object.keys(obj)
// }
export const getKeys = <T extends { [key: string]: any }>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[]
}
