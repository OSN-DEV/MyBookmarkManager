import React from "react"
import { IconBaseProps, IconManifestType, IconType } from "react-icons"

type CategoryProps = {
    icon: IconType
    id: number
    isSelected: boolean
    name: string
    handleClick: (id: number) => void
    onContextMenu: () => void
}

const Category = (props: CategoryProps) => {
    const {icon, id, isSelected, name, handleClick, onContextMenu} = props
    const RenderIcon = icon

    const handleContextmenu = (e: React.MouseEvent) => {
        e.stopPropagation()
        onContextMenu()
    }
    return (
        <div className="category-list-category" onClick={()=>handleClick(id)} onContextMenu={handleContextmenu}>
            <RenderIcon className="icon"/>
            { name }
        </div>
    )
}

export default Category
