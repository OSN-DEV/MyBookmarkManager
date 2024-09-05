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
}
