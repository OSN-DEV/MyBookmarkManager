import React, { forwardRef, useEffect, useRef } from 'react'
import { devLog } from '../../../util/common'

type CategoryProps = {
  id: number
  isSelected: boolean
  name: string
  setElement: (elm: HTMLElement | null) => void
  handleClick: (id: number) => void
  handleDragStart: (ev: React.DragEvent<HTMLDivElement>) => void
  handleDragEnd: (ev: React.DragEvent<HTMLDivElement>) => void
  handleDragOver: (ev: React.DragEvent<HTMLDivElement>) => void
  handleDragEnter: (ev: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: (ev: React.DragEvent<HTMLDivElement>) => void
  handleDrop: (ev: React.DragEvent<HTMLDivElement>) => void
  onContextMenu: () => void
}

const Category = forwardRef<HTMLElement, CategoryProps>((props, ref): JSX.Element => {
  const {
    id,
    isSelected,
    name,
    handleClick,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    onContextMenu,
    setElement
  } = props

  /**
   * コンテキストメニュー表示イベント
   */
  const handleContextmenu = (e: React.MouseEvent): void => {
    e.stopPropagation()
    onContextMenu()
  }

  const styles = isSelected ? 'cursor-auto font-bold underline' : 'cursor-pointer font-normal'
  const localRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setElement(localRef.current)
  })
  return (
    <div
      style={{border:'solid 1px gray'}}
      ref={localRef}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
      onDrop={handleDrop}
      className="category-list-category"
      onClick={() => handleClick(id)}
      onContextMenu={handleContextmenu}
    >
      <span className={styles}>{name}</span>
    </div>
  )
})
Category.displayName = 'Category'
export default Category
