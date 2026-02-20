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

//<react.StrictMode>가 조회수+2의 원인입니다.
//부작용을 관리하기위해 한번씩 더 마운트/언마운트 하고있기에 조회수+2가 되는 현상이 발생하고있습니다.
//두 줄을 주석처리하면 정상적으로 조회수 +1이 됩니다.