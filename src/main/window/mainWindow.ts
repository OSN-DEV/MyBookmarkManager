import { app, shell, BrowserWindow, Menu } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { initDatabase } from '../database/database'
import { ED } from '../../preload/EventDef'
import * as CategoryTable from '../database/categoryTable'
import * as ItemTable from '../database/itemTable'
import icon from '../../../resources/icon.png'
import { devLog } from '../../util/common'
let showDevTool: boolean = false
let mainWindow: BrowserWindow | null = null

/**
 * メインウィンドウのインスタンスを取得
 * @returns メインウィンドウ
 */
export const getmainWindow = (): BrowserWindow | null => {
  return mainWindow
}

/**
 * メインウィンドウを作成
 */
export const createWindow = async (): Promise<void> => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    // titleBarStyle: 'hidden',
    titleBarOverlay: {
      // color of titile bar
      color: '#3b3b3b',
      // color of titile bar control
      symbolColor: '#74b1be',
      // height of titile bar
      height: 32
    },
    // ...(process.platform === 'linux' ? { icon } : {}),
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // Pattern3
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { label: showDevTool ? 'hide dev tool' : 'show dev tool', click: () => toggleDevTool() },
        {
          click: (): void => {
            // mainWindow?.webContents.send('update-counterXXX', 1)
            initDatabase()
          },
          label: 'increment'
        },
        {
          click: (): void => {
            mainWindow?.webContents.send('update-counter', -1)
          },
          label: 'decrement'
        },
        {
          click: (): void => {
            console.log('send request')
            mainWindow?.webContents.send(ED.CategoryList.ContextMenu.CreateRequest)
          },
          label: 'test'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow?.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' } // 新しいウィンドウを開くことを拒否(指定されたURLがデフォルトブラウザで表示されることを強要)
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  mainWindow.hide()
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow?.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow?.loadFile(join(__dirname, '../renderer/index.html'))
  }
  mainWindow?.webContents.on('did-finish-load', async () => {
    await sendRefreshCategoryList()
    mainWindow?.show()
  })
}

/**
 * カテゴリストの更新
 */
export const sendRefreshCategoryList = async (): Promise<void> => {
  devLog('sendRefreshCategoryList')
  const categoryList = await CategoryTable.selectAll()
  mainWindow?.webContents.send(ED.CategoryList.Load, categoryList)
}

/**
 * カテゴリストID削除
 */
export const sendCategoryDelete = async (categoryId: number): Promise<void> => {
  devLog('sendCateogryDelete')
  mainWindow?.webContents.send(ED.CategoryList.Delete, categoryId)
}

/**
 * アイテムの更新
 * @param categoryId: カテゴリID
 */
export const sendRefreshItemList = async (categoryId: number): Promise<void> => {
  devLog('sendRefreshItemist')
  const itemList = await ItemTable.selectAll(categoryId)
  mainWindow?.webContents.send(ED.ItemList.Load, itemList)
}

/**
 * Devツールの表示切替
 */
export const toggleDevTool = (): void => {
  if (null === mainWindow) {
    return
  }
  if (showDevTool) {
    mainWindow.webContents.closeDevTools()
  } else {
    mainWindow.webContents.openDevTools()
  }
  showDevTool = !showDevTool
}
