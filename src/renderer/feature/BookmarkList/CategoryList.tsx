import { TCategory } from '../../../@types/TCategory'
import Category from './Category'

type CategoryListProps = {
  currentId: number
  categoryList: TCategory[]
  setCurrentId: (id: number) => void
}
const CategoryList = (props: CategoryListProps): JSX.Element => {
  const { currentId, categoryList, setCurrentId } = props

  ///
  /// カテゴリ選択イベント
  ///
  const handleClick = (categoryId: number): void => {
    if (currentId == categoryId) {
      return
    }
    setCurrentId(categoryId)
  }

  const handleContextMenu = (category: TCategory | null): void => {
    console.log(`handleContextMenu: ${category}`)
    window.mainApi.showCategoryListContextMenu(category)
  }

  return (
    <div className="category-list" onContextMenu={() => handleContextMenu(null)}>
      {categoryList.map((category: TCategory) => {
        return (
          <Category
            key={`category-${category.id}`}
            id={category.id}
            isSelected={category.id === currentId}
            name={category.name}
            handleClick={handleClick}
            onContextMenu={() => handleContextMenu(category)}
          />
        )
      })}
    </div>
  )
}
export default CategoryList
