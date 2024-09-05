import { app } from 'electron'
import path from 'path'
import { FilePath } from '../util/Constant'
import fs from 'fs'
import { TSetting } from '../@types/TSetting'
import { devLog } from '../util/common'

/**
 * アプリのデータフォルダを作成する
 */
export const createDataDir = (): void => {
  const filePath = path.join(app.getPath('appData'), FilePath.AppDirectory)
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath)
  }
}

/**
 * 設定情報を保存する
 * @param 設定情報
 */
export const saveSettings = async (settings: TSetting): Promise<void> => {
  devLog(`saveSettings`)
  const filePath = path.join(app.getPath('appData'), FilePath.SettingFile)
  fs.writeFileSync(filePath, JSON.stringify(settings))
}

/**
 * 設定情報を取得する
 * @returns 設定情報
 */
export const loadSettings = async (): Promise<TSetting> => {
  const filePath = path.join(app.getPath('appData'), FilePath.SettingFile)

  if (!fs.existsSync(filePath)) {
    return {
      isInitializedDB: false
    }
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}
