import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { ED } from '../../preload/EventDef'
import { TCategory } from '../../@types/TCategory'
import { devLog } from '../../util/common'

let showDevTool: boolean = false
let categoryEditWindow: BrowserWindow | null = null

/**
 * カテゴリウィンドウを作成
 * @param parent 親ウィンドウ
 * @param category カテゴリ情報
 */
export const createCategoryEditWindow = (parent: BrowserWindow, category: TCategory | null): void => {
  devLog(`createCategoryEditWindow`)
  if (null != categoryEditWindow && !categoryEditWindow.isDestroyed()) {
    categoryEditWindow.close()
  }

  categoryEditWindow = new BrowserWindow({
    parent: parent!,
    width: 400,
    height: 200,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  categoryEditWindow.title = 'category'
  categoryEditWindow.setMenuBarVisibility(false)
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    categoryEditWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/categoryEdit.html`)
  } else {
    categoryEditWindow.loadFile(join(__dirname, '../renderer/categoryEdit.html'))
  }

  categoryEditWindow.on('ready-to-show', () => {
    console.log(`#### ready-to-show`)
    categoryEditWindow?.show()
    categoryEditWindow?.webContents.send(ED.CategoryEdit.Load, category)
    // toggleDevTool()
  })
}

/*
 * カテゴリ編集ウィンドウをクローズ
 */
export const closeCategoryEditWindow = (): void => {
  if (categoryEditWindow != null) {
    categoryEditWindow.close()
    categoryEditWindow = null
  }
}

export const toggleDevTool = (): void => {
  if (null === categoryEditWindow) {
    return
  }
  if (showDevTool) {
    categoryEditWindow.webContents.closeDevTools()
  } else {
    categoryEditWindow.webContents.openDevTools()
  }
  showDevTool = !showDevTool
}
