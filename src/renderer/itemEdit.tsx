import React from 'react'
import ReactDOM from 'react-dom/client'
import './input.css'
import { ItemEdit } from './page/ItemEdit'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ItemEdit />
  </React.StrictMode>
)
