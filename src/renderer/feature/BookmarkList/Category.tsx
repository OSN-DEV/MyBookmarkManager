import React from 'react'

type CategoryProps = {
  id: number
  isSelected: boolean
  name: string
  handleClick: (id: number) => void
  onContextMenu: () => void
}

const Category = (props: CategoryProps): JSX.Element => {
  const { id, isSelected, name, handleClick, onContextMenu } = props
  if (isSelected) {
    console.log('selected')
  }
  const handleContextmenu = (e: React.MouseEvent): void => {
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
