import React, { useEffect, useState } from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'
import { TCategory } from '../../@types/TCategory'
import { FaGithub } from 'react-icons/fa'
import { TItem } from '../../@types/TItem'
import { devLog } from '../../util/common'

export const BookmarkList = () => {
  // register event from main process
  useEffect(() => {
    /**
     * Create category list item request
     */
    window.mainApi?.onCategoryItemCreateReqeust((_: any) => {
      devLog(`onCategoryItemCreateReqeust`)
    })
    //   /**
    //    * Edit category list item request
    //    */
    //   window.mainApi?.onCategoryItemEditReqeust((_: any, categoryId: number) => {
    //     devLog(`onCategoryItemEditReqeust: ${categoryId}`)
    // })
    //   /**
    //    * Ddit category list item request
    //    */
    //   window.mainApi?.onCategoryItemDeleteReqeust((_: any, categoryId: number) => {
    //     devLog(`onCategoryItemDeleteReqeust: ${categoryId}`)
    // })
  }, [])

  const [currentCategoryId, setCurrentCategoryId] = useState(0)

  const categoryList: TCategory[] = [
    { categoryId: 1, categoryName: 'c1', order: 1 },
    { categoryId: 2, categoryName: 'c2', order: 2 },
    { categoryId: 3, categoryName: 'c3', order: 2 },
    { categoryId: 4, categoryName: 'c4', order: 2 },
    { categoryId: 5, categoryName: 'c5', order: 2 },
    { categoryId: 6, categoryName: 'c6', order: 2 }
  ]

  const itemList: TItem[] = [
    { categoryId: 1, itemId: 1, itemName: 'Google', order: 1, url: 'https://www.google.co.jp', explanation: 'ぐぐるとは' },
    { categoryId: 1, itemId: 2, itemName: 'Youtube', order: 1, url: 'httsp:www.youtube.com/', explanation: 'ぐぐるとは' },
    {
      categoryId: 1,
      itemId: 3,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 4,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 5,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 6,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 7,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 8,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 9,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 10,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 11,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    },
    {
      categoryId: 1,
      itemId: 12,
      itemName: 'Zenn',
      order: 1,
      url: 'https://zenn.dev/',
      explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'
    }
  ]

  return (
    <Resize handleWidth="3px" handleColor="#FF0000">
      <ResizeHorizon minWidth="200px" width="200px" overflow="auto" className="left-side">
        <CategoryList currentId={currentCategoryId} categoryList={categoryList} setCurrentId={setCurrentCategoryId} />
      </ResizeHorizon>
      <ResizeHorizon minWidth="100px" overflow="auto">
        <ItemList itemList={itemList} />
      </ResizeHorizon>
    </Resize>
  )
}
