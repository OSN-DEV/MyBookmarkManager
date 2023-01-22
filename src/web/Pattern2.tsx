import React, { useState } from 'react'
import './Common.css'

const Pattern2 = () => {
  const [selectedPath, setSelectedPath] = useState("")
  const handleBtnClick = async() => {
    var result = await window.testApi.openFile();
    setSelectedPath(result ?? '');
  }

  return(
    <div className="pattern2">
      <p><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way" target="_blank" rel="noopener noreferrer">Pattern 2: Renderer to main (two-way)</a></p>
      <button id="btn" type="button" onClick={handleBtnClick}>Set</button>
      <p>{selectedPath}</p>
    </div>
  )
}

export default Pattern2