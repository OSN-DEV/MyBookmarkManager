import { BrowserWindow, Menu } from 'electron'
import * as cm from '../util/common'
import { ED } from '../preload/EventDef'
import { RequestMode } from '../util/Constant'

let contextMenu: Menu | null = null
export const showContextMenu = (window: BrowserWindow | null,  categoryId: number | null, callback: (categoryId: number | null, mode: RequestMode)=>void) => {
    cm.devLog(`showContextMenu: ${categoryId}`)
    if (!contextMenu) {
        contextMenu  = Menu.buildFromTemplate([
            {
                label: 'Create',
                enabled: (categoryId === null),
                click: () => {callback(categoryId, RequestMode.Create)}
            },
            {
                label: 'Edit',
                enabled: (categoryId !== null),
                click: () => {callback(categoryId, RequestMode.Edit)}
            },
            {
                label: 'Delete',
                enabled: (categoryId !== null),
                click: () => {handleDeleteClick(window, categoryId)}
            },
        ])
    } else {
        contextMenu.items.map((m) => {
            if (m.label === 'Create') {
                m.enabled = (categoryId === null)
            } else {
                m.enabled = (categoryId !== null)
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
