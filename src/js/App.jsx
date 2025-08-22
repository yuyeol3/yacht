import { useState } from 'react'
import GameView from './Game/GameView'
import { HashRouter, Route, Routes } from 'react-router-dom'
import GameEntryPoint from './Game/GameEntryPoint'
import "./layout.css"

function App() {

  return (
      <HashRouter>
      <div id="container">

        <Routes>
          <Route path="/" element={<GameEntryPoint/>}/>
          <Route path="/game" element={<GameView/>}/>
        </Routes>
        </div>
      </HashRouter>
  )
}

export default App
