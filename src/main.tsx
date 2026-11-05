import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './app/providers/AppErrorBoundary.tsx'
import { QueryProvider } from './app/providers/QueryProvider.tsx'
import { AuthProvider } from './features/auth/model/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary><QueryProvider><AuthProvider><BrowserRouter><App /></BrowserRouter></AuthProvider></QueryProvider></AppErrorBoundary>
  </StrictMode>,
)
