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

  /**
   * コンテキストメニュー表示イベント
   */
  const handleContextmenu = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onContextMenu()
  }



  const styles = isSelected
    ? 'cursor-auto font-bold underline'
    : 'cursor-pointer font-normal'

  // const styleList: string[] = ['text-gray-500', 'text-[14pt]', 'p-1', styles ?? '']
  // return (
  //   <>
  //     <button type="button" onClick={onClick} className={styleList.join(' ').trim()}>
  // const styles = [
  //   isSelected ? 'font-bold' : ''
  // ]

  return (
    <div className="category-list-category" onClick={() => handleClick(id)} onContextMenu={handleContextmenu}>
      <span className={styles}>{name}</span>
    </div>
  )
}

export default Category
