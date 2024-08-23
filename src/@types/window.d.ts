import { ElectronAPI } from '@electron-toolkit/preload'
declare global {
  interface Window {
    mainApi: IMainApi;
    categoryApi: ICategoryApi;
  }
}

export interface IMainApi {
  ping:() => void,
  setTitle: (title: string) => void,
  openFile: () => Promise<string>,
  counterValue: (value: number) => void,
  onUpdateCounter: (callback: (event: any, value: number) => void) => void,

  showCategoryListContextMenu:(categoryId: number | null) => void,
  onCategoryItemCreateReqeust: (callback: (event: any) => void) => void,
}

export interface ICategoryApi {
  ping2:() => void
}