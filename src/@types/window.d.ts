import { IpcRendererEvent } from 'electron'
import { TCategory } from './TCategory'
import { TItem } from './TItem'

// import { ElectronAPI } from '@electron-toolkit/preload'
declare global {
  interface Window {
    mainApi: IMainApi
    categoryApi: ICategoryApi
    itemApi: IItemApi
  }
}

/** カテゴリ一覧ロード コールバックの型*/
export type TCategoryListLoad = (event: IpcRendererEvent, categoryList: TCategory[]) => void
/** カテゴリ削除 k－るバックの方 */
export type TCategoryDelete = (event: IpcRendererEvent, categoryId: number) => void
/** アイテム一覧ロード コールバックの型 */
export type TItemListLoad = (event: IpcRendererEvent, itemList: TItem[]) => void

/**
 * メインウィンドウ
 */
export interface IMainApi {
  /**
   * カテゴリ コンテキストメニュー表示
   * @param category カテゴリ情報
   */
  showCategoryListContextMenu: (category: TCategory | null) => void

  /**
   * カテゴリリスト一覧取得イベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryList カテゴリ一覧
   * @summary アプリ起動時、カテゴリ情報変更時に発生
   */
  // onCategoryListLoad: (callback: (event: IpcRendererEvent, categoryList: TCategory[]) => void) => void
  onCategoryListLoad: (callback: TCategoryListLoad) => void

  /**
   * カテゴリリスト一覧取得リスナー削除
   * @param callback リスナー
   */
  removeCategoryListLoadListener: (callback: TCategoryListLoad) => void

  /**
   * カテゴリ削除イベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.categoryId 削除されたカテゴリID
   * @summary カテゴリ削除時に発生
   */
  onCategoryDelete: (callback: TCategoryDelete) => void

  /**
   * カテゴリ削除リスナー削除
   * callback リスナー
   */
  removeCategoryDeleteListener: (callback: TCategoryDelete) => void

  /**
   * アイテム コンテキストメニュー表示
   * @param categoryId カテゴリID
   * @param item アイテム情報
   */
  showItemListContextMenu: (categoryId: number, item: TItem | null) => void

  /**
   * Launch item with relative app
   * @param path - launch item path
   * @returns void
   */
  launchItem: (path: string) => void

  /**
   * アイテム一覧 取得要求
   */
  requestItemList: (categoryId: number) => void

  /**
   * アイテム一覧取得イベント
   * @param callback アイテム情報
   * @param callback.event IPCメッセージイベント
   * @param callback.itemList アイテム一覧
   * @summary カテゴリ選択時に発火
   */
  // onItemListLoad: (callback: (event: IpcRendererEvent, itemList: TItem[]) => void) => void
  onItemListLoad: (callback: TItemListLoad) => void

  /**
   * アイテム一覧取得イベントリスナー削除
   * @param callback リスナー
   */
  removeItemListLoadListener: (callback: TItemListLoad) => void
}

/**
 *  カテゴリ編集
 */
export interface ICategoryApi {
  /**
   * ロードイベント
   * @param callback カテゴリ情報
   * @param callback.event IPCメッセージイベント
   * @param callback.category カテゴリ情報
   */
  onLoad: (callback: (event: IpcRendererEvent, category: TCategory | null) => void) => void

  /**
   * カテゴリ作成
   * @param category カテゴリ情報
   * @return カテゴリ情報(IDを設定)
   */
  create: (category: TCategory) => Promise<TCategory>

  /**
   * カテゴリ更新
   * @param category カテゴリ情報
   * @return カテゴリ情報(IDを設定)
   */
  update: (category: TCategory) => Promise<TCategory>

  /**
   * キャンセル
   */
  cancel: () => void
}

/**
 *  アイテム編集
 */
export interface IItemApi {
  /**
   * ロードイベント
   * @param callback アイテム情報情報
   * @param callback.event IPCメッセージイベント
   * @param categoryId: カテゴリID
   * @param callback.item アイテム情報
   */
  onLoad: (callback: (event: IpcRendererEvent, categoryId: number, item: TItem | null) => void) => void

  /**
   * アイテム作成
   * @param item アイテム情報
   * @return アイテム情報(IDを設定)
   */
  create: (item: TItem) => Promise<TItem>

  /**
   * アイテム更新
   * @param categoryId カテゴリID
   * @param item アイテム情報
   * @return アイテム情報(IDを設定)
   */
  update: (item: TItem) => Promise<TItem>

  /**
   * キャンセル
   */
  cancel: () => void
}
