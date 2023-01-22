declare global {
  interface Window {
    testApi: ITestApi;
  }
}
export interface ITestApi {
  setTitle: (title: string) => void   // pattern1
  openFile: () => Promise<string | null >   // pattern2
  // handleCounter: (e:any, num: number) => void // pattern3
  handleCounter: (listener: (event: any, num: number) => void) => void   // pattern3
  
}