import React, { useState } from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'
import { TCategory } from '../../@types/TCategory'
import { FaGithub } from 'react-icons/fa'
import { TItem } from '../../@types/TItem'

export const BookmarkList = () => {
  const [currentCategoryId, setCurrentCategoryId] = useState(0)

  const categoryList: TCategory[] = [
  { categoryId: 1, categoryName: 'c1', order: 1, icon: FaGithub },
  { categoryId: 2, categoryName: 'c2', order: 2, icon: FaGithub },
  { categoryId: 3, categoryName: 'c3', order: 2, icon: FaGithub },
  { categoryId: 4, categoryName: 'c4', order: 2, icon: FaGithub },
  { categoryId: 5, categoryName: 'c5', order: 2, icon: FaGithub },
  { categoryId: 6, categoryName: 'c6', order: 2, icon: FaGithub },
  ]

  const itemList: TItem[] = [
    {categoryId: 1, itemId: 1, itemName: 'Google', order:1, url:'https://www.google.co.jp', explanation: 'ぐぐるとは'},
    {categoryId: 1, itemId: 2, itemName: 'Youtube', order:1, url:'httsp:www.youtube.com/', explanation: 'ぐぐるとは'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
    {categoryId: 1, itemId: 3, itemName: 'Zenn', order:1, url:'https://zenn.dev/', explanation: 'Zennはエンジニアが技術・開発について知見をシェアする場所'},
  ]

  return (
    <Resize handleWidth ="3px" handleColor= "#FF0000">
      <ResizeHorizon minWidth="200px" width="200px" overflow="auto" className="left-side">
        <CategoryList
          currentId={currentCategoryId}
          categoryList={categoryList}
          setCurrentId={setCurrentCategoryId}
        />
      </ResizeHorizon>
      <ResizeHorizon minWidth="100px" overflow="auto">
        <ItemList
          itemList={itemList}
         />
      </ResizeHorizon>
    </Resize>
  )


}
