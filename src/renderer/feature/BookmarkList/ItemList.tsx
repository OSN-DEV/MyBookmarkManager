import Item from './Item'
import { TItem } from '../../../@types/TItem'
import { devLog } from '../../../util/common'

type ItemListProps = {
  itemList: TItem[]
  handleContextMenu: (item: TItem | null) => void
}

const ItemList = (props: ItemListProps): JSX.Element => {
  const { itemList, handleContextMenu } = props

  const handleClickItem = (item: TItem | null): void => {
    devLog(`ItemList.handleClickItem`)
    handleContextMenu(item)
  }

  return (
    <div className="item-list" style={{ overflowY: 'auto' }}>
      {/* <div>CategoryId: {categoryId}</div> */}
      {itemList.map((item: TItem) => {
        return <Item handleContextMenu={(item) => handleClickItem(item)} key={item.id} item={item} />
      })}
    </div>
  )
}

export default ItemList
