import React from 'react'
import { TCategory } from '../../../@types/TCategory'
import Category from './Category'

type CategoryListProps = {
  currentId: number
  categoryList: TCategory[]
  setCurrentId: (id: number) => void
}
const CategoryList = (props: CategoryListProps) => {
  const { currentId, categoryList, setCurrentId } = props
  // const [isOpenContextMenu, setIsContextMenu] = useState<boolean>(false)

  ///
  /// カテゴリ選択イベント
  ///
  const handleClick = (categoryId: number) => {
    if (currentId == categoryId) {
      return
    }
    setCurrentId(categoryId)
  }

  const handleContextMenu = (categoryId: number | null) => {
    console.log(`handleContextMenu: ${categoryId}`)
    // (window as any).mainApi.setTitle("title!!")
    // window.mainApi.showCategoryListContextMenu(1)

    // (window as any).mainApi.showCategoryListContextMenu(categoryId)
    window.mainApi.showCategoryListContextMenu(categoryId)
  }

  return (
    <div className="category-list" onContextMenu={() => handleContextMenu(null)}>
      {categoryList.map((category: TCategory) => {
        return (
          <Category
            key={`category-${category.categoryId}`}
            icon={category.icon}
            id={category.categoryId}
            isSelected={category.categoryId === currentId}
            name={category.categoryName}
            handleClick={handleClick}
            onContextMenu={() => handleContextMenu(category.categoryId)}
          />
        )
      })}
    </div>
  )
}
export default CategoryList
