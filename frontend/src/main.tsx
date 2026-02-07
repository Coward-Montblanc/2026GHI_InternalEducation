import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
//MUI를 사용하기 위한 리액트18버전
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);