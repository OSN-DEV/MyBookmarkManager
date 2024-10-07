import { RefObject, useRef, useState } from 'react'
import { devLog } from '../../util/common'
import { EditText } from '../components/EditText'
import { TextButton } from '../components/TextButton'
import { IpcRendererEvent } from 'electron'
import { EditTextArea } from '../components/EditTextArea'
import { initialItem, TItem } from '../../@types/TItem'
// ref
// https://qiita.com/nuko-suke/items/1393995fd53ecaeb1cbc

export const ItemEdit = (): JSX.Element => {
  devLog(`ItemEdit`)
  const [item, setItem] = useState<TItem | null>(null)
  const [categoryId, setCategoryId] = useState<number>(0)

  // 入力項目への参照
  const refs = {
    title: useRef<HTMLInputElement>(null),
    url: useRef<HTMLInputElement>(null),
    explanation: useRef<HTMLTextAreaElement>(null),
    note: useRef<HTMLTextAreaElement>(null)
  }

  const setValue = (ref: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>, value: string): void => {
    if (ref && ref.current) {
      ref.current.value = value
    }
  }
  const getValue = (ref: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>): string => {
    if (ref && ref.current) {
      return ref.current.value
    } else {
      return ''
    }
  }

  /**
   * ロードイベント
   */
  window.itemApi.onLoad((_: IpcRendererEvent, categoryId: number, item: TItem | null) => {
    devLog(`window.itemApi.onLoad`)
    devLog(`categoryId: ${categoryId}`)
    setCategoryId(categoryId)
    if (item == null || item.id == null) {
      devLog('window.itemApi.onLoad:create')
    } else {
      devLog('window.itemApi.onLoad:update')
      setValue(refs.title, item.title)
      setValue(refs.url, item.url)
      setValue(refs.explanation, item.explanation)
      setValue(refs.note, item.note)
      setItem(item)
    }
  })

  /**
   * OKボタンクリック
   */
  const handleOkClick = (): void => {
    devLog(`handleOkClick: ${categoryId}`)
    const newItem: TItem = item ? { ...item } : { ...initialItem }
    newItem.categoryId = categoryId
    newItem.title = getValue(refs.title)
    newItem.url = getValue(refs.url)
    newItem.explanation = getValue(refs.explanation)
    newItem.note = getValue(refs.note)
    window.itemApi.create(newItem)
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
    <>
      <EditText title="Title" ref={refs.title} />
      <EditText title="Url" ref={refs.url} />
      <EditTextArea title="Explanation" ref={refs.explanation} />
      <EditTextArea title="Note" ref={refs.note} />
      <br />
      <div className="text-right">
        <TextButton onClick={handleOkClick}>OK</TextButton>
        <TextButton onClick={handleCancelClick}>Cancel</TextButton>
      </div>
    </>
  )
}
