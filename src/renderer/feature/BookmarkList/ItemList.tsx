import React from "react"
import { TItem } from "../../../type/Titem"
import Item from "./Item"

type ItemListProps = {
    itemList: TItem[]
}

const ItemList = (props: ItemListProps) => {
    const {itemList} = props

    return (
        <div className="item-list"  style={{ overflowY: 'auto' }}>
            {
                itemList.map((item:TItem) => {
                    return(
                        <Item key={item.categoryId} item={item} />
                    )
                })
            }
        </div>
    )
}

export default ItemList
