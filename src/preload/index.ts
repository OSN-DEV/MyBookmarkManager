import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ED } from './EventDef'
import { TCategory } from '../@types/TCategory'
import { TItem } from 'src/@types/TItem'

/**
 * メインウィンドウ
 */
contextBridge.exposeInMainWorld('mainApi', {
  /** category list */
  /**
   * Show context menu for category list
   * @param categoryId - category id.
   * @returns void
   */
  showCategoryListContextMenu: (category: TCategory | null) => ipcRenderer.send(ED.CategoryList.ContextMenu.Show, category),

  /**
   * カテゴリリスト一覧取得イベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryList カテゴリ一覧
   * @summary アプリ起動時、カテゴリ情報変更時に発生
   */
  onCategoryListLoad: (callback: (event: IpcRendererEvent, categoryList: TCategory[]) => void) => {
    ipcRenderer.on(ED.CategoryList.Load, (ev: IpcRendererEvent, categoryList: TCategory[]) => callback(ev, categoryList))
  },


  // ping: () => ipcRenderer.send('ping'),
  ping: () => ipcRenderer.send('ping'),
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  counterValue: (value: number) => ipcRenderer.send('counter-value', value),
  onUpdateCounter: (callback: (event: IpcRendererEvent, value: number) => void) => {
    ipcRenderer.on('update-counter', (ev: IpcRendererEvent, value: number) => callback(ev, value))
  },


  /**
   * Create category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemCreateReqeust: (callback: (event: IpcRendererEvent) => void) => {
    ipcRenderer.on(ED.CategoryList.ContextMenu.CreateRequest, (ev: IpcRendererEvent) => callback(ev))
  },

  /**
   * Edit category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemEditReqeust: (callback: (event: IpcRendererEvent, categoryId: number) => void) => {
    ipcRenderer.on(ED.CategoryList.ContextMenu.EditRequest, (ev: IpcRendererEvent, categoryId: number) => callback(ev, categoryId))
  },

  /**
   * Delete category item request
   * @param callback - callback
   * @return void
   */
  onCategoryItemDeleteReqeust: (callback: (event: IpcRendererEvent, categoryId: number) => void) => {
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
  create: (category: TCategory) => ipcRenderer.invoke(ED.CategoryEdit.Create, category),

  /**
   * カテゴリ更新
   * @param category カテゴリ情報
   */
  update: (category: TCategory) => ipcRenderer.invoke(ED.CategoryEdit.Update, category),

  /**
   * キャンセル
   */
  cancel: () => ipcRenderer.send(ED.CategoryEdit.Cancel)
})

/**
 * アイテム編集
 */
contextBridge.exposeInMainWorld('itemApi', {
  /**
   * ロードイベント
   * @param callback コールバック
   * @param callback.event IPCメッセージイベント
   * @param callback.item アイテム情報
   */
  onLoad: (callback: (event: IpcRendererEvent, item: TItem | null) => void) => {
    ipcRenderer.on(ED.ItemEdit.Load, (event: IpcRendererEvent, item: TItem | null) => callback(event, item))
  },

  /**
   * アイテム作成
   * @param item アイテム情報
   */
  create: (item: TItem) => ipcRenderer.invoke(ED.ItemEdit.Create, item),

  /**
   * アイテム更新
   * @param item アイテム情報
   */
  update: (item: TItem) => ipcRenderer.invoke(ED.ItemEdit.Update, item),

  /**
   * キャンセル
   */
  cancel: () => ipcRenderer.send(ED.ItemEdit.Cancel)
})
