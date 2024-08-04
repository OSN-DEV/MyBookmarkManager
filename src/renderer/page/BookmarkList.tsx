import React, { useState } from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'
import { TCategory } from '../../type/TCategory'
import {FaGithub} from 'react-icons/fa'

export const BookmarkList = () => {
    const [currentCategoryId, setCurrentCategoryId] = useState(0)

    const categoryList: TCategory[] = [
    {categoryId: 1, categoryName: 'c1', order: 1, icon: FaGithub},
    {categoryId: 2, categoryName: 'c2', order: 2, icon: FaGithub},
    {categoryId: 3, categoryName: 'c3', order: 2, icon: FaGithub},
    {categoryId: 4, categoryName: 'c4', order: 2, icon: FaGithub},
    {categoryId: 5, categoryName: 'c5', order: 2, icon: FaGithub},
    {categoryId: 6, categoryName: 'c6', order: 2, icon: FaGithub},
    ]

    return (
        <Resize handleWidth="3px" handleColor = "#FF0000">
            <ResizeHorizon minWidth="150px" width="100px">
              <CategoryList
                currentId = {currentCategoryId}
                categoryList={categoryList}
                setCurrentId = {setCurrentCategoryId}
              />
            </ResizeHorizon>
            <ResizeHorizon minWidth="100px"><ItemList /></ResizeHorizon>
        </Resize>

    )


}
