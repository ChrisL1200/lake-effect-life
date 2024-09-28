import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/app/App.tsx'
import { Provider } from 'react-redux';
import './index.css'
import { ThemeProvider } from "@material-tailwind/react";
import { store } from './store/index.ts';


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <Provider store={store}>
                <App />
            </Provider>
         </ThemeProvider>
  </React.StrictMode>,
)
