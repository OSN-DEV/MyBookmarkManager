import { useRef, useState } from 'react'
import { devLog } from '../../util/common'
import { EditText } from '../components/EditText'
import { TextButton } from '../components/TextButton'
import { IpcRendererEvent } from 'electron'
import { TItem } from 'src/@types/TItem'

export const ItemEdit = (): JSX.Element => {
  const [item, setItem] = useState<TItem | null>(null)
  const categoryNameRef = useRef<HTMLInputElement>(null)

  /**
   * ロードイベント
   */
  window.itemApi.onLoad((_: IpcRendererEvent, item: TItem | null) => {
    if (item == null) {
      devLog('window.itemApi.onLoad:create')
    } else {
      devLog('window.itemApi.onLoad:update')
      setItem(item)
      if (categoryNameRef && categoryNameRef.current) {
        categoryNameRef.current.value = item.name
      }
    }
  })

  /**
   * OKボタンクリック
   */
  const handleOkClick = (): void => {
    devLog(`handleOkClick: ${categoryNameRef.current?.value}`)
    if (item == null) {
      const category = { id: 0, name: categoryNameRef.current?.value ?? '', sort: 0 }
      window.categoryApi.create(category)
    } else {
      window.categoryApi.update({ ...item, name: categoryNameRef.current?.value ?? '' })
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
