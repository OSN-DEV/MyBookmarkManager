import React from 'react'
import { IconType } from 'react-icons'

type CategoryProps = {
  id: number
  isSelected: boolean
  name: string
  handleClick: (id: number) => void
  onContextMenu: () => void
}

const Category = (props: CategoryProps) => {
  const { id, isSelected, name, handleClick, onContextMenu } = props
  if (isSelected) {
    console.log('selected')
  }
  const handleContextmenu = (e: React.MouseEvent) => {
    e.stopPropagation()
    onContextMenu()
  }
  return (
    <div className="category-list-category" onClick={() => handleClick(id)} onContextMenu={handleContextmenu}>
      {name}
    </div>
  )
}

export default Category
