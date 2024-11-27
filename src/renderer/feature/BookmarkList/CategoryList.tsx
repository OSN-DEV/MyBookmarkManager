import { TCategory } from '../../../@types/TCategory'
import Category from './Category'
import { useCategoryIdContext } from '../../../renderer/context/CategoryIdContext'
import { devLog } from '../../../util/common'
import { useState, useRef } from 'react'

// ドラッグ・ドロップのサンプル
// https://codesandbox.io/p/sandbox/awesome-cloud-beis86?file=%2Fsrc%2FDraggable.tsx&from-embed

type CategoryListProps = {
  categoryList: TCategory[]
  currentCategoryIdChanged: (categoryId: number) => void
}
const CategoryList = (props: CategoryListProps): JSX.Element => {
  devLog(`CategoryList enter`)
  const { categoryList, currentCategoryIdChanged } = props
  const { id: currentId, setId } = useCategoryIdContext()
  const [dropTargetIndex, setDropTargetIndex] = useState<number>(-1)
  const dragItemRef = useRef<Map<number, HTMLElement>>(new Map())

  /**
   * カテゴリ選択
   * @param categoryId カテゴリID
   */
  const handleClick = (categoryId: number): void => {
    devLog(`handleClick: categoryId=${categoryId}`)
    if (currentId == categoryId) {
      devLog(`same category id`)
      return
    }
    setId(categoryId)
    currentCategoryIdChanged(categoryId)
  }

  const setElement = (index: number) => (elm: HTMLElement | null) => {
    devLog(`setElement: ${index}`)
    if (elm == null) {
      devLog(`nulL!!`)
    }
    if (elm) {
      dragItemRef.current.set(index, elm)
    } else {
      dragItemRef.current.delete(index)
    }
  }

  /**
   * ドラッグ開始
   */
  const handleDragStart =
    (index: number, categoryId: number) =>
    (ev: React.DragEvent<HTMLDivElement>): void => {
      // const handleDragStart = (index: number, categoryId: number): void => {
      devLog(`handleDragStart index:${index} categoryId:${categoryId}`)
      setDropTargetIndex(index)

      ev.dataTransfer.setData('text/plain', JSON.stringify(categoryList[index]))
      ev.dataTransfer.dropEffect = 'move'     // copy, move, link, none,
      ev.dataTransfer.effectAllowed = 'move'  // none, copy, copyLink, copyMove, link, linkMove, all
    }

  const handleDragOver =
    (targetIndex: number) =>
    (ev: React.DragEvent<HTMLDivElement>): void => {
      // devLog(`handleDragOver: targetIndex=${targetIndex}`)
      ev.preventDefault()

      
      
      const elm = dragItemRef.current.get(targetIndex)
      if (!elm) {
  
        devLog(`no element: ${JSON.stringify(dragItemRef.current)}`);
        return
      }

      // rectはドラッグオーバーの対象となっているエレメント
      const rect = elm.getBoundingClientRect()
      // ev.clientYはrectの範囲内にあるのでposYは必ず正の数になるはず
      const posY = ev.clientY - rect.top
      // マウスの位置が対象となっているエレメントの何％の位置にあるのかを算出。Math.minを設けているのは念の為、なんだと思われる。。
      const rationY = Math.min(1, Math.max(0, posY / rect.height)) 
      // Math.roundで四捨五入しているので、ターゲットの半分より上であれば0、そうでなければ1して、ドロップした際のターゲットをどちらにするのかを決めるイメージ
      // (半分より上であればターゲットアイテムの上、そうでなければ下)
      setDropTargetIndex(targetIndex + Math.round(rationY))
    }

  const handleDragEnd = 
  (dragIndex: number) =>
  (ev: React.DragEvent<HTMLDivElement>): void => {
    devLog(`handleDragEnd dragIndex=${dragIndex}`)
    // const currentIndex = categoryList.findIndex((category) => {
    //   return category.id === dragIndex
    // })
    // if (currentIndex  >= 0 &&  dropTargetIndex >= 0) {
    if (0 <= dropTargetIndex) {
      devLog(`dragIndex=${dragIndex}, dropTargetIndex=${dropTargetIndex}`)
      const newItem = moveItem(categoryList, dragIndex, dropTargetIndex)
      devLog(`newItem: ${JSON.stringify(newItem)}`)
      // カテゴリリストを更新
      window.categoryApi.updateOrder(newItem)
    }
    setDropTargetIndex(-1)
  }

  function moveItem<T = any>(arr: T[], currentIndex: number, targetIndex: number) {
    const targetItem = arr[currentIndex]
    let resArr = arr.map((target, i) => (i === currentIndex ? null : target))
    resArr.splice(targetIndex, 0, targetItem)
    return resArr.flatMap((target) => (target !== null ? [target] : []))
  }

  const handleDragEnter =
    (index: number) =>
    (ev: React.DragEvent<HTMLDivElement>): void => {
      // devLog(`handleDragEnter index:${index}`)
      ev.preventDefault()
    }
  const handleDragLeave = (ev: React.DragEvent<HTMLDivElement>): void => {
    // devLog(`handleDragLeave`)
    ev.preventDefault()
  }

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>): void => {
    // devLog(`handleDrop`)
    ev.preventDefault()
  }

  /**
   * コンテキストメニュー
   */
  const handleContextMenu = (category: TCategory | null): void => {
    console.log(`handleContextMenu: ${category == null ? '' : JSON.stringify(category)}`)
    window.mainApi.showCategoryListContextMenu(category)
  }

  return (
    <div className="category-list" onContextMenu={() => handleContextMenu(null)}>
      {categoryList.map((category: TCategory, index: number) => {
        return (
          <Category
            key={`category-${category.id}`}
            setElement={setElement(index)}
            id={category.id}
            isSelected={category.id === currentId}
            name={category.name}
            handleDragStart={handleDragStart(index, category.id)}
            handleDragEnd={handleDragEnd(index)}
            handleDragOver={handleDragOver(index)}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDragEnter={() => handleDragEnter(index)}
            handleClick={handleClick}
            onContextMenu={() => handleContextMenu(category)}
          />
        )
      })}
    </div>
  )
}
export default CategoryList
