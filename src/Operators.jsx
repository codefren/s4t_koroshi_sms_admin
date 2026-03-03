import { useState, useEffect, useMemo } from 'react'
import './Operators.css'
import { operatorService } from './services/operatorService'
import { transformOperatorListData, validateOperatorCode, validateOperatorName, transformToApiFormat } from './utils/operatorTransform'
import { SearchIcon } from './components/icons'
import OperatorForm from './components/OperatorForm'
import OperatorTable from './components/OperatorTable'
import OperatorDetailModal from './components/OperatorDetailModal'
import OperatorEditModal from './components/OperatorEditModal'

function Operators() {
  // Estados de filtros y UI
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados de datos
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    codigo_operario: '',
    nombre: '',
    activo: true
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  // Estados del modal de detalle
  const [selectedOperator, setSelectedOperator] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // Estados del modal de edición
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({ nombre: '', activo: true })
  const [editFormErrors, setEditFormErrors] = useState({})
  const [editingOperator, setEditingOperator] = useState(null)
  const [submittingEdit, setSubmittingEdit] = useState(false)

  // Función para cargar operarios desde la API
  const fetchOperators = async (filterActivo = null) => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await operatorService.getAll(filterActivo)
      const transformedOperators = transformOperatorListData(data)
      
      setOperators(transformedOperators)
    } catch (err) {
      setError(err.message || 'Error al cargar operarios')
      console.error('Error al cargar operarios:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cargar operarios al montar el componente
  useEffect(() => {
    fetchOperators()
  }, [])

  // Función para manejar cambio de filtros
  const handleFilterChange = async (filter) => {
    setActiveFilter(filter)
    
    if (filter === 'all') {
      await fetchOperators(null)
    } else if (filter === 'active') {
      await fetchOperators(true)
    } else if (filter === 'inactive') {
      await fetchOperators(false)
    }
  }

  // Filtrar operarios por búsqueda (client-side)
  const searchedOperators = useMemo(() => {
    if (!searchTerm.trim()) return operators
    
    const term = searchTerm.toLowerCase()
    return operators.filter(op => 
      op.name.toLowerCase().includes(term) ||
      op.code.toLowerCase().includes(term)
    )
  }, [operators, searchTerm])

  // Calcular estadísticas
  const statsData = useMemo(() => ({
    total: operators.length,
    active: operators.filter(o => o.statusClass === 'active').length,
    inactive: operators.filter(o => o.statusClass === 'inactive').length
  }), [operators])

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Limpiar mensajes previos
    setFormErrors({})
    setSubmitSuccess(false)
    
    // Validar código
    const codeValidation = validateOperatorCode(formData.codigo_operario)
    if (!codeValidation.valid) {
      setFormErrors({ codigo_operario: codeValidation.error })
      return
    }
    
    // Validar nombre
    const nameValidation = validateOperatorName(formData.nombre)
    if (!nameValidation.valid) {
      setFormErrors({ nombre: nameValidation.error })
      return
    }
    
    try {
      setSubmitting(true)
      
      const apiData = transformToApiFormat(formData)
      await operatorService.create(apiData)
      
      // Limpiar formulario y mostrar éxito
      setFormData({ codigo_operario: '', nombre: '', activo: true })
      setSubmitSuccess(true)
      
      // Recargar operarios
      await fetchOperators(activeFilter === 'all' ? null : activeFilter === 'active' ? true : false)
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSubmitSuccess(false), 3000)
      
    } catch (err) {
      // Manejar errores específicos
      if (err.message.includes('código')) {
        setFormErrors({ 
          codigo_operario: 'Ya existe un operario con este código' 
        })
      } else {
        setFormErrors({ general: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Ver detalle del operario
  const handleViewOperator = async (operatorId) => {
    try {
      setLoadingDetail(true)
      setShowModal(true)
      
      const data = await operatorService.getById(operatorId)
      const transformedData = transformOperatorListData([data])[0]
      
      setSelectedOperator(transformedData)
    } catch (err) {
      alert('Error al cargar detalles del operario: ' + err.message)
      setShowModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedOperator(null)
  }

  // Abrir modal de edición
  const handleEditOperator = async (operatorId) => {
    try {
      const operator = operators.find(op => op.id === operatorId)
      if (!operator) return
      
      setEditingOperator(operator)
      setEditFormData({
        nombre: operator.name,
        activo: operator.statusClass === 'active'
      })
      setShowEditModal(true)
    } catch (err) {
      alert('Error al cargar datos del operario')
    }
  }
  
  // Enviar formulario de edición
  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    
    if (!editingOperator) return
    
    // Validar nombre
    const nameValidation = validateOperatorName(editFormData.nombre)
    if (!nameValidation.valid) {
      setEditFormErrors({ nombre: nameValidation.error })
      return
    }
    
    try {
      setSubmittingEdit(true)
      setEditFormErrors({})
      
      // Llamar a la API (no incluimos codigo_operario porque no se puede cambiar)
      await operatorService.update(editingOperator.id, {
        nombre: editFormData.nombre,
        activo: editFormData.activo
      })
      
      // Cerrar modal y recargar
      setShowEditModal(false)
      setEditingOperator(null)
      await fetchOperators(activeFilter === 'all' ? null : activeFilter === 'active' ? true : false)
      
      alert('✅ Operario actualizado exitosamente')
    } catch (err) {
      setEditFormErrors({ general: err.message })
    } finally {
      setSubmittingEdit(false)
    }
  }

  // Manejar activar/desactivar operario
  const handleToggleStatus = async (operatorId) => {
    const operator = operators.find(op => op.id === operatorId)
    if (!operator) return
    
    const newStatus = operator.statusClass !== 'active'
    const action = newStatus ? 'activar' : 'desactivar'
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas ${action} al operario "${operator.name}"?`
    )
    
    if (!confirmed) return
    
    try {
      await operatorService.toggleStatus(operatorId, newStatus)
      await fetchOperators(activeFilter === 'all' ? null : activeFilter === 'active' ? true : false)
      alert(`✅ Operario ${action === 'activar' ? 'activado' : 'desactivado'} exitosamente`)
    } catch (err) {
      alert(`Error al ${action} operario: ${err.message}`)
    }
  }

  return (
    <div className="operators-container">
      {/* Header */}
      <header className="operators-header">
        <div className="header-left">
          <div className="header-info">
            <h1 className="page-title">Gestión de Operarios</h1>
            <div className="breadcrumb-row">
              <span className="breadcrumb-item">Dashboard</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.64795 6.39746L4.89795 10.1475C4.79228 10.2531 4.64895 10.3125 4.49951 10.3125C4.35007 10.3125 4.20675 10.2531 4.10107 10.1475C3.9954 10.0418 3.93604 9.89847 3.93604 9.74902C3.93604 9.59958 3.9954 9.45626 4.10107 9.35058L7.4531 5.99949L4.10201 2.64746C4.04969 2.59514 4.00818 2.53302 3.97986 2.46466C3.95155 2.39629 3.93697 2.32302 3.93697 2.24902C3.93697 2.17503 3.95155 2.10175 3.97986 2.03339C4.00818 1.96503 4.04969 1.90291 4.10201 1.85059C4.15433 1.79826 4.21645 1.75676 4.28482 1.72844C4.35318 1.70012 4.42645 1.68555 4.50045 1.68555C4.57445 1.68555 4.64772 1.70012 4.71608 1.72844C4.78445 1.75676 4.84656 1.79826 4.89889 1.85059L8.64889 5.60058C8.70126 5.6529 8.7428 5.71505 8.77111 5.78346C8.79942 5.85186 8.81395 5.92518 8.81386 5.99922C8.81377 6.07325 8.79907 6.14654 8.7706 6.21488C8.74213 6.28322 8.70045 6.34526 8.64795 6.39746Z" fill="#8B95A5"/>
              </svg>
              <span className="breadcrumb-active">Operarios</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Buscar operarios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="user-section">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/2f71c4ccba3802dc780a520762f2102b900b823a?width=72" alt="Juan Pérez" className="user-avatar" />
            <div className="user-info">
              <div className="user-name">Juan Pérez</div>
              <div className="user-role">Administrador</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="operators-content">
        {/* Left Section */}
        <div className="operators-left-section">
          {/* Stats Grid */}
          <div className="operators-stats-grid">
            <div className="operator-stat-card">
              <div className="stat-content">
                <div className="stat-label">Total Operarios</div>
                <div className="stat-value">{statsData.total}</div>
              </div>
              <div className="stat-icon-box purple">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6916 17.1651C14.7909 16.2411 15.5794 15.0014 15.9501 13.6141C16.3209 12.2267 16.2561 10.7589 15.7643 9.40971C15.2726 8.06049 14.3778 6.89515 13.2013 6.07172C12.0248 5.2483 10.6235 4.80664 9.18752 4.80664C7.75149 4.80664 6.3502 5.2483 5.1737 6.07172C3.9972 6.89515 3.10241 8.06049 2.61069 9.40971C2.11896 10.7589 2.0541 12.2267 2.42489 13.6141C2.79567 15.0014 3.58418 16.2411 4.68345 17.1651C2.9669 17.9413 1.47933 19.1467 0.364237 20.6651C0.15828 20.9458 0.0722469 21.2968 0.125065 21.6408C0.177883 21.9849 0.365225 22.2939 0.645877 22.4999C0.92653 22.7059 1.2775 22.7919 1.62159 22.7391C1.96568 22.6863 2.27469 22.4989 2.48064 22.2183C3.25255 21.164 4.2621 20.3066 5.4274 19.7156C6.59269 19.1245 7.8809 18.8165 9.18752 18.8165C10.4941 18.8165 11.7823 19.1245 12.9476 19.7156C14.1129 20.3066 15.1225 21.164 15.8944 22.2183C16.1003 22.4991 16.4094 22.6865 16.7536 22.7395C17.0978 22.7924 17.4489 22.7064 17.7297 22.5004C18.0105 22.2945 18.198 21.9854 18.2509 21.6412C18.3038 21.297 18.2178 20.9459 18.0119 20.6651C16.8961 19.1469 15.4083 17.9416 13.6916 17.1651ZM4.81252 11.8123C4.81252 10.947 5.06911 10.1012 5.54984 9.3817C6.03057 8.66223 6.71385 8.10148 7.51328 7.77035C8.31271 7.43921 9.19237 7.35257 10.041 7.52138C10.8897 7.69019 11.6693 8.10687 12.2811 8.71873C12.893 9.33058 13.3096 10.1101 13.4785 10.9588C13.6473 11.8075 13.5606 12.6871 13.2295 13.4866C12.8984 14.286 12.3376 14.9693 11.6181 15.45C10.8987 15.9307 10.0528 16.1873 9.18752 16.1873C8.0272 16.1873 6.9144 15.7264 6.09393 14.9059C5.27345 14.0854 4.81252 12.9726 4.81252 11.8123Z" fill="white"/>
                </svg>
              </div>
            </div>

            <div className="operator-stat-card">
              <div className="stat-content">
                <div className="stat-label">Operarios Activos</div>
                <div className="stat-value">{statsData.active}</div>
              </div>
              <div className="stat-icon-box green">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.3036 10.4464C19.426 10.5683 19.523 10.7132 19.5893 10.8728C19.6555 11.0323 19.6896 11.2034 19.6896 11.3761C19.6896 11.5488 19.6555 11.7199 19.5893 11.8794C19.523 12.039 19.426 12.1838 19.3036 12.3058L13.1786 18.4308C13.0567 18.5531 12.9118 18.6502 12.7522 18.7165C12.5927 18.7827 12.4217 18.8168 12.2489 18.8168C12.0762 18.8168 11.9051 18.7827 11.7456 18.7165C11.5861 18.6502 11.4412 18.5531 11.3192 18.4308L8.69422 15.8058C8.57214 15.6837 8.47529 15.5388 8.40922 15.3792C8.34314 15.2197 8.30913 15.0488 8.30913 14.8761C8.30913 14.7034 8.34314 14.5325 8.40922 14.373C8.47529 14.2134 8.57214 14.0685 8.69422 13.9464C8.81631 13.8243 8.96125 13.7275 9.12077 13.6614C9.28028 13.5953 9.45125 13.5613 9.62391 13.5613C9.79657 13.5613 9.96754 13.5953 10.1271 13.6614C10.2866 13.7275 10.4315 13.8243 10.5536 13.9464L12.25 15.6406L17.4464 10.4431C17.5685 10.3213 17.7134 10.2248 17.8729 10.159C18.0324 10.0932 18.2032 10.0595 18.3757 10.0598C18.5482 10.0601 18.7189 10.0944 18.8781 10.1608C19.0373 10.2271 19.1819 10.3242 19.3036 10.4464ZM25.8125 14C25.8125 16.3363 25.1197 18.6201 23.8217 20.5627C22.5238 22.5052 20.6789 24.0193 18.5205 24.9133C16.362 25.8074 13.9869 26.0413 11.6955 25.5855C9.4041 25.1297 7.29931 24.0047 5.64731 22.3527C3.9953 20.7007 2.87027 18.5959 2.41448 16.3045C1.95869 14.0131 2.19262 11.638 3.08668 9.47955C3.98074 7.3211 5.49478 5.47624 7.43733 4.17827C9.37989 2.88029 11.6637 2.1875 14 2.1875C17.1318 2.19097 20.1343 3.43662 22.3489 5.65114C24.5634 7.86566 25.809 10.8682 25.8125 14Z" fill="white"/>
                </svg>
              </div>
            </div>

            <div className="operator-stat-card">
              <div className="stat-content">
                <div className="stat-label">Operarios Inactivos</div>
                <div className="stat-value">{statsData.inactive}</div>
              </div>
              <div className="stat-icon-box red">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.4286 11.4286L15.8594 14L18.4319 16.5714C18.6784 16.818 18.817 17.1524 18.817 17.5011C18.817 17.8498 18.6784 18.1842 18.4319 18.4308C18.1853 18.6773 17.8509 18.8159 17.5022 18.8159C17.1535 18.8159 16.8191 18.6773 16.5725 18.4308L14 15.8594L11.4286 18.4319C11.182 18.6784 10.8476 18.817 10.4989 18.817C10.1502 18.817 9.81579 18.6784 9.56922 18.4319C9.32266 18.1853 9.18413 17.8509 9.18413 17.5022C9.18413 17.1535 9.32266 16.8191 9.56922 16.5725L12.1406 14L9.57141 11.4286C9.44932 11.3065 9.35248 11.1616 9.2864 11.002C9.22033 10.8425 9.18632 10.6716 9.18632 10.4989C9.18632 10.1502 9.32484 9.81579 9.57141 9.56922C9.81798 9.32265 10.1524 9.18413 10.5011 9.18413C10.8498 9.18413 11.1842 9.32265 11.4308 9.56922L14 12.1406L16.5714 9.56813C16.818 9.32156 17.1524 9.18304 17.5011 9.18304C17.8498 9.18304 18.1842 9.32156 18.4308 9.56813C18.6774 9.81469 18.8159 10.1491 18.8159 10.4978C18.8159 10.8465 18.6774 11.1809 18.4308 11.4275L18.4286 11.4286ZM25.8125 14C25.8125 16.3363 25.1197 18.6201 23.8217 20.5627C22.5238 22.5052 20.6789 24.0193 18.5205 24.9133C16.362 25.8074 13.9869 26.0413 11.6955 25.5855C9.4041 25.1297 7.29931 24.0047 5.64731 22.3527C3.9953 20.7007 2.87027 18.5959 2.41448 16.3045C1.95869 14.0131 2.19262 11.638 3.08668 9.47955C3.98074 7.3211 5.49478 5.47624 7.43733 4.17827C9.37989 2.88029 11.6637 2.1875 14 2.1875C17.1318 2.19097 20.1343 3.43662 22.3489 5.65114C24.5634 7.86566 25.809 10.8682 25.8125 14Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <OperatorForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            submitting={submitting}
            submitSuccess={submitSuccess}
            onSubmit={handleSubmit}
            onReset={() => setFormData({ codigo_operario: '', nombre: '', activo: true })}
          />
        </div>

        {/* Right Section */}
        <div className="operators-right-section">
          <OperatorTable
            operators={searchedOperators}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onView={handleViewOperator}
            onEdit={handleEditOperator}
            onToggleStatus={handleToggleStatus}
            onRetry={() => fetchOperators(activeFilter === 'all' ? null : activeFilter === 'active' ? true : false)}
          />
        </div>
      </div>

      <OperatorDetailModal
        show={showModal}
        loading={loadingDetail}
        operator={selectedOperator}
        onClose={handleCloseModal}
      />

      <OperatorEditModal
        show={showEditModal}
        operator={editingOperator}
        formData={editFormData}
        setFormData={setEditFormData}
        formErrors={editFormErrors}
        submitting={submittingEdit}
        onSubmit={handleSubmitEdit}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  )
}

export default Operators
