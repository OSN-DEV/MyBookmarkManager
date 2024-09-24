import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { ED } from '../../preload/EventDef'
import { TItem } from 'src/@types/TItem'

let showDevTool: boolean = false
let itemEditWindow: BrowserWindow | null = null

/**
 * アイテム編集ウィンドウを作成
 * @param parent 親ウィンドウ
 * @param category カテゴリ情報
 */
export const createItemEditWindow = (parent: BrowserWindow, item: TItem | null): void => {
  if (null != itemEditWindow && !itemEditWindow.isDestroyed()) {
    itemEditWindow.close()
  }

  itemEditWindow = new BrowserWindow({
    parent: parent!,
    width: 400,
    height: 350,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  itemEditWindow.title = 'item'
  itemEditWindow.setMenuBarVisibility(false)
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    itemEditWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/itemEdit.html`)
  } else {
    itemEditWindow.loadFile(join(__dirname, '../renderer/itemEdit.html'))
  }

  itemEditWindow.on('ready-to-show', () => {
    console.log(`#### ready-to-show`)
    itemEditWindow?.show()
    itemEditWindow?.webContents.send(ED.ItemEdit.Load, item)

    toggleDevTool()
  })
}

/*
 * アイテム編集ウィンドウをクローズ
 */
export const closeItemEditWindow = (): void => {
  if (itemEditWindow != null) {
    itemEditWindow.close()
    itemEditWindow = null
  }
}

export const toggleDevTool = (): void => {
  if (null === itemEditWindow) {
    return
  }
  if (showDevTool) {
    itemEditWindow.webContents.closeDevTools()
  } else {
    itemEditWindow.webContents.openDevTools()
  }
  showDevTool = !showDevTool
}
