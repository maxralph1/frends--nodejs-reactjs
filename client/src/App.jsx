// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './features/Home'

function App() {
  return (
      <Routes>
        <Route>
          <Route index element={<Home />} />
        </Route>
      </Routes>
  )
}

export default App
