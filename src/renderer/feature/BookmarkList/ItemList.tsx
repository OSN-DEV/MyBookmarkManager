import Item from './Item'
import { TItem } from '../../../@types/TItem'

type ItemListProps = {
  itemList: TItem[]
}

const ItemList = (props: ItemListProps): JSX.Element => {
  const { itemList } = props

  const handleContextMenu = (item: TItem | null): void => {
    console.log(`handleContextMenu: ${item}`)
    window.mainApi.showItemListContextMenu(item)
  }

  return (
    <div className="item-list" style={{ overflowY: 'auto' }} onContextMenu={() => handleContextMenu(null)}>
      {itemList.map((item: TItem) => {
        return <Item handleContextMenu={handleContextMenu} key={item.id} item={item} />
      })}
    </div>
  )
}

export default ItemList
