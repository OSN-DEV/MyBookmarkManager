import { IpcRendererEvent } from 'electron'
import { TCategory } from './TCategory'

// import { ElectronAPI } from '@electron-toolkit/preload'
declare global {
  interface Window {
    mainApi: IMainApi
    categoryApi: ICategoryApi
  }
}

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
  onCategoryListLoad: (callback: (event: IpcRendererEvent, categoryList: TCategory[]) => void) => void


  onCategoryItemCreateReqeust: (callback: (event: Electron.IpcMessageEvent) => void) => void
  ping: () => void
  setTitle: (title: string) => void
  openFile: () => Promise<string>
  counterValue: (value: number) => void
  onUpdateCounter: (callback: (event: Electron.IpcMessageEvent, value: number) => void) => void
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
   * カテゴリ作更新
   * @param category カテゴリ情報
   * @return カテゴリ情報(IDを設定)
   */
  update: (category: TCategory) => Promise<TCategory>

  /**
   * キャンセル
   */
  cancel: () => void
}
