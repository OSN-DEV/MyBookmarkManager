import { useEffect, useState } from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'
import { TCategory } from '../../@types/TCategory'
import { TItem } from '../../@types/TItem'
import { IpcRendererEvent } from 'electron'
import { devLog } from '../../util/common'
import { CategoryIdProvider } from '../context/CategoryIdContext'

// interface CartegoryIdContextType {
//   currentCategoryId: number;
//   setCurrentCategoryId: React.Dispatch<React.SetStateAction<number>>;
// }
// export const CartegoryIdContext = createContext<CartegoryIdContextType | undefined>(undefined)

export const BookmarkList = (): JSX.Element => {
  // register event from main process
  useEffect(() => {
    /**
     * Create category list item request
     */
    // window.mainApi?.onCategoryItemCreateReqeust((_: IpcRendererEvent) => {
    //   devLog('tmp')
    // })
  }, [])

  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0)
  const handleCurrentCategoryIdChanged = (categoryId: number) => {
    setCurrentCategoryId(categoryId)
  }

  const [categoryList, setCategoryList] = useState<TCategory[]>([])
  /**
   * ロードイベント
   */
  window.mainApi.onCategoryListLoad((_: IpcRendererEvent, categoryList: TCategory[]) => {
    devLog(`window.mainApi.onCategoryListLoad`)
    setCategoryList(categoryList)
  })

  // const categoryList: TCategory[] = [
  //   { id: 1, name: 'c1', sort: 1 },
  //   { id: 2, name: 'c2', sort: 2 },
  //   { id: 3, name: 'c3', sort: 2 },
  //   { id: 4, name: 'c4', sort: 2 },
  //   { id: 5, name: 'c5', sort: 2 },
  //   { id: 6, name: 'c6', sort: 2 }
  // ]

  const itemList: TItem[] = [
    { categoryId: 1, id: 1, title: 'Google', sort: 1, url: 'https://www.google.co.jp', explanation: 'ぐぐるとは', note: '' },
    { categoryId: 1, id: 2, title: 'Youtube', sort: 1, url: 'httsp:www.youtube.com/', explanation: 'ぐぐるとは', note: '' },
    {
      categoryId: 1,
      id: 3,
      title: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所',
      note: ''
    },
    {
      categoryId: 1,
      itemId: 4,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 5,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 9,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 10,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 11,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 12,
      itemName: 'Zenn',
      sort: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    }
  ]

  return (
    <CategoryIdProvider>
      <Resize handleWidth="3px" handleColor="#FF0000">
        <ResizeHorizon minWidth="200px" width="200px" overflow="auto" className="left-side">
          <CategoryList categoryList={categoryList} currentCategoryIdChanged={handleCurrentCategoryIdChanged} />
        </ResizeHorizon>
        <ResizeHorizon minWidth="100px" overflow="auto">
          <ItemList itemList={itemList} />
        </ResizeHorizon>
      </Resize>
    </CategoryIdProvider>
  )
}
