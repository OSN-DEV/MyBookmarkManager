import React from 'react'
import ReactDOM from 'react-dom/client'
import { BookmarkList } from './page/BookmarkList'
import './input.css'
// import { CategoryEdit } from './page/CategoryEdit'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BookmarkList />
    {/* <CategoryEdit /> */}
  </React.StrictMode>
)
