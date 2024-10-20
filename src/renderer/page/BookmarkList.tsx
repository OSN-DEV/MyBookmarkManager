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
  devLog('BookmarkList')
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(0)

  const handleCurrentCategoryIdChanged = (categoryId: number): void => {
    devLog(`handleCurrentCategoryIdChanged`)
    setCurrentCategoryId(categoryId)
    window.mainApi.requestItemList(categoryId)
  }

  const [categoryList, setCategoryList] = useState<TCategory[]>([])
  const [itemList, setItemList] = useState<TItem[]>([])

  /**
   * ロードイベント
   */
  useEffect( ()=> {
    window.mainApi.onCategoryListLoad((_: IpcRendererEvent, categoryList: TCategory[]) => {
      devLog(`window.mainApi.onCategoryListLoad`)
      setCategoryList(categoryList)
    })
  }, [categoryList])

  useEffect( ()=> {
    window.mainApi.onItemListLoad((_: IpcRendererEvent, itemList: TItem[]) => {
      devLog(`window.mainApi.onItemListLoad`)
      setItemList(itemList)
    })
  }, [itemList])

  const handleClickItem = (e: React.MouseEvent<HTMLSpanElement>, item: TItem | null): void => {
    handleItemContextMenu(null)
  }

  const handleItemContextMenu = (item: TItem | null): void => {
    console.log(`handleContextMenu: ${currentCategoryId}-${item == null ? '' : JSON.stringify(item)}`)
    if (currentCategoryId <= 0) {
      devLog(`category is not selected`)
      return
    }
    window.mainApi.showItemListContextMenu(currentCategoryId, item)
  }


  // const categoryList: TCategory[] = [
  //   { id: 1, name: 'c1', sort: 1 },
  //   { id: 2, name: 'c2', sort: 2 },
  //   { id: 3, name: 'c3', sort: 2 },
  //   { id: 4, name: 'c4', sort: 2 },
  //   { id: 5, name: 'c5', sort: 2 },
  //   { id: 6, name: 'c6', sort: 2 }
  // ]

  // const itemList: TItem[] = [
  //   { categoryId: 1, id: 1, title: 'Google', sort: 1, url: 'https://www.google.co.jp', explanation: 'ぐぐるとは', note: '' },
  //   { categoryId: 1, id: 2, title: 'Youtube', sort: 1, url: 'httsp:www.youtube.com/', explanation: 'ぐぐるとは', note: '' },
  //   {
  //     categoryId: 1,
  //     id: 3,
  //     title: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所',
  //     note: ''
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 4,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 5,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 9,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 10,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 11,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   },
  //   {
  //     categoryId: 1,
  //     itemId: 12,
  //     itemName: 'Zenn',
  //     sort: 1,
  //     url: 'https://zenn.dev/',
  //     explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
  //   }
  // ]

  return (
    <CategoryIdProvider>
      <Resize handleWidth="3px" handleColor="#FF0000">
        <ResizeHorizon minWidth="200px" width="200px" overflow="auto" className="left-side">
          <CategoryList categoryList={categoryList} currentCategoryIdChanged={handleCurrentCategoryIdChanged} />
        </ResizeHorizon>
        <ResizeHorizon minWidth="100px" overflow="auto">
          <div className="h-full" onContextMenu={(e) => handleClickItem(e, null)}>
            <ItemList itemList={itemList} handleContextMenu={handleItemContextMenu}/>
          </div>
        </ResizeHorizon>
      </Resize>
    </CategoryIdProvider>
  )
}
