/**
 * Modal para editar un operario existente
 */
function OperatorEditModal({
  show,
  operator,
  formData,
  setFormData,
  formErrors,
  submitting,
  onSubmit,
  onClose,
}) {
  if (!show || !operator) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1E293B' }}>Editar Operario</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Código de operario (solo lectura) */}
          <div>
            <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>
              Código de Operario
            </label>
            <input
              type="text"
              value={operator.code}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                cursor: 'not-allowed'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
              El código no puede ser modificado
            </p>
          </div>
          
          {/* Nombre */}
          <div>
            <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: formErrors.nombre ? '1px solid #EF4444' : '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
              placeholder="Nombre completo del operario"
            />
            {formErrors.nombre && (
              <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formErrors.nombre}
              </p>
            )}
          </div>
          
          {/* Estado */}
          <div>
            <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>
              Estado del Operario
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div 
                className={`toggle-switch ${formData.activo ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                style={{ cursor: 'pointer' }}
              >
                <div className="toggle-thumb"></div>
              </div>
              <span style={{ fontSize: '0.875rem', color: formData.activo ? '#10B981' : '#64748B' }}>
                {formData.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          
          {/* Error general */}
          {formErrors.general && (
            <div style={{ padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '8px', color: '#991B1B', fontSize: '14px' }}>
              {formErrors.general}
            </div>
          )}
          
          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'white',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: submitting ? '#94A3B8' : '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OperatorEditModal
