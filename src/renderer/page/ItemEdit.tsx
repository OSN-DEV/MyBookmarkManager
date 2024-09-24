import { useRef, useState } from 'react'
import { devLog } from '../../util/common'
import { EditText } from '../components/EditText'
import { TextButton } from '../components/TextButton'
import { IpcRendererEvent } from 'electron'
import { TItem } from 'src/@types/TItem'
import { EditTextArea } from '../components/EditTextArea'

export const ItemEdit = (): JSX.Element => {
  const [item, setItem] = useState<TItem | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const explanationRef = useRef<HTMLTextAreaElement>(null)

  /**
   * ロードイベント
   */
  window.itemApi.onLoad((_: IpcRendererEvent, item: TItem | null) => {
    if (item == null || item.id == null) {
      devLog('window.itemApi.onLoad:create')
    } else {
      devLog('window.itemApi.onLoad:update')
      setItem(item)
      if (nameRef && nameRef.current) {
        nameRef.current.value = item.name
      }
      if (urlRef && urlRef.current) {
        urlRef.current.value = item.url
      }
      if (explanationRef && explanationRef.current) {
        explanationRef.current.value = item.explanation
      }
    }
  })

  /**
   * OKボタンクリック
   */
  const handleOkClick = (): void => {
    devLog(`handleOkClick: ${nameRef.current?.value}`)
    if (item == null) {
      const newItem: TItem = {
        id: 0, name: nameRef.current?.value ?? '', sort: 0, url: urlRef?.current?.value ?? '', categoryId: 0,
        explanation: explanationRef?.current?.value ?? ''
      }
      window.itemApi.create(newItem)
    } else {
      window.itemApi.update({ ...item, name: nameRef.current?.value ?? '',url: urlRef?.current?.value ?? '', explanation: explanationRef.current?.value ?? ''})
    }
  }

  /**
   * キャンセルボタンクリック
   */
  const handleCancelClick = (): void => {
    devLog(`handleCancelClick`)
    window.itemApi.cancel()
  }

  /**
   * レンダリング
   */
  return (
    <form className="ml-5 mr-5">
      <EditText title="Title" ref={nameRef} />
      <EditText title="Name" ref={urlRef} />
      <EditTextArea title="Explanation" ref={explanationRef} />
      <br />
      <div className="text-right">
        <TextButton onClick={handleOkClick}>OK</TextButton>
        <TextButton onClick={handleCancelClick}>Cancel</TextButton>
      </div>
    </form>
  )
}
