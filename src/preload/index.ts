import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ED } from './EventDef'


contextBridge.exposeInMainWorld('mainApi', {
  ping: () => ipcRenderer.send('ping'),
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  counterValue: (value: number) => ipcRenderer.send('counter-value', value),
  onUpdateCounter: (callback: (event: any, value: number) => void) => {
    ipcRenderer.on('update-counter', (ev: IpcRendererEvent, value: number) => callback(ev, value))
  },
  
  /** category list */
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
  showCategoryListContextMenu: (categoryId: number | null) => ipcRenderer.send(ED.CategoryList.ContextMenu.Show, categoryId),

  /**
   * Create category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemCreateReqeust: (callback: (event: any) => void) => {
    ipcRenderer.on(ED.CategoryList.ContextMenu.CreateRequest, (ev: IpcRendererEvent) => callback(ev))
  },

  /**
   * Edit category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemEditReqeust: (callback: (event: any, categoryId: number) => void) => {
    ipcRenderer.on(ED.CategoryList.ContextMenu.EditRequest, (ev: IpcRendererEvent, categoryId: number) => callback(ev, categoryId))
  },

  /**
   * Delete category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemDeleteReqeust: (callback: (event: any, categoryId: number) => void) => {
    ipcRenderer.on(ED.CategoryList.ContextMenu.EditRequest, (ev: IpcRendererEvent, categoryId: number) => callback(ev, categoryId))
  },
})

