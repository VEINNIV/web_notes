/**
 * main.jsx — Application entry point.
 *
 * Imports the global design system before React renders so tokens
 * are available to all components from the first paint.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { NotificationProvider } from './components/ui/NotificationProvider';
import ErrorBoundary from './components/ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
