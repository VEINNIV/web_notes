/**
 * main.jsx — Application entry point.
 *
 * Imports the global design system before React renders so tokens
 * are available to all components from the first paint.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Design system must be first — defines CSS tokens used everywhere
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
