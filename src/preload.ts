import  { contextBridge, ipcRenderer, IpcRendererEvent  } from 'electron'

contextBridge.exposeInMainWorld('testApi', {
  // pattern1
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  handleCounter: (listener:(ev: IpcRendererEvent, num:number) => void) => {
    ipcRenderer.on('update-counter', (ev: IpcRendererEvent , num:number) => listener(ev, num))
  }
})