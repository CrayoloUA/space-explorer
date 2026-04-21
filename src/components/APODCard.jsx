import { useState } from 'react'

export default function APODCard({ item, onClick }) {
  const [imgError, setImgError] = useState(false)
  const isVideo = item.media_type === 'video'

  return (
    <article onClick={() => onClick(item)} style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'transform var(--transition), box-shadow var(--transition)',
      display: 'flex',
      flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--color-surface-offset)' }}>
        {isVideo ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', background: 'linear-gradient(135deg, var(--color-surface-offset), var(--color-accent))' }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.8 }}>▶</span>
            <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>Video</span>
          </div>
        ) : imgError ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--color-text-faint)' }}>
            <span style={{ fontSize: '2.5rem' }}>🌌</span>
            <span style={{ fontSize: 'var(--text-xs)' }}>No disponible</span>
          </div>
        ) : (
          <img src={item.url} alt={item.title} loading="lazy" width="400" height="225"
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <span style={{
          position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)',
          background: 'rgba(5,8,16,0.75)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
          padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)',
          color: 'var(--color-primary)', fontFamily: 'var(--font-display)',
        }}>{item.date}</span>
      </div>
      <div style={{ padding: 'var(--space-4) var(--space-5)', flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.explanation?.slice(0, 130)}...
        </p>
        {item.copyright && (
          <span style={{ display: 'block', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            © {item.copyright}
          </span>
        )}
      </div>
    </article>
  )
}