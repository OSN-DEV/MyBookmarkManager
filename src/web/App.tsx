import React from 'react';
// import './App.css';      ここと次の行の差し替えで、output.cssがApp.cssとして出力される
import './styles/output.css';
import Pattern1 from './Pattern1'
import Pattern2 from './Pattern2'
import Pattern3 from './Pattern3';
import MainCategory from './Component/MainCategory/MainCategory';

const json  = `
[
    {
        "category__id": 1,
        "category_name": "Category1",
        "items": [
            {
                "item_id": 1,
                "item_name": "item1",
                "desc": "desc",
                "user": "user",
                "pwd": "123",
                "any": [
                    "a",
                    "b",
                    "c"
                ]
            }
        ]
    }
]
`;

let dummyData =  JSON.parse(json);




export const App = () => {
  return (
    <div className="container">
      <MainCategory />
    </div>
  );
};