import { BrowserWindow, Menu } from 'electron'
import * as cm from '../util/common'
import { ED } from '../preload/EventDef'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'

let contextMenu: Menu | null = null
export const showContextMenu = (
  window: BrowserWindow | null,
  category: TCategory | null,
  callback: (category: TCategory | null, mode: RequestMode) => void
) => {
  const isCreate = (category?.categoryId === null)
  cm.devLog(`showContextMenu: ${category?.categoryId}`)
  if (!contextMenu) {
    contextMenu = Menu.buildFromTemplate([
      {
        label: 'Create',
        enabled: isCreate,
        click: () => {
          callback(category, RequestMode.Create)
        }
      },
      {
        label: 'Edit',
        enabled: !isCreate,
        click: () => {
          callback(category, RequestMode.Edit)
        }
      },
      {
        label: 'Delete',
        enabled: !isCreate,
        click: () => {
          // handleDeleteClick(window, categoryId)
        }
      }
    ])
  } else {
    contextMenu.items.map((m) => {
      if (m.label === 'Create') {
        m.enabled = isCreate
      } else {
        m.enabled = !isCreate
      }
    })
  }
  contextMenu.popup()
}

const handleCreateClick = (window: BrowserWindow | null) => {
  cm.devLog(`handleCreateClick`)
  contextMenu?.closePopup()
  window!.webContents.send(ED.CategoryList.ContextMenu.CreateRequest)
  window!.webContents.send('update-counter', 1)
  cm.devLog(`send create category item request: ${ED.CategoryList.ContextMenu.CreateRequest}`)
}

const handleEditClick = (window: BrowserWindow | null, categoryId: number | null) => {
  cm.devLog(`handleEditClick: ${categoryId}`)
  contextMenu?.closePopup()
}

const handleDeleteClick = (window: BrowserWindow | null, categoryId: number | null) => {
  cm.devLog(`handleDeleteClick: ${categoryId}`)
  contextMenu?.closePopup()
}
