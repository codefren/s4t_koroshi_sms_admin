import { useState, useEffect } from 'react'
import './Replenishment.css'
import { replenishmentService } from './services/replenishmentService'

function Replenishment({ onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [almacenFilter, setAlmacenFilter] = useState('')
  
  // Paginación
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    perPage: 20,
    totalPages: 0
  })
  
  // Estadísticas
  const [stats, setStats] = useState({
    urgent: 0,
    high: 0,
    normal: 0,
    ready: 0,
    inProgress: 0,
    waitingStock: 0
  })

  // Cargar solicitudes
  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await replenishmentService.getAll({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        almacen_id: almacenFilter || undefined,
        page: pagination.page,
        perPage: pagination.perPage
      })
      
      setRequests(data.requests || [])
      
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        perPage: data.per_page || 20,
        totalPages: data.total_pages || 0
      })
      
      // Calcular estadísticas
      calculateStats(data.requests || [])
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calcular estadísticas
  const calculateStats = (requestsList) => {
    const stats = {
      urgent: requestsList.filter(r => r.priority === 'URGENT').length,
      high: requestsList.filter(r => r.priority === 'HIGH').length,
      normal: requestsList.filter(r => r.priority === 'NORMAL').length,
      ready: requestsList.filter(r => r.status === 'READY').length,
      inProgress: requestsList.filter(r => r.status === 'IN_PROGRESS').length,
      waitingStock: requestsList.filter(r => r.status === 'WAITING_STOCK').length
    }
    setStats(stats)
  }

  // Ver detalle
  const handleViewDetail = async (requestId) => {
    try {
      const detail = await replenishmentService.getById(requestId)
      setSelectedRequest(detail)
      setShowDetailModal(true)
    } catch (err) {
      alert(`Error al cargar detalle: ${err.message}`)
    }
  }

  // Iniciar ejecución
  const handleStart = async (requestId) => {
    const executorId = prompt('Ingrese ID del operador ejecutor:')
    if (!executorId) return
    
    try {
      await replenishmentService.start(requestId, parseInt(executorId))
      alert('✅ Ejecución iniciada correctamente')
      fetchRequests()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // Completar
  const handleComplete = async (requestId) => {
    if (!confirm('¿Confirmar que la reposición está completada?')) return
    
    try {
      const result = await replenishmentService.complete(requestId)
      alert(`✅ Reposición completada\n${result.quantity_moved} unidades movidas`)
      fetchRequests()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // Rechazar
  const handleReject = async (requestId) => {
    const notes = prompt('Motivo del rechazo:')
    if (notes === null) return
    
    try {
      await replenishmentService.reject(requestId, notes)
      alert('✅ Solicitud rechazada')
      fetchRequests()
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    }
  }

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    fetchRequests()
  }, [statusFilter, priorityFilter, almacenFilter, pagination.page])

  // Helpers
  const getPriorityIcon = (priority) => {
    const icons = {
      'URGENT': '🔴',
      'HIGH': '🟠',
      'NORMAL': '🟢'
    }
    return icons[priority] || '⚪'
  }

  const getPriorityClass = (priority) => {
    return priority ? priority.toLowerCase() : 'normal'
  }

  const getStatusBadge = (status) => {
    const badges = {
      'READY': { text: 'Listo', class: 'ready' },
      'WAITING_STOCK': { text: 'Esperando Stock', class: 'waiting' },
      'IN_PROGRESS': { text: 'En Progreso', class: 'in-progress' },
      'COMPLETED': { text: 'Completado', class: 'completed' },
      'REJECTED': { text: 'Rechazado', class: 'rejected' }
    }
    return badges[status] || { text: status, class: 'default' }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="replenishment-container">
      {/* Header */}
      <div className="replenishment-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="header-info">
            <h1 className="page-title">Solicitudes de Reposición</h1>
            <p className="page-subtitle">Gestión de reabastecimiento automático</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="replenishment-stats">
        <div className="stat-card priority urgent">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">Urgentes</div>
          </div>
        </div>
        
        <div className="stat-card priority high">
          <div className="stat-icon">🟠</div>
          <div className="stat-info">
            <div className="stat-value">{stats.high}</div>
            <div className="stat-label">Altas</div>
          </div>
        </div>
        
        <div className="stat-card priority normal">
          <div className="stat-icon">🟢</div>
          <div className="stat-info">
            <div className="stat-value">{stats.normal}</div>
            <div className="stat-label">Normales</div>
          </div>
        </div>

        <div className="stat-card status ready">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.ready}</div>
            <div className="stat-label">Listas</div>
          </div>
        </div>

        <div className="stat-card status in-progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">En Proceso</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="replenishment-filters">
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="READY">Listo</option>
          <option value="WAITING_STOCK">Esperando Stock</option>
          <option value="IN_PROGRESS">En Progreso</option>
          <option value="COMPLETED">Completado</option>
          <option value="REJECTED">Rechazado</option>
        </select>

        <select 
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Todas las prioridades</option>
          <option value="URGENT">🔴 Urgente</option>
          <option value="HIGH">🟠 Alta</option>
          <option value="NORMAL">🟢 Normal</option>
        </select>

        <select 
          className="filter-select"
          value={almacenFilter}
          onChange={(e) => setAlmacenFilter(e.target.value)}
        >
          <option value="">Todos los almacenes</option>
          <option value="1">Almacén 1</option>
          <option value="2">Almacén 2</option>
        </select>

        <button className="refresh-button" onClick={fetchRequests}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5M21 10V4M21 10H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="replenishment-content">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando solicitudes...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={fetchRequests}>Reintentar</button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="empty-state">
            <p>No hay solicitudes de reposición</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="requests-table">
            <div className="table-header">
              <div className="col-id">ID</div>
              <div className="col-priority">Prioridad</div>
              <div className="col-product">Producto</div>
              <div className="col-route">Ruta</div>
              <div className="col-quantity">Cantidad</div>
              <div className="col-requester">Solicitante</div>
              <div className="col-time">Tiempo</div>
              <div className="col-status">Estado</div>
              <div className="col-actions">Acciones</div>
            </div>

            <div className="table-body">
              {requests.map((request) => (
                <div key={request.id} className="table-row">
                  <div className="col-id">#{request.id}</div>
                  
                  <div className={`col-priority priority-${getPriorityClass(request.priority)}`}>
                    <span className="priority-badge">
                      {getPriorityIcon(request.priority)} {request.priority}
                    </span>
                  </div>
                  
                  <div className="col-product">
                    <div className="product-name">{request.product_name}</div>
                    <div className="product-sku">{request.product_sku}</div>
                  </div>
                  
                  <div className="col-route">
                    <div className="route-info">
                      <span className="origin">{request.origin_code || 'Sin origen'}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="destination">{request.destination_code}</span>
                    </div>
                    <div className="stock-info">
                      <span className="stock-origin">{request.origin_stock || 0} uds</span>
                      <span className="stock-destination">{request.destination_stock || 0} uds</span>
                    </div>
                  </div>
                  
                  <div className="col-quantity">
                    <span className="quantity-badge">{request.requested_quantity} uds</span>
                  </div>
                  
                  <div className="col-requester">
                    {request.requester_name || '-'}
                  </div>
                  
                  <div className="col-time">
                    {request.time_waiting || '-'}
                  </div>
                  
                  <div className="col-status">
                    <span className={`status-badge ${getStatusBadge(request.status).class}`}>
                      {getStatusBadge(request.status).text}
                    </span>
                  </div>
                  
                  <div className="col-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => handleViewDetail(request.id)}
                      title="Ver detalle"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 5C7 5 3.73 7.11 1 12C3.73 16.89 7 19 12 19C17 19 20.27 16.89 23 12C20.27 7.11 17 5 12 5Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    
                    {request.status === 'READY' && (
                      <button 
                        className="action-btn start"
                        onClick={() => handleStart(request.id)}
                        title="Iniciar"
                      >
                        ▶️
                      </button>
                    )}
                    
                    {request.status === 'IN_PROGRESS' && (
                      <button 
                        className="action-btn complete"
                        onClick={() => handleComplete(request.id)}
                        title="Completar"
                      >
                        ✅
                      </button>
                    )}
                    
                    {(request.status === 'READY' || request.status === 'WAITING_STOCK') && (
                      <button 
                        className="action-btn reject"
                        onClick={() => handleReject(request.id)}
                        title="Rechazar"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalle de Solicitud #{selectedRequest.id}</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Estado y Prioridad</h3>
                <div className="detail-row">
                  <span className={`status-badge ${getStatusBadge(selectedRequest.status).class}`}>
                    {getStatusBadge(selectedRequest.status).text}
                  </span>
                  <span className={`priority-badge priority-${getPriorityClass(selectedRequest.priority)}`}>
                    {getPriorityIcon(selectedRequest.priority)} {selectedRequest.priority}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Producto</h3>
                <p><strong>Nombre:</strong> {selectedRequest.product?.nombre}</p>
                <p><strong>SKU:</strong> {selectedRequest.product?.sku}</p>
                <p><strong>EAN:</strong> {selectedRequest.product?.ean || '-'}</p>
              </div>

              <div className="detail-section">
                <h3>Ubicación Origen</h3>
                {selectedRequest.location_origin ? (
                  <>
                    <p><strong>Código:</strong> {selectedRequest.location_origin.code}</p>
                    <p><strong>Stock:</strong> {selectedRequest.location_origin.stock_actual} uds</p>
                    <p><strong>Almacén:</strong> {selectedRequest.location_origin.almacen_id}</p>
                  </>
                ) : (
                  <p className="no-data">Sin ubicación origen disponible</p>
                )}
              </div>

              <div className="detail-section">
                <h3>Ubicación Destino</h3>
                <p><strong>Código:</strong> {selectedRequest.location_destination?.code}</p>
                <p><strong>Stock Actual:</strong> {selectedRequest.location_destination?.stock_actual} uds</p>
                <p><strong>Stock Mínimo:</strong> {selectedRequest.location_destination?.stock_minimo} uds</p>
              </div>

              <div className="detail-section">
                <h3>Cantidad y Operadores</h3>
                <p><strong>Cantidad Solicitada:</strong> {selectedRequest.requested_quantity} uds</p>
                <p><strong>Solicitante:</strong> {selectedRequest.requester?.nombre} ({selectedRequest.requester?.codigo})</p>
                <p><strong>Ejecutor:</strong> {selectedRequest.executor?.nombre || 'Sin asignar'}</p>
              </div>

              <div className="detail-section">
                <h3>Fechas</h3>
                <p><strong>Solicitado:</strong> {formatDate(selectedRequest.requested_at)}</p>
                <p><strong>Iniciado:</strong> {formatDate(selectedRequest.started_at)}</p>
                <p><strong>Completado:</strong> {formatDate(selectedRequest.completed_at)}</p>
                <p><strong>Tiempo Esperando:</strong> {selectedRequest.time_waiting || '-'}</p>
              </div>

              {selectedRequest.notes && (
                <div className="detail-section">
                  <h3>Notas</h3>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Replenishment
