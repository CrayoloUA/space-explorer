import { useState } from 'react'
import { useMarsRover } from '../hooks/useNASA'

export default function MarsGallery() {
  const [page, setPage] = useState(1)
  const { data, loading, error } = useMarsRover(page)

  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-error)' }}>
      🛸 Error cargando fotos de Marte: {error}
    </div>
  )

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
          🔴 Marte — Rover Curiosity
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Sol 1000 · Fotos reales desde la superficie marciana</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
          {data.slice(0, 8).map(photo => (
            <div key={photo.id} style={{
              aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-border)', position: 'relative', background: 'var(--color-surface-offset)',
            }}>
              <img src={photo.img_src} alt={`Mars sol ${photo.sol}`} loading="lazy"
                width="200" height="200"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(30%)' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 'var(--space-2) var(--space-3)',
                background: 'linear-gradient(transparent, rgba(5,8,16,0.85))',
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              }}>
                {photo.camera.full_name}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
          padding: 'var(--space-2) var(--space-5)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: page === 1 ? 'transparent' : 'var(--color-surface-2)',
          color: page === 1 ? 'var(--color-text-faint)' : 'var(--color-text)',
          fontSize: 'var(--text-sm)',
        }}>← Anterior</button>
        <span style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Página {page}
        </span>
        <button onClick={() => setPage(p => p + 1)} style={{
          padding: 'var(--space-2) var(--space-5)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(99,179,237,0.3)',
          background: 'rgba(99,179,237,0.08)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-sm)',
        }}>Siguiente →</button>
      </div>
    </section>
  )
}