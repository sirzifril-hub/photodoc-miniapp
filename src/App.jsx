import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import DocumentPicker from './pages/DocumentPicker'
import Camera from './pages/Camera'
import Result from './pages/Result'
import Success from './pages/Success'

export default function App() {
  useEffect(() => {
    try {
      const WebApp = window.Telegram?.WebApp
      if (WebApp && typeof WebApp.ready === 'function') {
        WebApp.ready()
        WebApp.expand()
      }
    } catch (e) {
      console.log('Not in Telegram:', e)
    }
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/docs" element={<DocumentPicker />} />
      <Route path="/camera" element={<Camera />} />
      <Route path="/result" element={<Result />} />
      <Route path="/success" element={<Success />} />
    </Routes>
  )
}