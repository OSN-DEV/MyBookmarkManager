import { Menu } from 'electron'
import * as cm from '../util/common'
import { RequestMode } from '../util/Constant'
import { TItem } from 'src/@types/TItem'

export const showContextMenu = (item: TItem | null, callback: (item: TItem | null, mode: RequestMode) => void): void => {
  const isCreate = item === null
  cm.devLog(`showContextMenu: ${item?.id}: ${item?.name}`)
  let contextMenu: Menu | null = null

  contextMenu = Menu.buildFromTemplate([
    {
      label: 'Create',
      enabled: isCreate,
      click: (): void => {
        callback(item, RequestMode.Create)
      }
    },
    {
      label: 'Edit',
      enabled: !isCreate,
      click: (): void => {
        callback(item, RequestMode.Edit)
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
  contextMenu.popup()
}
