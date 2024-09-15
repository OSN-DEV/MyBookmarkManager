import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { ED } from '../../preload/EventDef'
import { TCategory } from '../../@types/TCategory'

let categoryEditWindow: BrowserWindow | null = null

/**
 * カテゴリウィンドウを作成
 * @param parent 親ウィンドウ
 * @param category カテゴリ情報
 */
export const createCategoryEditWindow = (parent: BrowserWindow, category: TCategory | null): void => {
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
    categoryEditWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/category.html`)
  } else {
    categoryEditWindow.loadFile(join(__dirname, '../renderer/category.html'))
  }

  categoryEditWindow.on('ready-to-show', () => {
    categoryEditWindow?.show()
    categoryEditWindow?.webContents.send(ED.CategoryEdit.Load, category)
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
