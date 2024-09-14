import { app, shell, BrowserWindow, ipcMain, IpcMainEvent, dialog, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as CL from './categoryList'
import { ED } from '../preload/EventDef'
import { devLog } from '../util/common'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'
import { createDataDir } from './settings'
import { initDatabase } from './database/database'
import * as categoryTable from './database/categoryTable'
import {closeCategoryEditWindow, createCategoryEditWindow} from './window/categoryEditWindow'
import { createWindow, getmainWindow, toggleDevTool } from './window/mainWindow'

// let showDevTool: boolean = false
// let mainWindow: BrowserWindow | null = null
// let categoryEditWindow: BrowserWindow | null = null

// function createWindow(): void {
//   // Create the browser window.
//   mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: false,
//     // titleBarStyle: 'hidden',
//     titleBarOverlay: {
//       // color of titile bar
//       color: '#3b3b3b',
//       // color of titile bar control
//       symbolColor: '#74b1be',
//       // height of titile bar
//       height: 32
//     },
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   // Pattern3
//   const menu = Menu.buildFromTemplate([
//     {
//       label: app.name,
//       submenu: [
//         { label: showDevTool ? 'hide dev tool' : 'show dev tool', click: () => toggleDevTool() },
//         {
//           click: () => {
//             // mainWindow?.webContents.send('update-counterXXX', 1)
//             initDatabase()
//           },
//           label: 'increment'
//         },
//         {
//           click: () => {
//             mainWindow?.webContents.send('update-counter', -1)
//           },
//           label: 'decrement'
//         },
//         {
//           click: () => {
//             console.log('send request')
//             mainWindow?.webContents.send(ED.CategoryList.ContextMenu.CreateRequest)
//           },
//           label: 'test'
//         }
//       ]
//     }
//   ])
//   Menu.setApplicationMenu(menu)

//   mainWindow.on('ready-to-show', () => {
//     mainWindow?.show()
//   })

//   mainWindow?.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' } // 新しいウィンドウを開くことを拒否(指定されたURLがデフォルトブラウザで表示されることを強要)
//   })

//   // HMR for renderer base on electron-vite cli.
//   // Load the remote URL for development or the local html file for production.
//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow?.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow?.loadFile(join(__dirname, '../renderer/index.html'))
//   }
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // 以下の処理行うことで例外のアラートのか笑いにログを出力
  // process.on('uncaughtException', function (error) {
  //   console.error(error)
  // })

  createDataDir()
  await initDatabase()

  // Set app user model id for windows
  // windows環境における識別子のようなもの。
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerEvent()
  toggleDevTool()
})

// /**
//  * カテゴリ編集ウィンドウの作成
//  */
// function createCategoryEditWindow2(category: TCategory | null): void {
//   if (null != categoryEditWindow && !categoryEditWindow.isDestroyed()) {
//     categoryEditWindow.close()
//   }

//   categoryEditWindow = new BrowserWindow({
//     parent: mainWindow!,
//     width: 400,
//     height: 200,
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })
//   categoryEditWindow.setMenuBarVisibility(false)
//   if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
//     categoryEditWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/category.html`)
//   } else {
//     categoryEditWindow.loadFile(join(__dirname, '../renderer/category.html'))
//   }

//   categoryEditWindow.on('ready-to-show', () => {
//     categoryEditWindow?.show()
//     categoryEditWindow?.webContents.send(ED.CategoryEdit.Load, null)
//   })
// }

const openFile = async (): Promise<string> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
  return ''
}

/**
 * イベント登録
 */
const registerEvent = (): void => {
  // Category list
  ipcMain.on(ED.CategoryList.ContextMenu.Show, (_: IpcMainEvent, category: TCategory | null) => {
    CL.showContextMenu(category, categoryContextMenuCallback)
  })

  // Category Edit
  ipcMain.handle(ED.CategoryEdit.Create, (_, category: TCategory) => categoryTable.create(category))
  ipcMain.on(ED.CategoryEdit.Cancel, closeCategoryEditWindow)

  // Pattern1
  ipcMain.on('set-title', (ev: IpcMainEvent, title: string) => {
    const webContents = ev.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win?.setTitle(title)
  })

  // Pattern2
  ipcMain.handle('dialog:openFile', openFile)

  // Pattern3
  ipcMain.on('counter-value', (_: IpcMainEvent, value: number) => {
    console.log(value)
  })

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

// /**
//  * Devツールの表示切替
//  */
// const toggleDevTool = (): void => {
//   if (null === mainWindow) {
//     return
//   }
//   if (showDevTool) {
//     mainWindow.webContents.closeDevTools()
//   } else {
//     mainWindow.webContents.openDevTools()
//   }
//   showDevTool = !showDevTool
// }

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
//
//
//

/* =======================================================================
 * カテゴリ編集
======================================================================= */
// /*
//  * カテゴリ編集ウィンドウをクローズ
//  */
// const closeCategoryEditWindow = (): void => {
//   if (categoryEditWindow != null) {
//     categoryEditWindow.close()
//     categoryEditWindow = null
//   }
// }

