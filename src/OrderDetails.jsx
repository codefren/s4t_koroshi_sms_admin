import { useState, useEffect } from 'react'
import './OrderDetails.css'
import { API_BASE_URL } from './config/api'

function OrderDetails({ onBack, orderId }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [operators, setOperators] = useState([])
  const [selectedOperator, setSelectedOperator] = useState('')
  const [loadingOperators, setLoadingOperators] = useState(false)
  const [assigningOperator, setAssigningOperator] = useState(false)
  const [assignError, setAssignError] = useState(null)
  const [assignSuccess, setAssignSuccess] = useState(false)

  // Funciones auxiliares
  const hasOperatorAssigned = (operarioAsignado) => {
    if (!operarioAsignado || operarioAsignado.trim() === '') return false
    const lowerValue = operarioAsignado.toLowerCase().trim()
    const noAssignedTexts = ['sin operario', 'sin asignar', 'no asignado', 'null', 'undefined']
    return !noAssignedTexts.includes(lowerValue)
  }

  const getPriorityClass = (prioridad) => {
    const priorities = {
      'HIGH': 'high',
      'URGENT': 'high',
      'NORMAL': 'medium',
      'LOW': 'low'
    }
    return priorities[prioridad] || 'medium'
  }

  const getPriorityLabel = (prioridad) => {
    const labels = {
      'HIGH': 'ALTA PRIORIDAD',
      'URGENT': 'URGENTE',
      'NORMAL': 'PRIORIDAD MEDIA',
      'LOW': 'PRIORIDAD BAJA'
    }
    return labels[prioridad] || prioridad
  }

  const getStatusClass = (estadoCodigo) => {
    const statuses = {
      'PENDING': 'pending',
      'ASSIGNED': 'assigned',
      'IN_PICKING': 'in-progress',
      'PICKED': 'picked',
      'PACKING': 'packing',
      'READY': 'ready',
      'SHIPPED': 'completed',
      'CANCELLED': 'cancelled'
    }
    return statuses[estadoCodigo] || 'pending'
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Sin fecha límite') return dateString
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Función para cargar detalle de orden desde la API
  const fetchOrderDetails = async (isAutoRefresh = false) => {
    try {
      // Solo mostrar loading en la carga inicial
      if (!isAutoRefresh) {
        setLoading(true)
      }
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      })
      if (!response.ok) {
        throw new Error(`Error al cargar el detalle de la orden: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setOrder(data)
      // Limpiar error si la carga fue exitosa
      if (error) setError(null)
    } catch (err) {
      // Solo mostrar error en carga inicial
      if (!isAutoRefresh) {
        setError(err.message)
      }
      console.error('Error completo:', err)
    } finally {
      if (!isAutoRefresh) {
        setLoading(false)
      }
    }
  }

  // Cargar detalle de orden al montar el componente
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  // Actualización automática cada 3 segundos
  useEffect(() => {
    if (!orderId) return

    const interval = setInterval(() => {
      console.log('🔄 Actualizando detalle de orden automáticamente...')
      fetchOrderDetails(true) // true = es un refresco automático
    }, 3000) // 3 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      clearInterval(interval)
      console.log('⏹️ Polling de detalle detenido')
    }
  }, [orderId])

  // Cargar operarios activos desde la API
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoadingOperators(true)
        const response = await fetch(`${API_BASE_URL}/operators?activo=true`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        })
        if (!response.ok) {
          throw new Error(`Error al cargar operarios: ${response.status} ${response.statusText}`)
        }
        const data = await response.json()
        setOperators(data)
      } catch (err) {
        console.error('Error al cargar operarios:', err)
      } finally {
        setLoadingOperators(false)
      }
    }

    fetchOperators()
  }, [])

  // Preseleccionar operario si la orden ya tiene uno asignado
  useEffect(() => {
    if (order && operators.length > 0 && hasOperatorAssigned(order.operario_asignado)) {
      // Buscar el operario en la lista por nombre
      const assignedOperator = operators.find(
        op => op.nombre === order.operario_asignado
      )
      if (assignedOperator) {
        setSelectedOperator(assignedOperator.id.toString())
      }
    }
  }, [order, operators])

  // Función para asignar operario a la orden
  const handleAssignOperator = async () => {
    if (!selectedOperator) return

    try {
      setAssigningOperator(true)
      setAssignError(null)
      setAssignSuccess(false)

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign-operator/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          operator_id: parseInt(selectedOperator)
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Error al asignar operario: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Actualizar la orden con los nuevos datos
      setOrder(data)
      setAssignSuccess(true)
      setSelectedOperator('')

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setAssignSuccess(false)
      }, 3000)

    } catch (err) {
      setAssignError(err.message)
      console.error('Error al asignar operario:', err)
    } finally {
      setAssigningOperator(false)
    }
  }


  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748B" }}>
        Cargando detalles de la orden...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#EF4444" }}>
        Error: {error}
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748B" }}>
        No se encontró la orden
      </div>
    )
  }
  return (
    <>
        {/* Header */}
        <header className="details-header">
          <div className="header-left-section">
            <button className="back-button" onClick={onBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.375 11.9991C21.375 12.2974 21.2565 12.5836 21.0455 12.7946C20.8345 13.0055 20.5484 13.1241 20.25 13.1241H6.46878L11.2988 17.9531C11.5101 18.1645 11.6289 18.4511 11.6289 18.75C11.6289 19.0489 11.5101 19.3355 11.2988 19.5469C11.0874 19.7582 10.8008 19.877 10.5019 19.877C10.203 19.877 9.91638 19.7582 9.70503 19.5469L2.95503 12.7969C2.85015 12.6924 2.76694 12.5682 2.71016 12.4314C2.65337 12.2947 2.62415 12.1481 2.62415 12C2.62415 11.8519 2.65337 11.7053 2.71016 11.5686C2.76694 11.4318 2.85015 11.3076 2.95503 11.2031L9.70503 4.45312C9.80968 4.34848 9.93391 4.26547 10.0706 4.20883C10.2074 4.1522 10.3539 4.12305 10.5019 4.12305C10.6499 4.12305 10.7964 4.1522 10.9332 4.20883C11.0699 4.26547 11.1941 4.34848 11.2988 4.45312C11.4034 4.55777 11.4864 4.682 11.5431 4.81873C11.5997 4.95546 11.6289 5.102 11.6289 5.25C11.6289 5.39799 11.5997 5.54454 11.5431 5.68126C11.4864 5.81799 11.4034 5.94223 11.2988 6.04687L6.46878 10.8741H20.25C20.5484 10.8741 20.8345 10.9926 21.0455 11.2036C21.2565 11.4145 21.375 11.7007 21.375 11.9991Z" fill="#64748B"/>
              </svg>
            </button>
            <div className="header-title-section">
              <h1 className="order-title">Orden #{order.numero_orden}</h1>
              <p className="order-subtitle">Detalles completos de la orden</p>
            </div>
          </div>
          <div className="header-badges">
            <div className={`status-badge-header ${getStatusClass(order.estado_codigo)}`}>{order.estado.toUpperCase()}</div>
            <div className={`priority-badge-header ${getPriorityClass(order.prioridad)}`}>{getPriorityLabel(order.prioridad)}</div>
          </div>
        </header>

        {/* Details Content */}
        <div className="details-content">
          {/* Left Column */}
          <div className="details-left-column">
            {/* Order Information Card */}
            <div className="info-card">
              <h2 className="card-title">Información de la Orden</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Cliente</span>
                  <span className="info-value">{order.nombre_cliente}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de Creación</span>
                  <span className="info-value">{formatDate(order.fecha_creacion)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha Límite</span>
                  <span className="info-value">{order.fecha_limite}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total de Cajas</span>
                  <span className="info-value">{order.total_cajas}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Operario Asignado</span>
                  <span className="info-value">{hasOperatorAssigned(order.operario_asignado) ? order.operario_asignado : 'Sin asignar'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Progreso</span>
                  <span className="info-value">{order.items_completados} de {order.total_items} items ({order.progreso_porcentaje.toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Products Card */}
            <div className="products-card">
              <div className="products-header">
                <h2 className="card-title">Lista de Productos</h2>
                <div className="items-count-badge">{order.total_items} items</div>
              </div>
              <div className="products-list">
                {order.productos.map((producto) => (
                <div className="product-item" key={producto.id}>
                  <div className="product-image-placeholder" style={{ width: '64px', height: '64px', backgroundColor: '#E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.25 6.375C20.25 8.65317 18.4032 10.5 16.125 10.5C13.8468 10.5 12 8.65317 12 6.375C12 4.09683 13.8468 2.25 16.125 2.25C18.4032 2.25 20.25 4.09683 20.25 6.375Z"/>
                      <path d="M3.75 19.125C3.75 14.7767 7.27673 11.25 11.625 11.25H12.375C16.7233 11.25 20.25 14.7767 20.25 19.125V21.75H3.75V19.125Z"/>
                    </svg>
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{producto.nombre} - {producto.descripcion}</h3>
                    <p className="product-sku">SKU: {producto.sku} | EAN: {producto.ean}</p>
                    <div className="product-specs">
                      <span className="product-spec">Ubicación: {producto.ubicacion}</span>
                      <span className="product-spec">Talla: {producto.talla}</span>
                      <span className="product-spec">Color: {producto.color}</span>
                    </div>
                    <div className="product-quantities" style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Solicitada</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{producto.cantidad_solicitada}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Servida</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: producto.cantidad_servida >= producto.cantidad_solicitada ? '#10B981' : '#F59E0B' }}>
                          {producto.cantidad_servida}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Estado</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: producto.estado === 'COMPLETED' ? '#10B981' : '#F59E0B' }}>
                          {producto.estado === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="details-right-column">
            {/* Assign Operator Card */}
            <div className="assign-card">
              <h2 className="assign-title">{hasOperatorAssigned(order.operario_asignado) ? 'Reasignar Operario' : 'Asignar Operario'}</h2>
              
              {hasOperatorAssigned(order.operario_asignado) && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #3B82F6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1E40AF'
                }}>
                  <strong>Operario actual:</strong> {order.operario_asignado}
                </div>
              )}
              
              <div className="operator-select-section">
                <label className="select-label">{hasOperatorAssigned(order.operario_asignado) ? 'Cambiar a otro operario' : 'Selecciona un operario disponible'}</label>
                <select 
                  className="operator-select"
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  disabled={loadingOperators || operators.length === 0}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    color: '#1E293B',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">
                    {loadingOperators ? 'Cargando operarios...' : 'Selecciona un operario'}
                  </option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.nombre} ({operator.codigo_operario})
                    </option>
                  ))}
                </select>
              </div>
              <button 
                className="assign-button"
                disabled={!selectedOperator || assigningOperator}
                onClick={handleAssignOperator}
                style={{
                  opacity: (!selectedOperator || assigningOperator) ? 0.5 : 1,
                  cursor: (!selectedOperator || assigningOperator) ? 'not-allowed' : 'pointer'
                }}
              >
                {assigningOperator ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="10" cy="10" r="8" stroke="#3B82F6" strokeWidth="2" strokeDasharray="12 8" fill="none" />
                    </svg>
                    <span className="assign-button-text">Asignando...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="#3B82F6" strokeWidth="1.25"/>
                    </svg>
                    <span className="assign-button-text">{hasOperatorAssigned(order.operario_asignado) ? 'Reasignar Operario' : 'Asignar Orden'}</span>
                  </>
                )}
              </button>
              
              {/* Mensajes de feedback */}
              {assignSuccess && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#D1FAE5',
                  border: '1px solid #10B981',
                  borderRadius: '8px',
                  color: '#065F46',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>¡Operario {hasOperatorAssigned(order.operario_asignado) ? 'reasignado' : 'asignado'} correctamente!</span>
                </div>
              )}
              
              {assignError && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #EF4444',
                  borderRadius: '8px',
                  color: '#991B1B',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{assignError}</span>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="summary-card">
              <h2 className="card-title">Resumen</h2>
              <div className="summary-items">
                <div className="summary-item">
                  <span className="summary-label">Total Items</span>
                  <span className="summary-value">{order.total_items}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Items Completados</span>
                  <span className="summary-value">{order.items_completados}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Progreso</span>
                  <span className="summary-value">{order.progreso_porcentaje.toFixed(1)}%</span>
                </div>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Productos Únicos</span>
                <span className="summary-total-value">{order.productos.length}</span>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

export default OrderDetails
