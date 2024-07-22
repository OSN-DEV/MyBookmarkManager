import React from 'react'


const App  = () => {
  const pattern1Click = () => {
    (window as any).mainApi.setTitle("title!!")
  }

  const pattern2Click = async() => {
    (window as any).mainApi.ping()
    const path = await window.mainApi.openFile()
    document.getElementById("filePath")!!.innerText = path
  }
  
  window.mainApi.onUpdateCounter((_: any, value: number) => {
    const counter = document.getElementById("counter")
    const oldValue = Number(counter?.innerText)
    const newValue = oldValue + value
    counter!.innerText  = newValue.toString()
    window.mainApi.counterValue(newValue)
  })
  

  return(
    <>
      <h3><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-1-renderer-to-main-one-way" target="_blank" rel="noreferrer noopener">Pattern 1: Renderer to main (one-way)</a></h3>
        title: <input id="pattern1" /><button id="btn" type="button" onClick={pattern1Click}>set</button>
      <hr/>
      <h3><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way" target="_blank" rel="noreferrer noopener">Pattern 2: Renderer to main (two-way)</a></h3>
      File path: <strong id="filePath"></strong><button id="btn" type="button" onClick={pattern2Click}>set</button>
      <hr/>
      <h3><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-3-main-to-renderer" target="_blank" rel="noreferrer noopener">Pattern 3: Main to renderer</a></h3>
      Current value: <strong id="counter">0</strong>
    </>
  )
}

export default App
