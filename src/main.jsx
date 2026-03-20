import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import OperatorPortal from './OperatorPortal.jsx'

const params = new URLSearchParams(window.location.search)
const isOperatorPortal = params.get('portal') === 'operario'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isOperatorPortal ? <OperatorPortal /> : <App />}
  </StrictMode>,
)
