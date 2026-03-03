import { useState, useEffect } from 'react'
import './PickingRoute.css'
import { useLocations } from './hooks/useLocations'
import { productService } from './services/productService'

function PickingRoute({ onBack, product, almacenId }) {
  // Estados del formulario
  const [formData, setFormData] = useState({
    pasillo: '',
    lado: 'Izquierdo',
    ubicacion: '',
    altura: 'Nivel 1',
    stockMinimo: '10',
    ordenRecorrido: 'ascendente'
  })

  // Estados para producto y ubicaciones
  const [productDetail, setProductDetail] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [editingLocation, setEditingLocation] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [formErrors, setFormErrors] = useState({})

  // Hook para gestión de ubicaciones
  const {
    locations,
    totalLocations,
    loading: loadingLocations,
    error: locationsError,
    addLocation,
    updateLocation,
    removeLocation,
    clearError
  } = useLocations(product?.id, almacenId)

  // Cargar detalle del producto al montar
  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!product?.id) {
        setLoadingProduct(false)
        return
      }

      try {
        setLoadingProduct(true)
        const data = await productService.getById(product.id)
        setProductDetail(data)
      } catch (err) {
        console.error('Error al cargar producto:', err)
      } finally {
        setLoadingProduct(false)
      }
    }

    fetchProductDetail()
  }, [product?.id])

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (locationsError) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [locationsError, clearError])

  // Helpers
  const getStockColor = (status) => {
    if (status === 'low') return 'linear-gradient(315deg, #E74C3C 64.64%, #C0392B 135.36%)'
    return 'linear-gradient(315deg, #2ECC71 64.64%, #27AE60 135.36%)'
  }

  const getStockTextColor = (status) => {
    return status === 'low' ? '#E74C3C' : '#2ECC71'
  }

  // Validación del formulario
  const validateForm = () => {
    const errors = {}
    
    if (!formData.pasillo || formData.pasillo.trim() === '') {
      errors.pasillo = 'El pasillo es requerido'
    }
    if (!formData.ubicacion || formData.ubicacion.trim() === '') {
      errors.ubicacion = 'La ubicación es requerida'
    }
    if (!formData.lado) {
      errors.lado = 'El lado es requerido'
    }
    if (!formData.altura) {
      errors.altura = 'La altura es requerida'
    }
    if (formData.stockMinimo && parseInt(formData.stockMinimo) < 0) {
      errors.stockMinimo = 'El stock mínimo no puede ser negativo'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manejar añadir ubicación
  const handleAddLocation = async () => {
    if (!validateForm()) {
      return
    }

    const locationData = {
      pasillo: formData.pasillo,
      lado: formData.lado,
      ubicacion: formData.ubicacion,
      altura: formData.altura,
      stockMinimo: parseInt(formData.stockMinimo) || 0,
      stockActual: 0,
      prioridad: 3,
      activa: true
    }

    const result = await addLocation(locationData)

    if (result.success) {
      setSuccessMessage('Ubicación añadida exitosamente')
      // Resetear formulario
      setFormData({
        pasillo: '',
        lado: 'Izquierdo',
        ubicacion: '',
        altura: 'Nivel 1',
        stockMinimo: '10',
        ordenRecorrido: formData.ordenRecorrido
      })
      setFormErrors({})
    }
  }

  // Manejar edición de ubicación
  const handleEditClick = (location) => {
    setEditingLocation({
      ...location,
      pasillo: location.pasillo,
      lado: location.lado,
      ubicacion: location.ubicacionCode || location.ubicacion,
      altura: location.altura,
      stockMinimo: location.stockMin.toString()
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingLocation) return

    const updates = {
      pasillo: editingLocation.pasillo,
      lado: editingLocation.lado,
      ubicacion: editingLocation.ubicacion,
      altura: editingLocation.altura,
      stockMinimo: parseInt(editingLocation.stockMinimo) || 0
    }

    const result = await updateLocation(editingLocation.locationId, updates)

    if (result.success) {
      setSuccessMessage('Ubicación actualizada exitosamente')
      setShowEditModal(false)
      setEditingLocation(null)
    }
  }

  // Manejar eliminación
  const handleDeleteClick = async (location) => {
    if (!window.confirm(`¿Está seguro de eliminar la ubicación ${location.ubicacion}?`)) {
      return
    }

    const result = await removeLocation(location.locationId)

    if (result.success) {
      setSuccessMessage('Ubicación eliminada exitosamente')
    }
  }

  // Opciones para los selectores
  const PASILLOS_OPTIONS = ['A', 'B', 'B3', 'C', 'D', 'E', 'F', 'G', 'H']
  const LADOS_OPTIONS = ['Izquierdo', 'Derecho']
  const ALTURAS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // Estados de carga
  const isLoading = loadingProduct || loadingLocations

  return (
    <div className="picking-route-container">
      {/* Top Bar */}
      <div className="picking-route-topbar">
        <button className="back-button-detail" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.3749 11.9991C21.3749 12.2974 21.2564 12.5836 21.0454 12.7946C20.8344 13.0055 20.5483 13.1241 20.2499 13.1241H6.46866L11.2987 17.9531C11.51 18.1645 11.6287 18.4511 11.6287 18.75C11.6287 19.0489 11.51 19.3355 11.2987 19.5469C11.0873 19.7582 10.8007 19.877 10.5018 19.877C10.2029 19.877 9.91625 19.7582 9.70491 19.5469L2.95491 12.7969C2.85003 12.6924 2.76681 12.5682 2.71003 12.4314C2.65325 12.2947 2.62402 12.1481 2.62402 12C2.62402 11.8519 2.65325 11.7053 2.71003 11.5686C2.76681 11.4318 2.85003 11.3076 2.95491 11.2031L9.70491 4.45312C9.80956 4.34848 9.93379 4.26547 10.0705 4.20883C10.2072 4.1522 10.3538 4.12305 10.5018 4.12305C10.6498 4.12305 10.7963 4.1522 10.9331 4.20883C11.0698 4.26547 11.194 4.34848 11.2987 4.45312C11.4033 4.55777 11.4863 4.682 11.543 4.81873C11.5996 4.95546 11.6287 5.102 11.6287 5.25C11.6287 5.39799 11.5996 5.54454 11.543 5.68126C11.4863 5.81799 11.4033 5.94223 11.2987 6.04687L6.46866 10.8741H20.2499C20.5483 10.8741 20.8344 10.9926 21.0454 11.2036C21.2564 11.4145 21.3749 11.7007 21.3749 11.9991Z" fill="#64748B"/>
          </svg>
        </button>
        
        <div className="header-section">
          <h1 className="page-heading">Almacenamiento de Producto</h1>
        </div>
      </div>

      {/* Mensajes */}
      {successMessage && (
        <div className="success-message">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#2ECC71"/>
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      {locationsError && (
        <div className="error-message">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#E74C3C"/>
          </svg>
          <span>{locationsError}</span>
        </div>
      )}

      {/* Content Area */}
      <div className="picking-route-content">
        {/* Product Info Card */}
        <div className="info-card">
          <div className="card-top">
            <h2 className="card-heading">Información de producto</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Referencia</label>
              <div className="form-input">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.25 10.625H3.75C3.41848 10.625 3.10054 10.7567 2.86612 10.9911C2.6317 11.2255 2.5 11.5435 2.5 11.875V15C2.5 15.3315 2.6317 15.6495 2.86612 15.8839C3.10054 16.1183 3.41848 16.25 3.75 16.25H16.25C16.5815 16.25 16.8995 16.1183 17.1339 15.8839C17.3683 15.6495 17.5 15.3315 17.5 15V11.875C17.5 11.5435 17.3683 11.2255 17.1339 10.9911C16.8995 10.7567 16.5815 10.625 16.25 10.625ZM16.25 15H3.75V11.875H16.25V15ZM16.25 3.75H3.75C3.41848 3.75 3.10054 3.8817 2.86612 4.11612C2.6317 4.35054 2.5 4.66848 2.5 5V8.125C2.5 8.45652 2.6317 8.77446 2.86612 9.00888C3.10054 9.2433 3.41848 9.375 3.75 9.375H16.25C16.5815 9.375 16.8995 9.2433 17.1339 9.00888C17.3683 8.77446 17.5 8.45652 17.5 8.125V5C17.5 4.66848 17.3683 4.35054 17.1339 4.11612C16.8995 3.8817 16.5815 3.75 16.25 3.75ZM16.25 8.125H3.75V5H16.25V8.125Z" fill="#667EEA"/>
                </svg>
                <span className="input-text">{productDetail?.sku || product?.sku || '-'}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre de producto</label>
              <div className="form-input">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.16 4.3081L9.5975 0.170212C9.39544 0.0585639 9.16836 0 8.9375 0C8.70664 0 8.47956 0.0585639 8.2775 0.170212L0.715 4.30982C0.499029 4.42799 0.318745 4.60197 0.192974 4.81361C0.0672033 5.02524 0.000558815 5.26676 0 5.51295V13.732C0.000558815 13.9782 0.0672033 14.2197 0.192974 14.4313C0.318745 14.643 0.499029 14.817 0.715 14.9351L8.2775 19.0747C8.47956 19.1864 8.70664 19.245 8.9375 19.245C9.16836 19.245 9.39544 19.1864 9.5975 19.0747L17.16 14.9351C17.376 14.817 17.5563 14.643 17.682 14.4313C17.8078 14.2197 17.8744 13.9782 17.875 13.732V5.51381C17.8749 5.26718 17.8085 5.02513 17.6827 4.813C17.5569 4.60087 17.3764 4.42648 17.16 4.3081ZM8.9375 1.37334L15.8417 5.15459L13.2834 6.55537L6.37828 2.77412L8.9375 1.37334ZM8.9375 8.93584L2.03328 5.15459L4.94656 3.55959L11.8508 7.34084L8.9375 8.93584ZM1.375 6.35771L8.25 10.1201V17.4926L1.375 13.7329V6.35771ZM16.5 13.7294L9.625 17.4926V10.1235L12.375 8.61873V11.6858C12.375 11.8682 12.4474 12.043 12.5764 12.172C12.7053 12.3009 12.8802 12.3733 13.0625 12.3733C13.2448 12.3733 13.4197 12.3009 13.5486 12.172C13.6776 12.043 13.75 11.8682 13.75 11.6858V7.86592L16.5 6.35771V13.7286V13.7294Z" fill="#667EEA"/>
                </svg>
                <span className="input-text">{productDetail?.nombre_producto || product?.name || '-'}</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Color ID</label>
              <div className="form-input">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.625 13.125C15.0707 13.1255 14.5323 13.3099 14.0941 13.6492C13.6558 13.9885 13.3425 14.4635 13.2031 15H5.625C4.96196 15 4.32607 14.7366 3.85723 14.2678C3.38839 13.7989 3.125 13.163 3.125 12.5C3.125 11.837 3.38839 11.2011 3.85723 10.7322C4.32607 10.2634 4.96196 10 5.625 10H13.125C13.9538 10 14.7487 9.67076 15.3347 9.08471C15.9208 8.49866 16.25 7.7038 16.25 6.875C16.25 6.0462 15.9208 5.25134 15.3347 4.66529C14.7487 4.07924 13.9538 3.75 13.125 3.75H5.625C5.45924 3.75 5.30027 3.81585 5.18306 3.93306C5.06585 4.05027 5 4.20924 5 4.375C5 4.54076 5.06585 4.69973 5.18306 4.81694C5.30027 4.93415 5.45924 5 5.625 5H13.125C13.6223 5 14.0992 5.19754 14.4508 5.54917C14.8025 5.90081 15 6.37772 15 6.875C15 7.37228 14.8025 7.84919 14.4508 8.20083C14.0992 8.55246 13.6223 8.75 13.125 8.75H5.625C4.63044 8.75 3.67661 9.14509 2.97335 9.84835C2.27009 10.5516 1.875 11.5054 1.875 12.5C1.875 13.4946 2.27009 14.4484 2.97335 15.1517C3.67661 15.8549 4.63044 16.25 5.625 16.25H13.2031C13.32 16.7027 13.5615 17.1135 13.9001 17.4359C14.2388 17.7582 14.661 17.9791 15.1189 18.0735C15.5768 18.1679 16.052 18.132 16.4906 17.9699C16.9291 17.8078 17.3134 17.526 17.5998 17.1564C17.8862 16.7869 18.0632 16.3444 18.1108 15.8793C18.1583 15.4142 18.0745 14.9451 17.8689 14.5252C17.6632 14.1054 17.3439 13.7516 16.9473 13.5041C16.5506 13.2566 16.0925 13.1252 15.625 13.125ZM15.625 16.875C15.3778 16.875 15.1361 16.8017 14.9305 16.6643C14.725 16.527 14.5648 16.3318 14.4701 16.1034C14.3755 15.8749 14.3508 15.6236 14.399 15.3811C14.4472 15.1387 14.5663 14.9159 14.7411 14.7411C14.9159 14.5663 15.1387 14.4472 15.3811 14.399C15.6236 14.3508 15.8749 14.3755 16.1034 14.4701C16.3318 14.5648 16.527 14.725 16.6643 14.9305C16.8017 15.1361 16.875 15.3778 16.875 15.625C16.875 15.9565 16.7433 16.2745 16.5089 16.5089C16.2745 16.7433 15.9565 16.875 15.625 16.875Z" fill="#667EEA"/>
                </svg>
                <span className="input-text">{productDetail?.color_id || product?.category || '-'}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Talla</label>
              <div className="form-input">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.0407 16.5627C16.8508 14.5056 15.0172 13.0306 12.8774 12.3314C13.9358 11.7013 14.7582 10.7412 15.2182 9.59845C15.6781 8.45573 15.7503 7.19361 15.4235 6.00592C15.0968 4.81823 14.3892 3.77064 13.4094 3.02402C12.4296 2.2774 11.2318 1.87305 10 1.87305C8.76821 1.87305 7.57044 2.2774 6.59067 3.02402C5.6109 3.77064 4.90331 4.81823 4.57654 6.00592C4.24978 7.19361 4.32193 8.45573 4.78189 9.59845C5.24186 10.7412 6.06422 11.7013 7.12268 12.3314C4.98284 13.0299 3.14925 14.5049 1.9594 16.5627C1.91577 16.6338 1.88683 16.713 1.87429 16.7955C1.86174 16.878 1.86585 16.9622 1.88638 17.0431C1.9069 17.124 1.94341 17.2 1.99377 17.2665C2.04413 17.3331 2.10731 17.3889 2.17958 17.4306C2.25185 17.4724 2.33175 17.4992 2.41457 17.5096C2.49738 17.5199 2.58143 17.5136 2.66176 17.491C2.74209 17.4683 2.81708 17.4298 2.88228 17.3777C2.94749 17.3256 3.00161 17.261 3.04143 17.1877C4.51331 14.6439 7.11487 13.1252 10 13.1252C12.8852 13.1252 15.4867 14.6439 16.9586 17.1877C16.9985 17.261 17.0526 17.3256 17.1178 17.3777C17.183 17.4298 17.258 17.4683 17.3383 17.491C17.4186 17.5136 17.5027 17.5199 17.5855 17.5096C17.6683 17.4992 17.7482 17.4724 17.8205 17.4306C17.8927 17.3889 17.9559 17.3331 18.0063 17.2665C18.0566 17.2 18.0932 17.124 18.1137 17.0431C18.1342 16.9622 18.1383 16.878 18.1258 16.7955C18.1132 16.713 18.0843 16.6338 18.0407 16.5627ZM5.62503 7.50017C5.62503 6.63488 5.88162 5.78902 6.36235 5.06955C6.84308 4.35009 7.52636 3.78933 8.32579 3.4582C9.12522 3.12707 10.0049 3.04043 10.8535 3.20924C11.7022 3.37805 12.4818 3.79473 13.0936 4.40658C13.7055 5.01843 14.1222 5.79799 14.291 6.64665C14.4598 7.49532 14.3731 8.37499 14.042 9.17441C13.7109 9.97384 13.1501 10.6571 12.4306 11.1379C11.7112 11.6186 10.8653 11.8752 10 11.8752C8.84009 11.8739 7.72801 11.4126 6.90781 10.5924C6.0876 9.77219 5.62627 8.66011 5.62503 7.50017Z" fill="#667EEA"/>
                </svg>
                <span className="input-text">{productDetail?.talla || product?.size || '-'}</span>
              </div>
            </div>
          </div>

          {/* EANs Display */}
          {productDetail?.eans && productDetail.eans.length > 0 && (
            <div className="form-row">
              <div className="form-group full-width">
                <label className="form-label">Códigos EAN</label>
                <div className="eans-container">
                  {productDetail.eans.map((ean, index) => (
                    <span key={index} className="ean-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5V18H3V6ZM7 6H9V18H7V6ZM10 6H11V18H10V6ZM12 6H14V18H12V6ZM16 6H17V18H16V6ZM18 6H21V18H18V6Z" fill="currentColor"/>
                      </svg>
                      {ean}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location Config Card */}
        <div className="config-card">
          <div className="card-top">
            <h2 className="card-heading">Configuración de Ubicación</h2>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pasillo *</label>
              <select 
                className="form-select"
                value={formData.pasillo}
                onChange={(e) => setFormData({...formData, pasillo: e.target.value})}
              >
                <option value="">Seleccionar pasillo</option>
                {PASILLOS_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {formErrors.pasillo && <span className="error-text">{formErrors.pasillo}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Lado *</label>
              <select 
                className="form-select"
                value={formData.lado}
                onChange={(e) => setFormData({...formData, lado: e.target.value})}
              >
                {LADOS_OPTIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              {formErrors.lado && <span className="error-text">{formErrors.lado}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ubicación *</label>
              <input 
                type="text"
                className="form-input-field"
                placeholder="Ej: 12, 15, 20"
                value={formData.ubicacion}
                onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
              />
              {formErrors.ubicacion && <span className="error-text">{formErrors.ubicacion}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Altura *</label>
              <select 
                className="form-select"
                value={formData.altura}
                onChange={(e) => setFormData({...formData, altura: e.target.value})}
              >
                {ALTURAS_OPTIONS.map(a => (
                  <option key={a} value={`Nivel ${a}`}>Nivel {a}</option>
                ))}
              </select>
              {formErrors.altura && <span className="error-text">{formErrors.altura}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label className="form-label">Stock Mínimo por Ubicación</label>
              <input 
                type="number"
                className="form-input-field"
                placeholder="Ingrese stock mínimo"
                value={formData.stockMinimo}
                onChange={(e) => setFormData({...formData, stockMinimo: e.target.value})}
                min="0"
              />
              {formErrors.stockMinimo && <span className="error-text">{formErrors.stockMinimo}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Orden de Recorrido</label>
            <div className="order-selector">
              <button className={`order-button ${formData.ordenRecorrido === 'ascendente' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, ordenRecorrido: 'ascendente'})}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10C10 10.2486 9.90123 10.4871 9.72541 10.6629C9.5496 10.8387 9.31114 10.9375 9.0625 10.9375H3.75C3.50136 10.9375 3.2629 10.8387 3.08709 10.6629C2.91127 10.4871 2.8125 10.2486 2.8125 10C2.8125 9.75136 2.91127 9.5129 3.08709 9.33709C3.2629 9.16127 3.50136 9.0625 3.75 9.0625H9.0625C9.31114 9.0625 9.5496 9.16127 9.72541 9.33709C9.90123 9.5129 10 9.75136 10 10ZM3.75 5.9375H14.0625C14.3111 5.9375 14.5496 5.83873 14.7254 5.66291C14.9012 5.4871 15 5.24864 15 5C15 4.75136 14.9012 4.5129 14.7254 4.33709C14.5496 4.16127 14.3111 4.0625 14.0625 4.0625H3.75C3.50136 4.0625 3.2629 4.16127 3.08709 4.33709C2.91127 4.5129 2.8125 4.75136 2.8125 5C2.8125 5.24864 2.91127 5.4871 3.08709 5.66291C3.2629 5.83873 3.50136 5.9375 3.75 5.9375ZM7.8125 14.0625H3.75C3.50136 14.0625 3.2629 14.1613 3.08709 14.3371C2.91127 14.5129 2.8125 14.7514 2.8125 15C2.8125 15.2486 2.91127 15.4871 3.08709 15.6629C3.2629 15.8387 3.50136 15.9375 3.75 15.9375H7.8125C8.06114 15.9375 8.2996 15.8387 8.47541 15.6629C8.65123 15.4871 8.75 15.2486 8.75 15C8.75 14.7514 8.65123 14.5129 8.47541 14.3371C8.2996 14.1613 8.06114 14.0625 7.8125 14.0625ZM18.1633 12.4617C18.0762 12.3743 17.9727 12.305 17.8587 12.2577C17.7448 12.2103 17.6226 12.186 17.4992 12.186C17.3758 12.186 17.2537 12.2103 17.1397 12.2577C17.0257 12.305 16.9223 12.3743 16.8352 12.4617L15.3125 13.9844V8.75C15.3125 8.50136 15.2137 8.2629 15.0379 8.08709C14.8621 7.91127 14.6236 7.8125 14.375 7.8125C14.1264 7.8125 13.8879 7.91127 13.7121 8.08709C13.5363 8.2629 13.4375 8.50136 13.4375 8.75V13.9844L11.9133 12.4594C11.7372 12.2833 11.4983 12.1843 11.2492 12.1843C11.0001 12.1843 10.7613 12.2833 10.5852 12.4594C10.409 12.6355 10.3101 12.8744 10.3101 13.1234C10.3101 13.3725 10.409 13.6114 10.5852 13.7875L13.7102 16.9125C13.7973 16.9999 13.9007 17.0692 14.0147 17.1166C14.1287 17.1639 14.2508 17.1882 14.3742 17.1882C14.4976 17.1882 14.6198 17.1639 14.7337 17.1166C14.8477 17.0692 14.9512 16.9999 15.0383 16.9125L18.1633 13.7875C18.3391 13.6117 18.4378 13.3732 18.4378 13.1246C18.4378 12.876 18.3391 12.6375 18.1633 12.4617Z" fill="white"/>
                </svg>
                <span>Ascendente</span>
              </button>

              <button className={`order-button ${formData.ordenRecorrido === 'descendente' ? 'active' : ''}`}
                onClick={() => setFormData({...formData, ordenRecorrido: 'descendente'})}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.8125 9.99957C2.8125 9.75093 2.91127 9.51247 3.08709 9.33665C3.2629 9.16084 3.50136 9.06207 3.75 9.06207H9.0625C9.31114 9.06207 9.5496 9.16084 9.72541 9.33665C9.90123 9.51247 10 9.75093 10 9.99957C10 10.2482 9.90123 10.4867 9.72541 10.6625C9.5496 10.8383 9.31114 10.9371 9.0625 10.9371H3.75C3.50136 10.9371 3.2629 10.8383 3.08709 10.6625C2.91127 10.4867 2.8125 10.2482 2.8125 9.99957ZM3.75 5.93707H7.8125C8.06114 5.93707 8.2996 5.8383 8.47541 5.66248C8.65123 5.48666 8.75 5.24821 8.75 4.99957C8.75 4.75093 8.65123 4.51247 8.47541 4.33665C8.2996 4.16084 8.06114 4.06207 7.8125 4.06207H3.75C3.50136 4.06207 3.2629 4.16084 3.08709 4.33665C2.91127 4.51247 2.8125 4.75093 2.8125 4.99957C2.8125 5.24821 2.91127 5.48666 3.08709 5.66248C3.2629 5.8383 3.50136 5.93707 3.75 5.93707ZM14.0625 14.0621H3.75C3.50136 14.0621 3.2629 14.1608 3.08709 14.3367C2.91127 14.5125 2.8125 14.7509 2.8125 14.9996C2.8125 15.2482 2.91127 15.4867 3.08709 15.6625C3.2629 15.8383 3.50136 15.9371 3.75 15.9371H14.0625C14.3111 15.9371 14.5496 15.8383 14.7254 15.6625C14.9012 15.4867 15 15.2482 15 14.9996C15 14.7509 14.9012 14.5125 14.7254 14.3367C14.5496 14.1608 14.3111 14.0621 14.0625 14.0621ZM18.1633 6.21129L15.0383 3.08629C14.9512 2.99889 14.8477 2.92954 14.7337 2.88222C14.6198 2.8349 14.4976 2.81055 14.3742 2.81055C14.2508 2.81055 14.1287 2.8349 14.0147 2.88222C13.9007 2.92954 13.7973 2.99889 13.7102 3.08629L10.5852 6.21129C10.409 6.38741 10.3101 6.62628 10.3101 6.87535C10.3101 7.12442 10.409 7.36329 10.5852 7.53941C10.7613 7.71553 11.0001 7.81447 11.2492 7.81448C11.4983 7.81448 11.7372 7.71553 11.9133 7.53941L13.4375 6.01519V11.2496C13.4375 11.4982 13.5363 11.7367 13.7121 11.9125C13.8879 12.0883 14.1264 12.1871 14.375 12.1871C14.6236 12.1871 14.8621 12.0883 15.0379 11.9125C15.2137 11.7367 15.3125 11.4982 15.3125 11.2496V6.01519L16.8367 7.54019C16.9239 7.6274 17.0275 7.69657 17.1414 7.74377C17.2553 7.79097 17.3775 7.81526 17.5008 7.81526C17.6241 7.81526 17.7462 7.79097 17.8602 7.74377C17.9741 7.69657 18.0776 7.6274 18.1648 7.54019C18.252 7.45299 18.3212 7.34946 18.3684 7.23552C18.4156 7.12158 18.4399 6.99946 18.4399 6.87613C18.4399 6.7528 18.4156 6.63068 18.3684 6.51674C18.3212 6.4028 18.252 6.29927 18.1648 6.21207L18.1633 6.21129Z" fill="#4A5568"/>
                </svg>
                <span>Descendente</span>
              </button>
            </div>
          </div>

          <div className="add-location-wrapper">
            <button 
              className="add-location-button"
              onClick={handleAddLocation}
              disabled={isLoading}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0312 9C16.0312 9.22378 15.9424 9.43839 15.7841 9.59662C15.6259 9.75485 15.4113 9.84375 15.1875 9.84375H9.84375V15.1875C9.84375 15.4113 9.75485 15.6259 9.59662 15.7841C9.43839 15.9424 9.22378 16.0312 9 16.0312C8.77622 16.0312 8.56161 15.9424 8.40338 15.7841C8.24514 15.6259 8.15625 15.4113 8.15625 15.1875V9.84375H2.8125C2.58872 9.84375 2.37411 9.75485 2.21588 9.59662C2.05764 9.43839 1.96875 9.22378 1.96875 9C1.96875 8.77622 2.05764 8.56161 2.21588 8.40338C2.37411 8.24514 2.58872 8.15625 2.8125 8.15625H8.15625V2.8125C8.15625 2.58872 8.24514 2.37411 8.40338 2.21588C8.56161 2.05764 8.77622 1.96875 9 1.96875C9.22378 1.96875 9.43839 2.05764 9.59662 2.21588C9.75485 2.37411 9.84375 2.58872 9.84375 2.8125V8.15625H15.1875C15.4113 8.15625 15.6259 8.24514 15.7841 8.40338C15.9424 8.56161 16.0312 8.77622 16.0312 9Z" fill="white"/>
              </svg>
              <span>Añadir Ubicación</span>
            </button>
          </div>
        </div>

        {/* Locations Table Card */}
        <div className="locations-table-card">
          <div className="locations-header">
            <div className="header-with-badge">
              <h2 className="card-heading">Ubicaciones del Producto</h2>
              <div className="count-badge">
                <span>{totalLocations || locations.length} ubicaciones</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando ubicaciones...</p>
            </div>
          ) : locations.length === 0 ? (
            <div className="empty-state">
              <p>No hay ubicaciones registradas para este producto</p>
              <span>Añade la primera ubicación usando el formulario anterior</span>
            </div>
          ) : (

          <div className="locations-table">
            <div className="table-header">
              <div>PASILLO</div>
              <div>LADO</div>
              <div>UBICACIÓN</div>
              <div>ALTURA</div>
              <div>STOCK ACTUAL</div>
              <div>ACCIONES</div>
            </div>

            <div className="table-body">
              {locations.map((location) => (
                <div key={location.id} className="table-row">
                  <div className="table-cell pasillo-cell">
                    <span className="cell-value">{location.pasillo}</span>
                  </div>

                  <div className="table-cell lado-cell">
                    <div className="lado-badge">
                      <span>{location.lado}</span>
                    </div>
                  </div>

                  <div className="table-cell ubicacion-cell">
                    <span className="cell-value">{location.ubicacion}</span>
                    <span className="cell-label">{location.zona}</span>
                  </div>

                  <div className="table-cell altura-cell">
                    <span className="cell-value">{location.altura}</span>
                  </div>

                  <div className="table-cell stock-cell">
                    <div className="stock-indicator">
                      <div className="stock-bar-container">
                        <div className="stock-bar-bg">
                          <div 
                            className="stock-bar-fill-loc" 
                            style={{ 
                              width: `${Math.min(location.stockPercent, 100)}%`,
                              background: getStockColor(location.stockStatus)
                            }}
                          ></div>
                        </div>
                        <span className="stock-text" style={{ color: getStockTextColor(location.stockStatus) }}>
                          {location.stockActual}/{location.stockMax}
                        </span>
                      </div>
                      <span className="stock-min-text">
                        Mín: {location.stockMin} unidades{location.stockStatus === 'low' ? ' - ⚠️ Bajo' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="table-cell actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(location)}
                        disabled={isLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14.2069 4.5861L11.4144 1.79297C11.3215 1.70009 11.2113 1.62641 11.0899 1.57614C10.9686 1.52587 10.8385 1.5 10.7072 1.5C10.5759 1.5 10.4458 1.52587 10.3245 1.57614C10.2031 1.62641 10.0929 1.70009 10 1.79297L2.29313 9.50047C2.19987 9.593 2.12593 9.70313 2.0756 9.82448C2.02528 9.94584 1.99959 10.076 2.00001 10.2073V13.0005C2.00001 13.2657 2.10536 13.52 2.2929 13.7076C2.48043 13.8951 2.73479 14.0005 3.00001 14.0005H5.79313C5.9245 14.0009 6.05464 13.9752 6.17599 13.9249C6.29735 13.8746 6.40748 13.8006 6.50001 13.7073L14.2069 6.00047C14.2998 5.90761 14.3734 5.79736 14.4237 5.67602C14.474 5.55468 14.4999 5.42463 14.4999 5.29329C14.4999 5.16195 14.474 5.03189 14.4237 4.91055C14.3734 4.78921 14.2998 4.67896 14.2069 4.5861ZM3.20688 10.0005L8.50001 4.70735L9.54313 5.75047L4.25001 11.043L3.20688 10.0005ZM3.00001 11.2073L4.79313 13.0005H3.00001V11.2073ZM6.00001 12.7936L4.95688 11.7505L10.25 6.45735L11.2931 7.50047L6.00001 12.7936ZM12 6.7936L9.20688 4.00047L10.7069 2.50047L13.5 5.29297L12 6.7936Z" fill="#4A5568"/>
                        </svg>
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteClick(location)}
                        disabled={isLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.5 3H11V2.5C11 2.10218 10.842 1.72064 10.5607 1.43934C10.2794 1.15804 9.89782 1 9.5 1H6.5C6.10218 1 5.72064 1.15804 5.43934 1.43934C5.15804 1.72064 5 2.10218 5 2.5V3H2.5C2.36739 3 2.24021 3.05268 2.14645 3.14645C2.05268 3.24021 2 3.36739 2 3.5C2 3.63261 2.05268 3.75979 2.14645 3.85355C2.24021 3.94732 2.36739 4 2.5 4H3V13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H12C12.2652 14 12.5196 13.8946 12.7071 13.7071C12.8946 13.5196 13 13.2652 13 13V4H13.5C13.6326 4 13.7598 3.94732 13.8536 3.85355C13.9473 3.75979 14 3.63261 14 3.5C14 3.36739 13.9473 3.24021 13.8536 3.14645C13.7598 3.05268 13.6326 3 13.5 3ZM6 2.5C6 2.36739 6.05268 2.24021 6.14645 2.14645C6.24021 2.05268 6.36739 2 6.5 2H9.5C9.63261 2 9.75979 2.05268 9.85355 2.14645C9.94732 2.24021 10 2.36739 10 2.5V3H6V2.5ZM12 13H4V4H12V13ZM7 6.5V10.5C7 10.6326 6.94732 10.7598 6.85355 10.8536C6.75979 10.9473 6.63261 11 6.5 11C6.36739 11 6.24021 10.9473 6.14645 10.8536C6.05268 10.7598 6 10.6326 6 10.5V6.5C6 6.36739 6.05268 6.24021 6.14645 6.14645C6.24021 6.05268 6.36739 6 6.5 6C6.63261 6 6.75979 6.05268 6.85355 6.14645C6.94732 6.24021 7 6.36739 7 6.5ZM10 6.5V10.5C10 10.6326 9.94732 10.7598 9.85355 10.8536C9.75979 10.9473 9.63261 11 9.5 11C9.36739 11 9.24021 10.9473 9.14645 10.8536C9.05268 10.7598 9 10.6326 9 10.5V6.5C9 6.36739 9.05268 6.24021 9.14645 6.14645C9.24021 6.05268 9.36739 6 9.5 6C9.63261 6 9.75979 6.05268 9.85355 6.14645C9.94732 6.24021 10 6.36739 10 6.5Z" fill="#E74C3C"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {showEditModal && editingLocation && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Ubicación</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Pasillo</label>
                <select 
                  className="form-select"
                  value={editingLocation.pasillo}
                  onChange={(e) => setEditingLocation({...editingLocation, pasillo: e.target.value})}
                >
                  {PASILLOS_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Lado</label>
                <select 
                  className="form-select"
                  value={editingLocation.lado}
                  onChange={(e) => setEditingLocation({...editingLocation, lado: e.target.value})}
                >
                  {LADOS_OPTIONS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ubicación</label>
                <input 
                  type="text"
                  className="form-input-field"
                  value={editingLocation.ubicacion}
                  onChange={(e) => setEditingLocation({...editingLocation, ubicacion: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Altura</label>
                <select 
                  className="form-select"
                  value={editingLocation.altura}
                  onChange={(e) => setEditingLocation({...editingLocation, altura: e.target.value})}
                >
                  {ALTURAS_OPTIONS.map(a => (
                    <option key={a} value={`Nivel ${a}`}>Nivel {a}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Stock Mínimo</label>
                <input 
                  type="number"
                  className="form-input-field"
                  value={editingLocation.stockMinimo}
                  onChange={(e) => setEditingLocation({...editingLocation, stockMinimo: e.target.value})}
                  min="0"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancelar
              </button>
              <button className="modal-btn-save" onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PickingRoute
