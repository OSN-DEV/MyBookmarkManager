import { Menu } from 'electron'
import * as cm from '../util/common'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'

let contextMenu: Menu | null = null
export const showContextMenu = (category: TCategory | null, callback: (category: TCategory | null, mode: RequestMode) => void): void => {
  const isCreate = category === null
  cm.devLog(`showContextMenu: ${category?.id}`)
  cm.devLog(isCreate ? 'aa' : 'bb')

  if (!contextMenu) {
    contextMenu = Menu.buildFromTemplate([
      {
        label: 'Create',
        enabled: isCreate,
        click: (): void => {
          callback(category, RequestMode.Create)
        }
      },
      {
        label: 'Edit',
        enabled: !isCreate,
        click: (): void => {
          callback(category, RequestMode.Edit)
        }
      },
      {
        label: 'Delete',
        enabled: !isCreate,
        click: (): void => {
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
