import { useState } from 'react'
import { useMarsRover } from '../hooks/useNASA'

const SOL_PRESETS = [
  { label: 'Sol 100', value: 100 },
  { label: 'Sol 500', value: 500 },
  { label: 'Sol 1000', value: 1000 },
  { label: 'Sol 1500', value: 1500 },
  { label: 'Sol 2000', value: 2000 },
  { label: 'Sol 2500', value: 2500 },
  { label: 'Sol 3000', value: 3000 },
  { label: 'Sol 3500', value: 3500 },
]

export default function MarsGallery({ language = 'es' }) {
  const [page, setPage] = useState(1)
  const [sol, setSol] = useState(1000)
  const { data, loading, error, resolvedSol } = useMarsRover(page, sol)

  const t = {
    es: {
      title: '\uD83D\uDD34 Marte \u2014 Rover Curiosity',
      subtitle: 'Fotos reales desde la superficie marciana',
      page: 'P\u00e1gina',
      prev: '\u2190 Anterior',
      next: 'Siguiente \u2192',
      error: 'No se encontraron fotos.',
      solLabel: 'Sol marciano',
      photos: 'fotos',
      camera: 'C\u00e1mara',
      searching: 'Buscando fotos...',
      fallback: 'Sin fotos en sol {sol}, mostrando sol {resolved}',
      custom: 'Personalizado',
    },
    en: {
      title: '\uD83D\uDD34 Mars \u2014 Curiosity Rover',
      subtitle: 'Real photos from the Martian surface',
      page: 'Page',
      prev: '\u2190 Previous',
      next: 'Next \u2192',
      error: 'No photos found.',
      solLabel: 'Martian Sol',
      photos: 'photos',
      camera: 'Camera',
      searching: 'Searching photos...',
      fallback: 'No photos on sol {sol}, showing sol {resolved}',
      custom: 'Custom',
    }
  }[language]

  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-error)' }}>
      \uD83D\uDEF8 {t.error}
    </div>
  )

  return (
    <section>
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.subtitle}</p>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>{t.solLabel}</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {SOL_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => { setSol(p.value); setPage(1) }}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  border: sol === p.value ? '1px solid rgba(99,179,237,0.5)' : '1px solid var(--color-border)',
                  background: sol === p.value ? 'rgba(99,179,237,0.12)' : 'var(--color-surface)',
                  color: sol === p.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)', cursor: 'pointer'
                }}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </div>

      {!loading && resolvedSol !== sol && (
        <div style={{
          marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
          background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.2)',
          borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)'
        }}>
          \u2139\ufe0f {t.fallback.replace('{sol}', sol).replace('{resolved}', resolvedSol)}
        </div>
      )}

      {!loading && data.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)' }}>{data.length} {t.photos}</span>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>\u00b7</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{t.camera}: {data[0]?.camera?.full_name}</span>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>\u00b7</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>{data[0]?.earth_date}</span>
        </div>
      )}

      {loading ? (
        <>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>\u23f3 {t.searching}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)' }} />)}
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 'var(--space-3)' }}>
          {data.slice(0, 12).map(photo => (
            <div key={photo.id} style={{
              aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-border)', position: 'relative', background: 'var(--color-surface-offset)',
            }}>
              <img src={photo.img_src} alt={`Mars sol ${resolvedSol}`} loading="lazy"
                width="200" height="200"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(25%) saturate(0.8)' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: 'var(--space-2) var(--space-3)',
                background: 'linear-gradient(transparent, rgba(5,8,16,0.85))',
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              }}>{photo.camera.full_name}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'center', alignItems: 'center' }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
          padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          background: page === 1 ? 'transparent' : 'var(--color-surface-2)',
          color: page === 1 ? 'var(--color-text-faint)' : 'var(--color-text)', fontSize: 'var(--text-sm)',
        }}>{t.prev}</button>
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
