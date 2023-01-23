import React from 'react';
// import './App.css';      ここと次の行の差し替えで、output.cssがApp.cssとして出力される
import './styles/output.css';
import Pattern1 from './Pattern1'
import Pattern2 from './Pattern2'
import Pattern3 from './Pattern3';

export const App = () => {
  return (
    <div className="container">
<div className="flex">
  <div className="bg-green-100 px-2">1</div>
  <div className="bg-green-100 px-2 ml-1">2</div>
  <div className="bg-green-100 px-2 ml-1">3</div>
</div>

    </div>
  );
};