import { TItem } from '../../../@types/TItem'

type ItemProps = {
  item: TItem
}

const Item = (props: ItemProps) => {
  const { item } = props

  return (
    <div className="item-list-item">
      <div>■ {item.itemName}</div>
      <div>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.url}
        </a>
      </div>
      <div>{item.explanation}</div>
    </div>
  )
}

export default Item
