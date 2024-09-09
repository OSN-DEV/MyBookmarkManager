import { forwardRef } from 'react'

type EditTextProps = {
  title: string | null
}

/**
 * ラベル付入力項目
 */
export const EditText = forwardRef<HTMLInputElement, EditTextProps>((props, ref) => {
  const { title } = props

  /**
   * レンダリング
   */
  return (
    <div className="mt-1">
      {title && <label className="category-edit-caption">{title}</label>}
      <div>
        <input type="text" ref={ref} className="category-edit-input" defaultValue="hogehoge!" />
      </div>
    </div>
  )
})

EditText.displayName = 'EditTextComponent'
