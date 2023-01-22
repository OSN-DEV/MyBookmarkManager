import React, { useState } from 'react'
import './Common.css'

const Pattern1 = () => {
  const [text, setText] = useState("")
  const handleBtnClick = () => {
    window.testApi.setTitle(text)
  }
  const handleTextChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return(
    <div className="pattern1">
      <p><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-1-renderer-to-main-one-way" target="_blank" rel="noopener noreferrer">Pattern 1: Renderer to main (one-way)</a></p>
      <button id="btn" type="button" onClick={handleBtnClick}>Set</button>
      <input type="text" value={text} onChange={handleTextChange} />
    </div>
  )
}

export default Pattern1