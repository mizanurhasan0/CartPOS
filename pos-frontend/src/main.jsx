import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './store/Store/store.js'
import Toast from './lib/Toaster/Toast.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GlobalProvider } from './Context/GlobalProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <GlobalProvider>
      <BrowserRouter>
        <App />
        <Toast />
      </BrowserRouter>
    </GlobalProvider>
  </Provider>
)
