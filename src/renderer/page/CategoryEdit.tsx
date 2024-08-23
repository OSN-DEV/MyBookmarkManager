import { devLog } from "../../util/common"
import { EditText } from "../components/EditText"
import { TextButton } from "../components/TextButton"

export const CategoryEdit = () => {
    /**
     * OKボタンクリック
     */
    const handleOkClick = () => {
        devLog(`handleOkClick`)
    }

    /**
     * キャンセルボタンクリック
     */
    const handleCancelClick = () => {
        devLog(`handleCancelClick`)
    }

    /**
     * レンダリング
     */
    return(
        <form className="ml-5 mr-5">
            <EditText title="Category Name"/>
            <br/>
            <div className="text-right">
            <TextButton onClick={handleOkClick}>OK</TextButton>
            <TextButton onClick={handleCancelClick}>Cancel</TextButton>
            </div>
        </form>
    )
}