import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PreviewBanner from './PreviewBanner.jsx'

// Entrada usada só pro build de prévia (npm run build:artifact), publicado como
// Artifact em claude.ai. Sem Service Worker/manifest — é uma prévia visual e
// funcional do app real, que roda instalado como PWA em produção (ver README).

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreviewBanner />
    <App />
  </StrictMode>,
)
