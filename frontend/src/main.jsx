import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './responsive-enhancements.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { FinanceProvider } from './context/FinanceContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
