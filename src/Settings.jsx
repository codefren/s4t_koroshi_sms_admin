import { useState, useEffect } from 'react'
import './Settings.css'
import { almacenService } from './services/almacenService'

const TIPO_OPTIONS = [
  { value: 'picking', label: 'Almacén de Picking' },
  { value: 'reposicion', label: 'Almacén de Reposición' },
  { value: 'playa', label: 'Zona de Playa' },
]

const TIPO_LABELS = {
  picking: 'Almacén de Picking',
  reposicion: 'Almacén de Reposición',
  playa: 'Zona de Playa',
}

const TIPO_COLORS = {
  picking: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
  reposicion: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  playa: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
}

const EMPTY_FORM = {
  descripcion: '',
  tipo: 'picking',
  pasillos: '',
  ubicaciones_largo: '',
  alturas: '',
}

function Settings() {
  const [almacenes, setAlmacenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAlmacenes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await almacenService.getAll()
      setAlmacenes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      console.error('Error al cargar almacenes:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlmacenes()
  }, [])

  const needsDimensions = (tipo) => tipo === 'picking' || tipo === 'reposicion'

  const validate = () => {
    const errors = {}
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida'
    }
    if (!formData.tipo) {
      errors.tipo = 'Seleccione un tipo de almacén'
    }
    if (needsDimensions(formData.tipo)) {
      if (!formData.pasillos || Number(formData.pasillos) < 1) {
        errors.pasillos = 'Debe tener al menos 1 pasillo'
      }
      if (!formData.ubicaciones_largo || Number(formData.ubicaciones_largo) < 1) {
        errors.ubicaciones_largo = 'Debe tener al menos 1 ubicación'
      }
      if (!formData.alturas || Number(formData.alturas) < 1) {
        errors.alturas = 'Debe tener al menos 1 nivel de altura'
      }
    }
    return errors
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleTipoChange = (tipo) => {
    setFormData(prev => ({
      ...prev,
      tipo,
      pasillos: tipo === 'playa' ? '' : prev.pasillos,
      ubicaciones_largo: tipo === 'playa' ? '' : prev.ubicaciones_largo,
      alturas: tipo === 'playa' ? '' : prev.alturas,
    }))
    setFormErrors({})
  }

  const openCreateForm = () => {
    setFormData({ ...EMPTY_FORM })
    setFormErrors({})
    setEditingId(null)
    setShowForm(true)
  }

  const openEditForm = (almacen) => {
    setFormData({
      descripcion: almacen.descripciones || almacen.descripcion || '',
      tipo: almacen.tipo || 'picking',
      pasillos: almacen.pasillos || '',
      ubicaciones_largo: almacen.ubicaciones_largo || '',
      alturas: almacen.alturas || '',
    })
    setFormErrors({})
    setEditingId(almacen.id)
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setFormData({ ...EMPTY_FORM })
    setFormErrors({})
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      descripcion: formData.descripcion.trim(),
      tipo: formData.tipo,
    }

    if (needsDimensions(formData.tipo)) {
      payload.pasillos = Number(formData.pasillos)
      payload.ubicaciones_largo = Number(formData.ubicaciones_largo)
      payload.alturas = Number(formData.alturas)
    }

    try {
      setSubmitting(true)
      if (editingId) {
        await almacenService.update(editingId, payload)
      } else {
        await almacenService.create(payload)
      }
      cancelForm()
      await fetchAlmacenes()
    } catch (err) {
      setFormErrors({ _general: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeleting(true)
      await almacenService.delete(id)
      setDeletingId(null)
      await fetchAlmacenes()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const getTotalUbicaciones = (almacen) => {
    if (almacen.tipo === 'playa') return 1
    const p = almacen.pasillos || 0
    const u = almacen.ubicaciones_largo || 0
    const a = almacen.alturas || 0
    return p * u * a * 2
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-info">
          <div className="settings-breadcrumb">
            <span className="settings-breadcrumb-item">Sistema</span>
            <span className="settings-breadcrumb-sep">/</span>
            <span className="settings-breadcrumb-active">Configuración</span>
          </div>
          <h1 className="settings-title">Gestión de Almacenes</h1>
          <p className="settings-subtitle">Crea y administra los almacenes del sistema, define tipo y dimensiones.</p>
        </div>
        {!showForm && (
          <button className="settings-btn-primary" onClick={openCreateForm}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Nuevo Almacén
          </button>
        )}
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* Form */}
        {showForm && (
          <div className="settings-form-card">
            <div className="settings-form-header">
              <h2 className="settings-form-title">{editingId ? 'Editar Almacén' : 'Nuevo Almacén'}</h2>
              <button className="settings-btn-close" onClick={cancelForm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {formErrors._general && (
              <div className="settings-form-error-banner">{formErrors._general}</div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
              {/* Tipo selector */}
              <div className="settings-field">
                <label className="settings-label">Tipo de Almacén</label>
                <div className="settings-tipo-grid">
                  {TIPO_OPTIONS.map(opt => {
                    const colors = TIPO_COLORS[opt.value]
                    const isActive = formData.tipo === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`settings-tipo-btn ${isActive ? 'active' : ''}`}
                        style={isActive ? { background: colors.bg, borderColor: colors.border, color: colors.text } : {}}
                        onClick={() => handleTipoChange(opt.value)}
                      >
                        {opt.value === 'picking' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        )}
                        {opt.value === 'reposicion' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4H8V8H4V4ZM4 10H8V14H4V10ZM4 16H8V20H4V16ZM10 4H14V8H10V4ZM10 10H14V14H10V10ZM10 16H14V20H10V16ZM16 4H20V8H16V4ZM16 10H20V14H16V10ZM16 16H20V20H16V16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        )}
                        {opt.value === 'playa' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 18H21M3 18H5M13 6V6.01M17.5 10.5L17.51 10.51M8 6L8.01 6.01M3 12H7L12 6L17 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                        <span>{opt.label}</span>
                      </button>
                    )
                  })}
                </div>
                {formErrors.tipo && <span className="settings-field-error">{formErrors.tipo}</span>}
              </div>

              {/* Descripción */}
              <div className="settings-field">
                <label className="settings-label">Descripción / Nombre</label>
                <input
                  type="text"
                  className={`settings-input ${formErrors.descripcion ? 'error' : ''}`}
                  placeholder="Ej: Almacén Principal Planta 1"
                  value={formData.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                />
                {formErrors.descripcion && <span className="settings-field-error">{formErrors.descripcion}</span>}
              </div>

              {/* Dimensiones (solo picking/reposicion) */}
              {needsDimensions(formData.tipo) && (
                <div className="settings-dimensions">
                  <div className="settings-dimensions-title">Dimensiones del Almacén</div>
                  <div className="settings-dim-grid">
                    <div className="settings-field">
                      <label className="settings-label">Pasillos</label>
                      <input
                        type="number"
                        min="1"
                        className={`settings-input ${formErrors.pasillos ? 'error' : ''}`}
                        placeholder="Ej: 11"
                        value={formData.pasillos}
                        onChange={(e) => handleChange('pasillos', e.target.value)}
                      />
                      {formErrors.pasillos && <span className="settings-field-error">{formErrors.pasillos}</span>}
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">Ubicaciones a lo largo</label>
                      <input
                        type="number"
                        min="1"
                        className={`settings-input ${formErrors.ubicaciones_largo ? 'error' : ''}`}
                        placeholder="Ej: 100"
                        value={formData.ubicaciones_largo}
                        onChange={(e) => handleChange('ubicaciones_largo', e.target.value)}
                      />
                      {formErrors.ubicaciones_largo && <span className="settings-field-error">{formErrors.ubicaciones_largo}</span>}
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">Alturas (niveles)</label>
                      <input
                        type="number"
                        min="1"
                        className={`settings-input ${formErrors.alturas ? 'error' : ''}`}
                        placeholder="Ej: 5"
                        value={formData.alturas}
                        onChange={(e) => handleChange('alturas', e.target.value)}
                      />
                      {formErrors.alturas && <span className="settings-field-error">{formErrors.alturas}</span>}
                    </div>
                  </div>
                  {needsDimensions(formData.tipo) && formData.pasillos && formData.ubicaciones_largo && formData.alturas && (
                    <div className="settings-dim-summary">
                      Total estimado: <strong>{Number(formData.pasillos) * Number(formData.ubicaciones_largo) * Number(formData.alturas) * 2}</strong> ubicaciones
                      ({formData.pasillos} pasillos × {formData.ubicaciones_largo} largo × {formData.alturas} alturas × 2 lados)
                    </div>
                  )}
                </div>
              )}

              {/* Playa info */}
              {formData.tipo === 'playa' && (
                <div className="settings-playa-info">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span>La Zona de Playa es un área de carga/descarga sin espacios específicos. Se registra como una ubicación única.</span>
                </div>
              )}

              {/* Actions */}
              <div className="settings-form-actions">
                <button type="button" className="settings-btn-secondary" onClick={cancelForm} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="settings-btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Almacén'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="settings-error-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="settings-loading">
            <div className="settings-spinner"></div>
            <span>Cargando almacenes...</span>
          </div>
        ) : almacenes.length === 0 && !showForm ? (
          <div className="settings-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M3 21L21 21M3 7V21M21 7V21M6 3H18C19.1046 3 20 3.89543 20 5V7H4V5C4 3.89543 4.89543 3 6 3Z" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <h3>No hay almacenes configurados</h3>
            <p>Crea tu primer almacén para comenzar a gestionar ubicaciones.</p>
            <button className="settings-btn-primary" onClick={openCreateForm}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Crear Almacén
            </button>
          </div>
        ) : (
          /* Almacenes list */
          <div className="settings-grid">
            {almacenes.map(almacen => {
              const tipo = almacen.tipo || 'picking'
              const colors = TIPO_COLORS[tipo] || TIPO_COLORS.picking
              const isDeleting = deletingId === almacen.id

              return (
                <div key={almacen.id} className="settings-card">
                  <div className="settings-card-header">
                    <span
                      className="settings-card-badge"
                      style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
                    >
                      {TIPO_LABELS[tipo] || tipo}
                    </span>
                    <div className="settings-card-actions">
                      <button className="settings-card-btn" title="Editar" onClick={() => openEditForm(almacen)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      {isDeleting ? (
                        <div className="settings-delete-confirm">
                          <span>Eliminar?</span>
                          <button className="settings-delete-yes" onClick={() => handleDelete(almacen.id)} disabled={deleting}>
                            {deleting ? '...' : 'Sí'}
                          </button>
                          <button className="settings-delete-no" onClick={() => setDeletingId(null)}>No</button>
                        </div>
                      ) : (
                        <button className="settings-card-btn settings-card-btn-danger" title="Eliminar" onClick={() => setDeletingId(almacen.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="settings-card-name">{almacen.descripciones || almacen.descripcion || almacen.codigo || `Almacén #${almacen.id}`}</h3>
                  {tipo !== 'playa' ? (
                    <div className="settings-card-dims">
                      <div className="settings-card-dim">
                        <span className="settings-card-dim-value">{almacen.pasillos || '—'}</span>
                        <span className="settings-card-dim-label">Pasillos</span>
                      </div>
                      <div className="settings-card-dim">
                        <span className="settings-card-dim-value">{almacen.ubicaciones_largo || '—'}</span>
                        <span className="settings-card-dim-label">Largo</span>
                      </div>
                      <div className="settings-card-dim">
                        <span className="settings-card-dim-value">{almacen.alturas || '—'}</span>
                        <span className="settings-card-dim-label">Alturas</span>
                      </div>
                      <div className="settings-card-dim">
                        <span className="settings-card-dim-value">{getTotalUbicaciones(almacen).toLocaleString()}</span>
                        <span className="settings-card-dim-label">Total Ubic.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="settings-card-playa">
                      <span>Ubicación única · Zona de carga/descarga</span>
                    </div>
                  )}
                  <div className="settings-card-footer">
                    <span className="settings-card-id">ID: {almacen.id}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings
