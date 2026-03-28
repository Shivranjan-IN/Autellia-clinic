import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

console.log("🚀 main.tsx: Script loading (TS: 1774712100)");

try {
  const rootElement = document.getElementById('root');
  console.log("🚀 main.tsx: Root element found:", !!rootElement);
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    )
    console.log("🚀 main.tsx: ReactDOM.createRoot.render called");
  } else {
    console.error("❌ main.tsx: Root element NOT found!");
  }
} catch (err) {
  console.error("❌ main.tsx: Render error:", err);
}
