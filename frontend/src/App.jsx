import React from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom'

import './App.css'

function App() {
 

  return (
    <> 
      <BrowserRouter>
        <Header />
        <Routes>
          
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App
