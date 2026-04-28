import { useState } from 'react'
import { useEpicImages } from '../hooks/useNASA'

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 'var(--space-5)' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '1' }} />
          <div style={{ padding: 'var(--space-4)' }}>
            <div className="skeleton" style={{ height: '0.9em', marginBottom: 'var(--space-2)' }} />
            <div className="skeleton" style={{ height: '0.9em', width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function EarthGallery({ language = 'es' }) {
  const { data, loading, error } = useEpicImages()
  const [selected, setSelected] = useState(null)

  const t = {
    es: {
      title: '🌍 Tierra desde el espacio',
      subtitle: 'Fotos reales de la Tierra completa tomadas por la cámara EPIC a 1.5 millones de km de distancia.',
      badge: 'NASA · EPIC API',
      coords: 'Coordenadas del centroide',
      open: 'Ver completa',
      close: 'Cerrar',
      error: 'No se pudieron cargar las imágenes.',
    },
    en: {
      title: '🌍 Earth from space',
      subtitle: 'Real full-Earth photos taken by the EPIC camera 1.5 million km away.',
      badge: 'NASA · EPIC API',
      coords: 'Centroid coordinates',
      open: 'View full',
      close: 'Close',
      error: 'Could not load images.',
    },
  }[language]

  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🛸</div>
      <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>{t.error}</p>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{error}</p>
    </div>
  )

  return (
    <section>
      {/* encabezado */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.badge}</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{t.title}</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', maxWidth: '60ch' }}>{t.subtitle}</p>
      </div>

      {loading ? <Skeleton /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 'var(--space-5)' }}>
          {data.map(img => (
            <article
              key={img.id}
              onClick={() => setSelected(img)}
              className="glass-panel-hover"
              style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'pointer' }}
            >
              {/* imagen miniatura cuadrada */}
              <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#000' }}>
                <img
                  src={img.thumbUrl}
                  alt={img.caption}
                  loading="lazy"
                  width="240"
                  height="240"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                />
              </div>

              {/* info */}
              <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>{img.date}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {img.caption}
                </p>
                {img.lat != null && (
                  <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                    {t.coords}: {img.lat}°, {img.lon}°
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* modal de imagen completa */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(4,7,13,0.92)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'var(--space-6)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 680, width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            <img
              src={selected.thumbUrl}
              alt={selected.caption}
              style={{ width: '100%', display: 'block' }}
            />
            <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
              <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>{selected.date}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>{selected.caption}</p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <a
                  href={selected.fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tab-btn active"
                  style={{ fontSize: 'var(--text-sm)' }}
                  onClick={e => e.stopPropagation()}
                >
                  {t.open} 2048×2048
                </a>
                <button onClick={() => setSelected(null)} className="tab-btn" style={{ fontSize: 'var(--text-sm)' }}>
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
