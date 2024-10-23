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
  useEffect(() => {
    window.mainApi.onCategoryListLoad((_: IpcRendererEvent, categoryList: TCategory[]) => {
      devLog(`window.mainApi.onCategoryListLoad`)
      setCategoryList(categoryList)
    })
  }, [categoryList])

  useEffect(() => {
    window.mainApi.onItemListLoad((_: IpcRendererEvent, itemList: TItem[]) => {
      devLog(`window.mainApi.onItemListLoad`)
      setItemList(itemList)
    })
  }, [itemList])

  const handleClickItem = (): void => {
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

  return (
    <CategoryIdProvider>
      <Resize handleWidth="3px" handleColor="#FF0000">
        <ResizeHorizon minWidth="200px" width="200px" overflow="auto" className="left-side">
          <CategoryList categoryList={categoryList} currentCategoryIdChanged={handleCurrentCategoryIdChanged} />
        </ResizeHorizon>
        <ResizeHorizon minWidth="100px" overflow="auto">
          <div className="h-full" onContextMenu={handleClickItem}>
            <ItemList itemList={itemList} handleContextMenu={handleItemContextMenu} />
          </div>
        </ResizeHorizon>
      </Resize>
    </CategoryIdProvider>
  )
}
