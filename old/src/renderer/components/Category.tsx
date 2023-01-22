import React from "react";

export type ICategory = {
  id: string;
  name: string;
  order: number;
  // children: React.ReactNode;
}


const Category = ({category} : {category: ICategory}) => {
  let x = category.name;
  return (
    <>
    <p>Category</p>
    <p>{category.name}</p>
    </>
  )
}

export default Category
