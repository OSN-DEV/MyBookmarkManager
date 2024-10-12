import { app, BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import * as CL from './categoryList'
import * as IL from './itemList'
import { ED } from '../preload/EventDef'
import { devLog } from '../util/common'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'
import { createDataDir } from './settings'
import { initDatabase } from './database/database'
import * as categoryTable from './database/categoryTable'
import * as itemTable from './database/itemTable'
import { closeCategoryEditWindow, createCategoryEditWindow } from './window/categoryEditWindow'
import { createWindow, getmainWindow, sendRefreshCategoryList, sendRefreshItemList } from './window/mainWindow'
import { TItem } from 'src/@types/TItem'
import { closeItemEditWindow, createItemEditWindow } from './window/itemEditWindow'

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
})

/**
 * イベント登録
 */
const registerEvent = async (): Promise<void> => {
  devLog(`registerEvent`)
  // Category List
  ipcMain.on(ED.CategoryList.ContextMenu.Show, (_: IpcMainEvent, category: TCategory | null) => {
    CL.showContextMenu(category, categoryContextMenuCallback)
  })

  // Item List
  ipcMain.on(ED.ItemList.ContextMenu.Show, (_: IpcMainEvent, categoryId: number, item: TItem | null) => {
    IL.showContextMenu(categoryId, item, itemContextMenuCallback)
  })
  ipcMain.handle(ED.ItemList.Request, (_, categoryId: number) => handleItemListRequest(categoryId))

  // Category Edit
  ipcMain.handle(ED.CategoryEdit.Create, (_, category: TCategory) => handleCategoryCreate(category))
  ipcMain.handle(ED.CategoryEdit.Update, (_, category: TCategory) => handleCategoryUpdate(category))
  ipcMain.on(ED.CategoryEdit.Cancel, closeCategoryEditWindow)

  // Item Edit
  ipcMain.handle(ED.ItemEdit.Create, (_, item: TItem) => handleItemCreate(item))
  ipcMain.handle(ED.ItemEdit.Update, (_, item: TItem) => handleItemUpdate(item))
  ipcMain.on(ED.ItemEdit.Cancel, closeItemEditWindow)

  await createWindow()

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
  console.log(category)
  createCategoryEditWindow(getmainWindow()!, category)
}

/**
 * コンテキストメニュー コールバック
 */
const itemContextMenuCallback = (categoryId: number, item: TItem | null, mode: RequestMode): void => {
  devLog(`itemContextMenuCallback: ${categoryId} - ${item?.id} - ${mode}`)
  console.log(item)
  createItemEditWindow(getmainWindow()!, categoryId, item)
}

// ------------------------------------------------------------------
// アイテムリスト
// ------------------------------------------------------------------
const handleItemListRequest = (categoryId: number): void => {
  devLog(`handleItemListRequest: categoryId:${categoryId}`)
  sendRefreshItemList(categoryId)
}

// ------------------------------------------------------------------
// カテゴリ編集
// ------------------------------------------------------------------
/*
 * カテゴリ作成
 * @params category カテゴリ情報
 */
const handleCategoryCreate = (category: TCategory): void => {
  devLog(`handleCategoryCreate`)
  categoryTable.create(category)
  closeCategoryEditWindow()
  sendRefreshCategoryList()
}

/*
 * カテゴリ更新
 * @params category カテゴリ情報
 */
const handleCategoryUpdate = (category: TCategory): void => {
  devLog(`handleCategoryUpdate`)
  categoryTable.update(category)
  closeCategoryEditWindow()
  sendRefreshCategoryList()
}

// ------------------------------------------------------------------
// アイテム編集
// ------------------------------------------------------------------
/*
 * アイテム作成
 * @params item アイテム情報
 */
const handleItemCreate = (item: TItem): void => {
  devLog(`handleCategoryCreate:${JSON.stringify(item)}`)
  itemTable.create(item)
  closeItemEditWindow()
}

/*
 * アイテム更新
 * @params item アイテム情報
 */
const handleItemUpdate = (item: TItem): void => {
  devLog(`handleItemUpdate`)
  itemTable.update(item)
  closeItemEditWindow()
}
