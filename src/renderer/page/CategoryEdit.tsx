import { TCategory } from '../../@types/TCategory'
import { devLog } from '../../util/common'
import { EditText } from '../components/EditText'
import { TextButton } from '../components/TextButton'

export const CategoryEdit = (): JSX.Element => {
  window.categoryApi.onLoad((_: any, category: TCategory | null) => {
    alert('OKOKOK')
  })

  /**
   * OKボタンクリック
   */
  const handleOkClick = (): void => {
    devLog(`handleOkClick`)
  }

  /**
   * キャンセルボタンクリック
   */
  const handleCancelClick = (): void => {
    devLog(`handleCancelClick`)
  }

  /**
   * レンダリング
   */
  return (
    <form className="ml-5 mr-5">
      <EditText title="Category Name" />
      <br />
      <div className="text-right">
        <TextButton onClick={handleOkClick}>OK</TextButton>
        <TextButton onClick={handleCancelClick}>Cancel</TextButton>
      </div>
    </form>
  )
}
