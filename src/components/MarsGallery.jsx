import { useState } from 'react'
import { useMarsRover } from '../hooks/useNASA'

export default function MarsGallery({ language = 'es' }) {
  const [page, setPage] = useState(1)
  const [earthDate, setEarthDate] = useState('2022-01-01')
  const { data, loading, error, resolvedDate } = useMarsRover(page, earthDate)

  const t = {
    es: {
      title: '🔴 Marte — Rover Curiosity',
      subtitle: 'Fotos reales desde la superficie marciana',
      page: 'Página',
      prev: '← Anterior',
      next: 'Siguiente →',
      error: 'No se encontraron fotos para ninguna fecha disponible',
      date: 'Fecha terrestre',
      photos: 'fotos',
      camera: 'Cámara',
      noResults: 'Sin fotos para esa fecha. Probando fechas alternativas...',
      fallbackNote: 'Mostrando fotos del',
      searching: 'Buscando fotos...',
    },
    en: {
      title: '🔴 Mars — Curiosity Rover',
      subtitle: 'Real photos from the Martian surface',
      page: 'Page',
      prev: '← Previous',
      next: 'Next →',
      error: 'No photos found for any available date',
      date: 'Earth date',
      photos: 'photos',
      camera: 'Camera',
      noResults: 'No photos for that date. Trying fallback dates...',
      fallbackNote: 'Showing photos from',
      searching: 'Searching photos...',
    }
  }[language]

  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-error)' }}>
      🛸 {t.error}
    </div>
  )

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
            {t.title}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.subtitle}</p>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>{t.date}</label>
          <input
            type="date"
            value={earthDate}
            min="2012-08-06"
            max="2024-12-31"
            onChange={(e) => { setEarthDate(e.target.value); setPage(1) }}
            style={{
              padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)'
            }}
          />
        </div>
      </div>

      {/* Aviso si se usó una fecha fallback distinta a la elegida */}
      {!loading && resolvedDate && resolvedDate !== earthDate && (
        <div style={{
          marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)'
        }}>
          ℹ️ {t.fallbackNote} <strong>{resolvedDate}</strong>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>{data.length} {t.photos}</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.camera}: {data[0].camera.full_name}</span>
        </div>
      )}

      {loading ? (
        <>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>⏳ {t.searching}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        </>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>{t.noResults}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
          {data.slice(0, 8).map(photo => (
            <div key={photo.id} style={{
              aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-border)', position: 'relative', background: 'var(--color-surface-offset)',
            }}>
              <img src={photo.img_src} alt={`Mars ${photo.earth_date}`} loading="lazy"
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
          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: page === 1 ? 'transparent' : 'var(--color-surface-2)',
          color: page === 1 ? 'var(--color-text-faint)' : 'var(--color-text)',
          fontSize: 'var(--text-sm)',
        }}>{t.prev}</button>
        <span style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          {t.page} {page}
        </span>
        <button onClick={() => setPage(p => p + 1)} style={{
          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(99,179,237,0.3)',
          background: 'rgba(99,179,237,0.08)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-sm)',
        }}>{t.next}</button>
      </div>
    </section>
  )
}
