
type EditTextProps = {
    title: string | null
}

export const EditText = (props: EditTextProps) => {
    const { title } = props

    /**
     * レンダリング
     */
    return (
        <div className="mt-1">
            {title && <label className="category-edit-caption">{title}</label>}
            <div>
            <input  type="text" className="category-edit-input" defaultValue="hogehoge!"/>
            </div>
        </div>
    )
}