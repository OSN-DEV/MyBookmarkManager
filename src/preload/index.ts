import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ED } from './EventDef'
import { TCategory } from '../@types/TCategory'
import { TItem } from 'src/@types/TItem'


/** アイテム一覧取得イベントのリスナー */
let itemListLoadListener: ((event: IpcRendererEvent, itemList: TItem[]) => void) | undefined
/** カテゴリ一覧取得イベントのリスナー */
let categoryListLoadListener: ((event: IpcRendererEvent, categoryList: TCategory[]) => void) | undefined

/**
 * メインウィンドウ
 */
contextBridge.exposeInMainWorld('mainApi', {
  /** category list */
  /**
   * Show context menu for category list
   * @param category - category information.
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
    // ipcRenderer.on(ED.CategoryList.Load, (ev: IpcRendererEvent, categoryList: TCategory[]) => callback(ev, categoryList))
    ipcRenderer.on(ED.CategoryList.Load, (ev: IpcRendererEvent, categoryList: TCategory[]) => callback(ev, categoryList))
  },

  /**
   * カテゴリ削除イベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryId カテゴリ削除
   * @summary カテゴリ削除時に発火
   */
  onCategoryDelete: (callback: (event: IpcRendererEvent, categoryId: number) => void) => {
    ipcRenderer.on(ED.CategoryList.Delete, (ev: IpcRendererEvent, categoryId: number) => callback(ev, categoryId))
  },

  /**
   * Show context menu for item list
   * @param categoryId - current category id
   * @param item - item infromation.
   * @returns void
   */
  showItemListContextMenu: (categoryId: number, item: TItem | null) => ipcRenderer.send(ED.ItemList.ContextMenu.Show, categoryId, item),

  /**
   * Launch item with relative app
   * @param path - launch item path
   * @returns void
   */
  launchItem: (path: string) => ipcRenderer.send(ED.ItemList.LaunchItem, path),

  /**
   * アイテム一覧 取得要求
   */
  requestItemList: (categoryId: number) => ipcRenderer.invoke(ED.ItemList.Request, categoryId),

  /**
   * アイテムリスト一覧取得イベント
   * @param callback アイテム情報
   * @param callback.event IPCメッセージイベント
   * @param callback.itemList アイテム一覧
   * @summary カテゴリ選択時に発火
   */
  // onItemListLoad: (callback: (event: IpcRendererEvent, itemList: TItem[]) => void) => {
  //   ipcRenderer.on(ED.ItemList.Load, (ev: IpcRendererEvent, itemList: TItem[]) => callback(ev, itemList))
  // },
  onItemListLoad: (callback: (event: IpcRendererEvent, itemList: TItem[]) => void): void => {
      itemListLoadListener = (_, message) => callback(_, message);
      ipcRenderer.on(ED.ItemList.Load, itemListLoadListener);
  },
  /**
   * アイテムリスト一覧取得のリスナー削除
   */
  // removeListner:(callback: (event: IpcRendererEvent, itemList: TItem[]) => void) => {
  //   ipcRenderer.removeListener(ED.ItemList.Load, callback)
  // },
  removeListener: () => {
    if (itemListLoadListener) {
      ipcRenderer.removeListener(ED.ItemList.Load, itemListLoadListener);
      itemListLoadListener = undefined; // リスナーの参照をリセット
    }
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


interface ItemLoadCallback {
  (event: IpcRendererEvent, categoryId: number, item: TItem | null): void;
}
/**
 * アイテム編集
 */
contextBridge.exposeInMainWorld('itemApi', {
  /**
   * ロードイベント
   * @param callback コールバック
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryId カテゴリID
   * @param callback.item アイテム情報
   */
  // onLoad: (callback: (event: IpcRendererEvent, categoryId: number, item: TItem | null) => void) => {
  //   ipcRenderer.on(ED.ItemEdit.Load, (event: IpcRendererEvent, categoryId: number, item: TItem | null) => callback(event, categoryId, item))
  // },
  onLoad: (callback: ItemLoadCallback) => {
    ipcRenderer.on(ED.ItemEdit.Load, callback)
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
