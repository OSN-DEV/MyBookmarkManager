import { forwardRef } from 'react'

type EditTextProps = {
  title: string | null
}

/**
 * ラベル付入力項目
 */
export const EditTextArea = forwardRef<HTMLTextAreaElement, EditTextProps>((props, ref) => {
  const { title } = props

  /**
   * レンダリング
   */
  return (
    <div className="mt-1">
      {title && <label className="edit-caption">{title}</label>}
      <div>
        <textarea ref={ref} defaultValue="" className="edit-text-area" />
      </div>
    </div>
  )
})

EditTextArea.displayName = 'EditTextAreaComponent'
