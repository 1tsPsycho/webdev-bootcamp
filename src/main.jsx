import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AppDataProvider, useAppData } from './state/AppDataContext.jsx'

function ThemeIntensitySync() {
  const { settings } = useAppData();
  useEffect(() => {
    document.documentElement.setAttribute('data-intensity', settings.themeIntensity);
  }, [settings.themeIntensity]);
  return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppDataProvider>
        <ThemeIntensitySync />
        <App />
      </AppDataProvider>
    </BrowserRouter>
  </StrictMode>,
)
