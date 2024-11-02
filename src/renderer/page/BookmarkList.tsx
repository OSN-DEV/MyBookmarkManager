import { useEffect, useRef, useState } from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'
import { TCategory } from '../../@types/TCategory'
import { TItem } from '../../@types/TItem'
import { IpcRendererEvent } from 'electron'
import { devLog } from '../../util/common'
import { CategoryIdProvider } from '../context/CategoryIdContext'


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
   * カテゴリ削除イベント
   */
  const categoryDeleteListner = (_: IpcRendererEvent, categoryId: number): void => {
    const newCategoryList = categoryList.filter((m) => m.id != categoryId)
    setCategoryList(newCategoryList)
    setCurrentCategoryId(-1)
  }
  window.mainApi.removeCategoryDeleteListener(categoryDeleteListner)
  window.mainApi.onCategoryDelete(categoryDeleteListner)

  /**
   * カテゴリ一覧ロード
   */
  const categoryListLodaListener = (_: IpcRendererEvent, categoryList: TCategory[]): void => {
    devLog(`window.mainApi.onCategoryListLoad`)
    devLog(JSON.stringify(categoryList))
    setCategoryList(categoryList)
  }
  window.mainApi.removeCategoryListLoadListener(categoryListLodaListener)
  window.mainApi.onCategoryListLoad(categoryListLodaListener)

  // アイテム一覧ロード
  const itemLoadListener = (_: IpcRendererEvent, itemList: TItem[]): void => {
    devLog(`window.mainApi.onItemListLoad`)
    setItemList(itemList)
  }
  window.mainApi.removeItemListLoadListener(itemLoadListener)
  window.mainApi.onItemListLoad(itemLoadListener)

  /**
   * アイテム表示領域外のコンテキストメニュー
   */
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
