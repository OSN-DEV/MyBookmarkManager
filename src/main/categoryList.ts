import { Menu } from 'electron'
import * as cm from '../util/common'
import { RequestMode } from '../util/Constant'
import { TCategory } from '../@types/TCategory'

export const showContextMenu = (category: TCategory | null, callback: (category: TCategory | null, mode: RequestMode) => void): void => {
  const isCreate = category === null
  cm.devLog(`showContextMenu: ${category?.id}: ${category?.name}`)
  let contextMenu: Menu | null = null

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
        callback(category, RequestMode.Delete)
      }
    }
  ])
  contextMenu.popup()
}
