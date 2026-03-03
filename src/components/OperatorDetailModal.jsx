/**
 * Modal para ver detalles de un operario
 */
function OperatorDetailModal({
  show,
  loading,
  operator,
  onClose,
}) {
  if (!show) return null

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
              <circle cx="12" cy="12" r="10" stroke="#3B82F6" strokeWidth="2" strokeDasharray="15 10" fill="none" />
            </svg>
            <p style={{ marginTop: '1rem', color: '#64748B' }}>Cargando detalles...</p>
          </div>
        ) : operator ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1E293B' }}>Detalle del Operario</h2>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Código de Operario</label>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1E293B' }}>{operator.code}</div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Nombre Completo</label>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#1E293B' }}>{operator.name}</div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Estado</label>
                <div className={`operator-status-badge ${operator.statusClass}`} style={{ display: 'inline-block' }}>
                  {operator.status}
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Tiempo Registrado</label>
                <div style={{ fontSize: '1rem', color: '#1E293B' }}>{operator.registeredTime}</div>
              </div>
              
              {operator._raw && (
                <>
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Fecha de Creación</label>
                    <div style={{ fontSize: '0.875rem', color: '#1E293B' }}>
                      {new Date(operator._raw.created_at).toLocaleString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '0.875rem', color: '#64748B', display: 'block', marginBottom: '0.5rem' }}>Última Actualización</label>
                    <div style={{ fontSize: '0.875rem', color: '#1E293B' }}>
                      {new Date(operator._raw.updated_at).toLocaleString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cerrar
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default OperatorDetailModal
