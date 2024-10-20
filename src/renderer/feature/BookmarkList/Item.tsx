import { devLog } from '../../../util/common'
import { TItem } from '../../../@types/TItem'

type ItemProps = {
  item: TItem
  handleContextMenu: (item: TItem | null) => void
}

const Item = (props: ItemProps): JSX.Element => {
  const { item, handleContextMenu } = props

  devLog(`Item : ${item == null ? '' :  JSON.stringify(item)}}`)
  const onContextMenu = (e: React.MouseEvent<HTMLSpanElement>, item: TItem | null, v: string): void => {
    devLog(`Item.handleClickItem: ${v}`)
    e.stopPropagation()
    handleContextMenu(item)
  }

  const onDoubleClick = (path: string): void => {
    devLog(`onDoubleClick: ${path}`)
    window.mainApi.launchItem(path)
  }

  return (
    <div className="item-list-item" onContextMenu={(e) => onContextMenu(e, null, 'outer div')}>
      <div>
        <span onContextMenu={(e) => onContextMenu(e, item, 'item')} onDoubleClick={() => onDoubleClick(item.url)} >■ {item.title}</span>
      </div>
      <div>
        {/*
        <a href={item.url} target="_blank" rel="noopener noreferrer" onContextMenu={(e) => onContextMenu(e, item, 'url')}  onDoubleClick={() => onDoubleClick(item.title)}>
          {item.url}
        </a>
        */}
        <span onContextMenu={(e) => onContextMenu(e, item, 'url')} onDoubleClick={() => onDoubleClick(item.url)}>
          {item.url}
        </span>
      </div>
      <div>
        <span onContextMenu={(e) => onContextMenu(e, item, 'explanation')}>{item.explanation}</span>
      </div>
    </div>
  )
}

export default Item
