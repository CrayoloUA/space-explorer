import { useState } from 'react'          // hook para manejar página y sol seleccionados
import { useMarsRover } from '../hooks/useNASA'  // hook que descarga las fotos de Marte

// opciones de sols marcianos disponibles para explorar
const SOL_PRESETS = [
  { label: 'Sol 50', value: 50 },
  { label: 'Sol 100', value: 100 },
  { label: 'Sol 500', value: 500 },
  { label: 'Sol 800', value: 800 },
  { label: 'Sol 1000', value: 1000 },
  { label: 'Sol 1200', value: 1200 },
  { label: 'Sol 1500', value: 1500 },
  { label: 'Sol 1800', value: 1800 },
]

// galería de fotos del rover Perseverance en Marte con selector de sol y paginación
export default function MarsGallery({ language = 'es' }) {
  const [page, setPage] = useState(1)      // página actual de resultados
  const [sol, setSol] = useState(1000)     // sol marciano seleccionado (día en Marte)
  const { data, loading, error, resolvedSol } = useMarsRover(page, sol)  // obtiene fotos del hook

  const t = {
    es: {
      title: '🔴 Marte — Rover Perseverance',
      subtitle: 'Fotos reales desde la superficie marciana',
      page: 'Página',
      prev: '← Anterior',
      next: 'Siguiente →',
      error: 'No se encontraron fotos.',
      solLabel: 'Sol marciano',
      photos: 'fotos',
      camera: 'Cámara',
      searching: 'Buscando fotos...',
      fallback: 'Sin fotos en sol {sol}, mostrando sol {resolved}',  // mensaje cuando se usó un sol alternativo
      custom: 'Personalizado',
    },
    en: {
      title: '🔴 Mars — Perseverance Rover',
      subtitle: 'Real photos from the Martian surface',
      page: 'Page',
      prev: '← Previous',
      next: 'Next →',
      error: 'No photos found.',
      solLabel: 'Martian Sol',
      photos: 'photos',
      camera: 'Camera',
      searching: 'Searching photos...',
      fallback: 'No photos on sol {sol}, showing sol {resolved}',
      custom: 'Custom',
    }
  }[language]  // textos según el idioma

  // si hay error, muestra mensaje y enlace para obtener API key
  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🛸</div>
      <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }}>
        {language === 'es' ? 'Sin señal de Marte' : 'No Mars signal'}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: '42ch', margin: '0 auto var(--space-6)' }}>
        {error}
      </p>
      {/* enlace a NASA API para que el usuario pueda obtener su propia clave */}
      <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer"
        style={{ display: 'inline-block', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99,179,237,0.4)', background: 'rgba(99,179,237,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>
        {language === 'es' ? '🔑 Obtener API Key gratis' : '🔑 Get free API Key'}
      </a>
    </div>
  )

  return (
    <section>
      {/* encabezado con título y selector de sol marciano */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.subtitle}</p>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>{t.solLabel}</label>
          {/* botones de sol: cada uno cambia el sol activo y resetea a la página 1 */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {SOL_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { setSol(p.value); setPage(1) }}  // cambia sol y vuelve a página 1
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  border: sol === p.value ? '1px solid rgba(99,179,237,0.5)' : '1px solid var(--color-border)',   // resalta el sol activo
                  background: sol === p.value ? 'rgba(99,179,237,0.12)' : 'var(--color-surface)',
                  color: sol === p.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)', cursor: 'pointer'
                }}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* aviso cuando el sol pedido no tenía fotos y se usó uno alternativo */}
      {!loading && resolvedSol !== sol && (
        <div style={{
          marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)'
        }}>
          ℹ️ {t.fallback.replace('{sol}', sol).replace('{resolved}', resolvedSol)}  {/* reemplaza los placeholders con los valores reales */}
        </div>
      )}

      {/* barra de metadatos: cantidad de fotos, cámara y fecha */}
      {!loading && data.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>{data.length} {t.photos}</span>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>·</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.camera}: {data[0]?.camera?.full_name}</span>  {/* cámara de la primera foto */}
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>·</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{data[0]?.earth_date}</span>  {/* fecha terrestre de la primera foto */}
        </div>
      )}

      {loading ? (
        // esqueletos de carga mientras llegan las fotos
        <>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>⏳ {t.searching}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />)}  {/* 8 placeholders animados */}
          </div>
        </>
      ) : (
        // grilla de fotos reales; muestra máximo 12
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
          {data.slice(0, 12).map(photo => (
            <div key={photo.id} style={{
              aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-border)', position: 'relative', background: 'var(--color-surface-offset)',
            }}>
              {/* foto de Marte con filtro sépia para dar tono marciano */}
              <img src={photo.img_src} alt={`Mars sol ${resolvedSol}`} loading="lazy"
                width="200" height="200"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(25%) saturate(0.8)' }} />
              {/* overlay inferior con el nombre de la cámara */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 'var(--space-2) var(--space-3)',
                background: 'linear-gradient(transparent, rgba(5,8,16,0.85))',  // degradado oscuro de abajo
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              }}>{photo.camera.full_name}</div>
            </div>
          ))}
        </div>
      )}

      {/* controles de paginación: botones anterior y siguiente */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: page === 1 ? 'transparent' : 'var(--color-surface-2)',  // gris cuando está deshabilitado
          color: page === 1 ? 'var(--color-text-faint)' : 'var(--color-text)', fontSize: 'var(--text-sm)',
        }}>{t.prev}</button>
        {/* indicador de página actual */}
        <span style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{t.page} {page}</span>
        <button onClick={() => setPage(p => p + 1)} style={{
          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(99,179,237,0.3)', background: 'rgba(99,179,237,0.08)',
          color: 'var(--color-primary)', fontSize: 'var(--text-sm)',
        }}>{t.next}</button>
      </div>
    </section>
  )
}
