import { devLog } from '../../../util/common'
import { TItem } from '../../../@types/TItem'

type ItemProps = {
  item: TItem
  handleContextMenu: (item: TItem | null) => void
}

const Item = (props: ItemProps): JSX.Element => {
  const { item, handleContextMenu } = props

  const handleClickItem = (e: React.MouseEvent<HTMLSpanElement>, item: TItem): void => {
    devLog(`handleClickItem`)
    e.stopPropagation()
    handleContextMenu(item)
  }

  return (
    <div className="item-list-item" onContextMenu={() => handleContextMenu(null)}>
      <div>
        <span onContextMenu={(e) => handleClickItem(e, item)}>■ {item.name}</span>
      </div>
      <div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.url}
        </a>
      </div>
      <div>
        <span onContextMenu={(e) => handleClickItem(e, item)}>{item.explanation}</span>
      </div>
    </div>
  )
}

export default Item
