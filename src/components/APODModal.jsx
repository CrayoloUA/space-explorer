import { useEffect } from 'react'

export default function APODModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  if (!item) return null

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5,8,16,0.88)', backdropFilter: 'blur(10px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      <div style={{
        background: 'var(--color-surface)', border: '1px solid rgba(99,179,237,0.2)',
        borderRadius: 'var(--radius-xl)', maxWidth: 900, width: '100%',
        maxHeight: '90dvh', overflowY: 'auto', position: 'relative',
      }}>
        <button onClick={onClose} aria-label="Cerrar" style={{
          position: 'sticky', top: 'var(--space-4)', float: 'right',
          margin: 'var(--space-4) var(--space-4) 0 0',
          width: 36, height: 36, borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        }}>✕</button>

        <div style={{ padding: 'var(--space-6)' }}>
          {item.media_type === 'video' ? (
            <div style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-6)', background: 'var(--color-surface-offset)' }}>
              <iframe src={item.url} title={item.title} allowFullScreen frameBorder="0" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <img src={item.hdurl || item.url} alt={item.title} loading="lazy"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', maxHeight: 500, objectFit: 'contain', background: 'var(--color-surface-offset)' }} />
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            {[item.date, item.copyright && `© ${item.copyright}`].filter(Boolean).map((t, i) => (
              <span key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', background: 'rgba(99,179,237,0.08)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99,179,237,0.15)' }}>{t}</span>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
            {item.title}
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
            {item.explanation}
          </p>
        </div>
      </div>
    </div>
  )
}