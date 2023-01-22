import React, { useEffect, useState } from 'react'
import './Common.css'

const Pattern3 = () => {
  const [count, setCount] = useState(0);
  window.testApi.handleCounter((ev: any, num: number) => {
    const newValue = count + num;
    setCount(newValue);
    ev.sender.send('counter-value', newValue);
  })

  return(
    <div className="pattern3">
      <p><a href="https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-3-main-to-renderer">Pattern 3: Main to renderer</a></p>
      <p>Current value: <strong id="counter">{count}</strong></p>
    </div>
  )
}

export default Pattern3