import Item from './Item'
import { TItem } from '../../../@types/TItem'
import { useCategoryIdContext } from '../../context/CategoryIdContext'
import { devLog } from '../../../util/common'

type ItemListProps = {
  itemList: TItem[]
}

const ItemList = (props: ItemListProps): JSX.Element => {
  const { itemList } = props
  const { id: categoryId } = useCategoryIdContext()

  const handleContextMenu = (item: TItem | null): void => {
    console.log(`handleContextMenu: ${categoryId} - ${item}`)
    if (categoryId <= 0) {
      devLog(`category is not selected`)
      return
    }
    window.mainApi.showItemListContextMenu(categoryId, item)
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
