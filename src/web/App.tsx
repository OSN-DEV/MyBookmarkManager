import React from 'react';
import './App.css';
import Pattern1 from './Pattern1'
import Pattern2 from './Pattern2'
import Pattern3 from './Pattern3';

export const App = () => {
  return (
    <div className="container">
      <Pattern1 />
      <Pattern2 />
      <Pattern3 />
    </div>
  );
};