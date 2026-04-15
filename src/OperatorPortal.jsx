import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import './OperatorPortal.css'
import { orderService } from './services/orderService'

const PackingDistribution = lazy(() => import('./PackingDistribution'))

function OperatorPortal() {
  // Flujo: 'login' → 'orders' → 'packing'
  const [view, setView] = useState('login')
  const [operatorCode, setOperatorCode] = useState('')
  const [loggedOperator, setLoggedOperator] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const inputRef = useRef(null)

  // Focus en el input al montar login
  useEffect(() => {
    if (view === 'login' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [view])

  // Auto-refresh de órdenes cada 5s cuando está en la vista de órdenes
  useEffect(() => {
    if (view !== 'orders' || !loggedOperator) return

    const interval = setInterval(() => {
      fetchOrders(loggedOperator, true)
    }, 5000)

    return () => clearInterval(interval)
  }, [view, loggedOperator])

  const fetchOrders = async (code, silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)

      const data = await orderService.getAll({
        estado_codigo: 'PICKED',
        codigo_operario: code,
        limit: 200,
      })

      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      if (!silent) setError(err.message)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const code = operatorCode.trim()
    if (!code) return

    setLoggedOperator(code)
    await fetchOrders(code)
    setView('orders')
  }

  const handleLogout = () => {
    setView('login')
    setLoggedOperator('')
    setOperatorCode('')
    setOrders([])
    setSelectedOrderId(null)
    setError(null)
  }

  const handleViewPacking = (orderId) => {
    setSelectedOrderId(orderId)
    setView('packing')
  }

  const handleBackToOrders = () => {
    setSelectedOrderId(null)
    setView('orders')
    fetchOrders(loggedOperator)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // ─── LOGIN ───
  if (view === 'login') {
    return (
      <div className="op-login-container">
        <div className="op-login-card">
          <div className="op-login-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="#667EEA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="op-login-title">Portal de Operario</h1>
          <p className="op-login-subtitle">Ingresa tu código de operario para acceder</p>

          <form onSubmit={handleLogin} className="op-login-form">
            <input
              ref={inputRef}
              type="text"
              className="op-login-input"
              placeholder="Código de operario (ej: OP001)"
              value={operatorCode}
              onChange={(e) => setOperatorCode(e.target.value.toUpperCase())}
              autoComplete="off"
            />
            <button
              type="submit"
              className="op-login-button"
              disabled={!operatorCode.trim() || loading}
            >
              {loading ? (
                <>
                  <div className="op-spinner-small"></div>
                  <span>Accediendo...</span>
                </>
              ) : (
                <span>Acceder</span>
              )}
            </button>
          </form>

          {error && (
            <div className="op-login-error">{error}</div>
          )}
        </div>
      </div>
    )
  }

  // ─── PACKING ───
  if (view === 'packing' && selectedOrderId) {
    return (
      <div className="op-portal-wrapper">
        <header className="op-header">
          <div className="op-header-left">
            <button className="op-back-btn" onClick={handleBackToOrders}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Volver
            </button>
            <span className="op-header-operator">Operario: <strong>{loggedOperator}</strong></span>
          </div>
          <button className="op-logout-btn" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cerrar sesión
          </button>
        </header>

        <div className="op-packing-content">
          <Suspense fallback={<div className="op-loading"><div className="op-spinner"></div><p>Cargando...</p></div>}>
            <PackingDistribution orderId={selectedOrderId} onBack={handleBackToOrders} showConfirmButton={true} onConfirmBoxes={handleBackToOrders} />
          </Suspense>
        </div>
      </div>
    )
  }

  // ─── ORDERS LIST ───
  return (
    <div className="op-portal-wrapper">
      <header className="op-header">
        <div className="op-header-left">
          <h1 className="op-header-title">Mis Órdenes</h1>
          <span className="op-header-operator">Operario: <strong>{loggedOperator}</strong></span>
        </div>
        <button className="op-logout-btn" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Cerrar sesión
        </button>
      </header>

      <main className="op-orders-content">
        {loading && (
          <div className="op-loading">
            <div className="op-spinner"></div>
            <p>Cargando órdenes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="op-error">
            <p>Error: {error}</p>
            <button className="op-retry-btn" onClick={() => fetchOrders(loggedOperator)}>Reintentar</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="op-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#94A3B8" strokeWidth="2"/>
            </svg>
            <p>No tienes órdenes pendientes de packing</p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="op-orders-list">
            <div className="op-orders-count">{orders.length} orden{orders.length !== 1 ? 'es' : ''} encontrada{orders.length !== 1 ? 's' : ''}</div>
            {orders.map((order) => (
              <div key={order.id} className="op-order-card" onClick={() => handleViewPacking(order.id)}>
                <div className="op-order-main">
                  <div className="op-order-info">
                    <span className="op-order-number">#{order.numero_orden}</span>
                    <span className="op-order-client">{order.nombre_cliente || order.cliente}</span>
                    <span className="op-order-date">{formatDate(order.fecha_orden)}</span>
                  </div>
                  <div className="op-order-items">
                    <span className="op-order-items-count">{order.total_items || 0}</span>
                    <span className="op-order-items-label">items</span>
                  </div>
                </div>
                <div className="op-order-action">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6H16V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6Z" fill="#667EEA"/>
                  </svg>
                  <span>Ver Cajas</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default OperatorPortal
