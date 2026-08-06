import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './styles/design-system.css';
import './styles/components.css';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Suspense fallback={
        <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',flexDirection:'column',gap:16,color:'var(--stone)',fontFamily:'var(--font-body)' }}>
          <div style={{ width:36,height:36,border:'3px solid var(--sand)',borderTopColor:'var(--forest)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }} />
          <span>Loading…</span>
        </div>
      }>
        <App />
      </Suspense>
    </HelmetProvider>
  </React.StrictMode>
);
