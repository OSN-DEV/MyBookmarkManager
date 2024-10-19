import { devLog } from '../../../util/common'
import { TItem } from '../../../@types/TItem'

type ItemProps = {
  item: TItem
  handleContextMenu: (item: TItem | null) => void
}

const Item = (props: ItemProps): JSX.Element => {

  const { item, handleContextMenu } = props

  devLog(`Item : ${item == null ? '' :  JSON.stringify(item)}}`)
  const handleClickItem = (e: React.MouseEvent<HTMLSpanElement>, item: TItem | null, v: String): void => {
    devLog(`Item.handleClickItem: ${v}`)
    e.stopPropagation()
    handleContextMenu(item)
  }

  return (
    <div className="item-list-item" onContextMenu={(e) => handleClickItem(e, null, 'outer div')}>
      <div>
        <span onContextMenu={(e) => handleClickItem(e, item, 'item')}>■ {item.title}</span>
      </div>
      <div>
        <a href={item.url} target="_blank" rel="noopener noreferrer" onContextMenu={(e) => handleClickItem(e, item, 'url')}>
          {item.url}
        </a>
      </div>
      <div>
        <span onContextMenu={(e) => handleClickItem(e, item, 'explanation')}>{item.explanation}</span>
      </div>
    </div>
  )
}

export default Item
