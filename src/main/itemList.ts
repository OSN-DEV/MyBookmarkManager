import { Menu } from 'electron'
import * as cm from '../util/common'
import { RequestMode } from '../util/Constant'
import { TItem } from 'src/@types/TItem'

export const showContextMenu = (categoryId: number, item: TItem | null, callback: (categoryId: number, item: TItem | null, mode: RequestMode) => void): void => {
  const isCreate = item === null
  cm.devLog(`showContextMenu: ${categoryId} - ${item?.id}: ${item?.title}`)
  let contextMenu: Menu | null = null

  contextMenu = Menu.buildFromTemplate([
    {
      label: 'Create',
      enabled: isCreate,
      click: (): void => {
        callback(categoryId, item, RequestMode.Create)
      }
    },
    {
      label: 'Edit',
      enabled: !isCreate,
      click: (): void => {
        callback(categoryId, item, RequestMode.Edit)
      }
    },
    {
      label: 'Delete',
      enabled: !isCreate,
      click: (): void => {
        callback(categoryId, item, RequestMode.Delete)
      }
    }
  ])
  contextMenu.popup()
}
