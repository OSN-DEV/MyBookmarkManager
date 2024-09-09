import { IpcRendererEvent, contextBridge, ipcRenderer, IpcMainEvent } from 'electron'
import { ED } from './EventDef'
import { TCategory } from '../@types/TCategory'

/**
 * メインウィンドウ
 */
contextBridge.exposeInMainWorld('mainApi', {
  // ping: () => ipcRenderer.send('ping'),
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
  showCategoryListContextMenu: (category: TCategory | null) => ipcRenderer.send(ED.CategoryList.ContextMenu.Show, category),

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
  }
})

/**
 * カテゴリ編集
 */
contextBridge.exposeInMainWorld('categoryApi', {
  /**
   * ロードイベント
   * @param callback コールバック
   * @param callback.event IPCメッセージイベント
   * @param callback.category カテゴリ情報
   */
  onLoad: (callback: (event: IpcRendererEvent, category: TCategory | null) => void) => {
    ipcRenderer.on(ED.CategoryEdit.Load, (event: IpcRendererEvent, category: TCategory | null) => callback(event, category))
  },

  /**
   * カテゴリ作成
   * @param category カテゴリ情報
   */
  create: (category: TCategory) => ipcRenderer.invoke(ED.CategoryEdit.Create, category)
})
