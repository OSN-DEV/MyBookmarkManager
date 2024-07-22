import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { MainList } from './page/MainList'
import './input.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MainList />
  </React.StrictMode>
)
