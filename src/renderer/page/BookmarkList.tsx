import React from 'react'
import { Resize, ResizeHorizon } from 'react-resize-layout'
import CategoryList from '../feature/BookmarkList/CategoryList'
import ItemList from '../feature/BookmarkList/ItemList'

export const BookmarkList = () => {

    return (
        <Resize handleWidth="3px" handleColor = "#FF0000">
            <ResizeHorizon minWidth="100px" width="100px"><CategoryList /></ResizeHorizon>
            <ResizeHorizon minWidth="100px"><ItemList /></ResizeHorizon>
        </Resize>

    )


}
