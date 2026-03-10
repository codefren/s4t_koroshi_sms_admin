import { useState, useEffect } from 'react'
import './Replenishment.css'
import { replenishmentService } from './services/replenishmentService'
import { 
  AlertCircle, 
  TrendingUp, 
  Circle, 
  CheckCircle2, 
  Clock, 
  CheckCheck,
  Eye,
  Play,
  X,
  RotateCw,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'

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
  const [productFilter, setProductFilter] = useState('')
  const [ubicacionInput, setUbicacionInput] = useState('')
  const [ubicacionFilter, setUbicacionFilter] = useState('')
  const [skuInput, setSkuInput] = useState('')
  const [skuFilter, setSkuFilter] = useState('')
  
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
    waitingStock: 0,
    completed: 0
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
        product_id: productFilter || undefined,
        ubicacion: ubicacionFilter || undefined,
        sku: skuFilter || undefined,
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
      
      // Usar status_counts y priority_counts del API
      const statusCounts = data.status_counts || {}
      const priorityCounts = data.priority_counts || {}
      
      setStats({
        urgent: priorityCounts.URGENT || 0,
        high: priorityCounts.HIGH || 0,
        normal: priorityCounts.NORMAL || 0,
        ready: statusCounts.READY || 0,
        inProgress: statusCounts.IN_PROGRESS || 0,
        waitingStock: statusCounts.WAITING_STOCK || 0,
        completed: statusCounts.COMPLETED || 0
      })
      
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

  // Debounce para ubicacion
  useEffect(() => {
    const timeout = setTimeout(() => {
      setUbicacionFilter(ubicacionInput)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timeout)
  }, [ubicacionInput])

  // Debounce para SKU
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSkuFilter(skuInput)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 500)
    return () => clearTimeout(timeout)
  }, [skuInput])

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    fetchRequests()
  }, [statusFilter, priorityFilter, almacenFilter, productFilter, ubicacionFilter, skuFilter, pagination.page])

  // Helpers
  const getPriorityIcon = (priority) => {
    const icons = {
      'URGENT': <AlertCircle size={16} />,
      'HIGH': <TrendingUp size={16} />,
      'NORMAL': <Circle size={16} />
    }
    return icons[priority] || <Circle size={16} />
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
          <div className="stat-icon"><AlertCircle size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.urgent}</div>
            <div className="stat-label">Urgentes</div>
          </div>
        </div>
        
        <div className="stat-card priority high">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.high}</div>
            <div className="stat-label">Altas</div>
          </div>
        </div>
        
        <div className="stat-card priority normal">
          <div className="stat-icon"><Circle size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.normal}</div>
            <div className="stat-label">Normales</div>
          </div>
        </div>

        <div className="stat-card status ready">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.ready}</div>
            <div className="stat-label">Listas</div>
          </div>
        </div>

        <div className="stat-card status in-progress">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">En Proceso</div>
          </div>
        </div>

        <div className="stat-card status completed">
          <div className="stat-icon"><CheckCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completadas</div>
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
          <option value="URGENT">Urgente</option>
          <option value="HIGH">Alta</option>
          <option value="NORMAL">Normal</option>
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

        <input
          type="number"
          className="filter-input"
          placeholder="ID Producto"
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        />

        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Buscar ubicación..."
          value={ubicacionInput}
          onChange={(e) => setUbicacionInput(e.target.value)}
        />

        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Buscar SKU..."
          value={skuInput}
          onChange={(e) => setSkuInput(e.target.value)}
        />

        <button className="refresh-button" onClick={fetchRequests}>
          <RotateCw size={20} />
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
                      <Eye size={18} />
                    </button>
                    
                    {request.status === 'READY' && (
                      <button 
                        className="action-btn start"
                        onClick={() => handleStart(request.id)}
                        title="Iniciar"
                      >
                        <Play size={18} />
                      </button>
                    )}
                    
                    {request.status === 'IN_PROGRESS' && (
                      <button 
                        className="action-btn complete"
                        onClick={() => handleComplete(request.id)}
                        title="Completar"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    
                    {(request.status === 'READY' || request.status === 'WAITING_STOCK') && (
                      <button 
                        className="action-btn reject"
                        onClick={() => handleReject(request.id)}
                        title="Rechazar"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              <ArrowLeft size={16} /> Anterior
            </button>
            
            <span className="pagination-info">
              Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
            </span>
            
            <button
              className="pagination-btn"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Siguiente <ArrowRight size={16} />
            </button>
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
