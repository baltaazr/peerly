import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { PeerContextProvider } from './context';
import 'antd/dist/antd.css';
import './index.css';

ReactDOM.render(
  <PeerContextProvider>
    <App />
  </PeerContextProvider>,
  document.getElementById('root')
);
