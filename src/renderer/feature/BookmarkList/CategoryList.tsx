import { TCategory } from '../../../@types/TCategory'
import Category from './Category'
import { useCategoryIdContext } from '../../../renderer/context/CategoryIdContext'

type CategoryListProps = {
  categoryList: TCategory[]
}
const CategoryList = (props: CategoryListProps): JSX.Element => {
  const { categoryList } = props
  const {id: currentId, setId} = useCategoryIdContext()

  ///
  /// カテゴリ選択イベント
  ///
  const handleClick = (categoryId: number): void => {
    if (currentId == categoryId) {
      return
    }
    setId(categoryId)
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
