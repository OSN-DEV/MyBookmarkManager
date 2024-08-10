import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ED } from './EventDef'


contextBridge.exposeInMainWorld('mainApi', {
  ping: () => ipcRenderer.send('ping'),
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  showCategoryListContextMenu: (categoryId: number | null) => ipcRenderer.send(ED.CategoryList.ContextMenu.Show, categoryId),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  counterValue: (value: number) => ipcRenderer.send('counter-value', value),
  onUpdateCounter: (callback: (event: any, value: number) => void) => {
    ipcRenderer.on('update-counter', (ev: IpcRendererEvent, value: number) => callback(ev, value))
  },
  
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
})

