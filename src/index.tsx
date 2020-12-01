import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { PeerContextProvider } from './context';

ReactDOM.render(
  <PeerContextProvider>
    <App />
  </PeerContextProvider>,
  document.getElementById('root')
);
