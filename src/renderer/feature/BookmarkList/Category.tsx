import React from "react"
import { IconBaseProps, IconManifestType, IconType } from "react-icons"

type CategoryProps = {
    icon: IconType
    id: number
    isSelected: boolean
    name: string
    handleClick: (id: number) => void
}

const Category = (props: CategoryProps) => {
    const {icon, id, isSelected, name, handleClick} = props
    const RenderIcon = icon
    return (
        <div className="category-list-category" onClick={()=>handleClick(id)}>
            <RenderIcon className="icon"/>
            { name }
        </div>
    )
}

export default Category
