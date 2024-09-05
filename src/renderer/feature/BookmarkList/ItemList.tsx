import React from 'react'
import Item from './Item'
import { TItem } from '../../../@types/TItem'

type ItemListProps = {
  itemList: TItem[]
}

const ItemList = (props: ItemListProps) => {
  const { itemList } = props

  return (
    <div className="item-list" style={{ overflowY: 'auto' }}>
      {itemList.map((item: TItem) => {
        return <Item key={item.itemId} item={item} />
      })}
    </div>
  )
}

export default ItemList
