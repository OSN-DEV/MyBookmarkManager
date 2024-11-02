import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { ED } from '../../preload/EventDef'
import { TItem } from 'src/@types/TItem'
import { devLog } from '../../util/common'

let showDevTool: boolean = false
let itemEditWindow: BrowserWindow | null = null

/**
 * アイテム編集ウィンドウを作成
 * @param parent 親ウィンドウ
 * @param categoryId カテゴリID
 * @param item アイテム情報
 */
export const createItemEditWindow = (parent: BrowserWindow, categoryId: number, item: TItem | null): void => {
  devLog(`createItemEditWindow : ${categoryId} - ${JSON.stringify(item)}`)
  if (null != itemEditWindow && !itemEditWindow.isDestroyed()) {
    itemEditWindow.close()
  }

  itemEditWindow = new BrowserWindow({
    parent: parent!,
    width: 400,
    height: 450,
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
    console.log(`#### ready-to-show ${categoryId}`)
    itemEditWindow?.show()
    itemEditWindow?.webContents.send(ED.ItemEdit.Load, categoryId, item)

    // toggleDevTool()
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
