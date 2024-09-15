import { useRef, useState } from 'react'
import { TCategory } from '../../@types/TCategory'
import { devLog } from '../../util/common'
import { EditText } from '../components/EditText'
import { TextButton } from '../components/TextButton'
import { IpcRendererEvent } from 'electron'

export const CategoryEdit = (): JSX.Element => {
  const [category, setCategory] = useState<TCategory | null>(null)
  const categoryNameRef = useRef<HTMLInputElement>(null)

  /**
   * ロードイベント
   */
  window.categoryApi.onLoad((_: IpcRendererEvent, category: TCategory | null) => {
    if (category == null) {
      devLog('create')
    } else {
      devLog('update')
      setCategory(category)
    }
  })

  /**
   * OKボタンクリック
   */
  const handleOkClick = (): void => {
    devLog(`handleOkClick: ${categoryNameRef.current?.value}`)
    if (category == null) {
      const category = { id: 0, name: categoryNameRef.current?.value ?? '', sort: 0 }
      window.categoryApi.create(category)
    }
  }

  /**
   * キャンセルボタンクリック
   */
  const handleCancelClick = (): void => {
    devLog(`handleCancelClick`)
    window.categoryApi.cancel()
  }

  /**
   * レンダリング
   */
  return (
    <form className="ml-5 mr-5">
      <EditText title="Category Name" ref={categoryNameRef} />
      <br />
      <div className="text-right">
        <TextButton onClick={handleOkClick}>OK</TextButton>
        <TextButton onClick={handleCancelClick}>Cancel</TextButton>
      </div>
    </form>
  )
}
