import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import * as CL from './categoryList'
import { ED } from '../preload/EventDef'
import { devLog } from '../util/common'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'
import { createDataDir } from './settings'
import { initDatabase } from './database/database'
import * as categoryTable from './database/categoryTable'
import { closeCategoryEditWindow, createCategoryEditWindow } from './window/categoryEditWindow'
import { createWindow, getmainWindow, toggleDevTool } from './window/mainWindow'

app.whenReady().then(async () => {
  // 以下の処理行うことで例外のアラート表示を良くしてログを出力
  // process.on('uncaughtException', function (error) {
  //   console.error(error)
  // })

  createDataDir()
  await initDatabase()

  // Windows環境でタスクバーで使用される情報らしい
  // https://learn.microsoft.com/ja-jp/windows/win32/shell/appids
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // イベント登録
  registerEvent()

  // ひとまず開発時は開発ツールをデフォルトで表示する。
  toggleDevTool()
})

/**
 * イベント登録
 */
const registerEvent = (): void => {
  // Category List
  ipcMain.on(ED.CategoryList.ContextMenu.Show, (_: IpcMainEvent, category: TCategory | null) => {
    CL.showContextMenu(category, categoryContextMenuCallback)
  })

  // Category Edit
  ipcMain.handle(ED.CategoryEdit.Create, (_, category: TCategory) => categoryTable.create(category))
  ipcMain.on(ED.CategoryEdit.Cancel, closeCategoryEditWindow)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

/**
 * コンテキストメニュー コールバック
 */
const categoryContextMenuCallback = (category: TCategory | null, mode: RequestMode): void => {
  devLog(`categoryContextMenuCallback: ${category?.id}, ${mode}`)
  createCategoryEditWindow(getmainWindow()!, category)
}
