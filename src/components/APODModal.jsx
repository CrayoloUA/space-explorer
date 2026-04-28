import { useEffect } from 'react'  // hook para registrar eventos del teclado al montar el modal

// modal de detalle que muestra la imagen/video APOD en tamaño completo con descripción
export default function APODModal({ item, onClose, language = 'es' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }  // cierra el modal al presionar Escape
    document.addEventListener('keydown', onKey)                  // registra el listener de teclado
    document.body.style.overflow = 'hidden'                      // bloquea el scroll del fondo mientras el modal está abierto
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }  // cleanup: quita el listener y restaura el scroll
  }, [onClose])

  if (!item) return null  // no renderiza nada si no hay item seleccionado

  const t = {
    es: { close: 'Cerrar', openHd: 'Ver HD', copy: 'Copiar enlace', copied: 'Enlace copiado' },
    en: { close: 'Close', openHd: 'Open HD', copy: 'Copy link', copied: 'Link copied' },
  }[language]  // textos según el idioma activo

  // copia la URL de alta resolución al portapapeles y muestra un alert de confirmación
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.hdurl || item.url)  // prefiere la URL HD
      alert(t.copied)
    } catch {}  // silencia errores si el portapapeles no está disponible
  }

  return (
    // overlay oscuro que cubre toda la pantalla; click fuera del panel cierra el modal
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0,                              // cubre toda la ventana
      background: 'rgba(5,8,16,0.88)', backdropFilter: 'blur(10px)',  // fondo oscuro con desenfoque
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-4)',
    }}>
      {/* panel del modal con scroll interno */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid rgba(99,179,237,0.2)',
        borderRadius: 'var(--radius-xl)', maxWidth: 900, width: '100%',
        maxHeight: '90dvh', overflowY: 'auto', position: 'relative',  // limita altura y permite scroll
      }}>
        {/* botón X para cerrar, fijo en la esquina superior derecha del panel */}
        <button onClick={onClose} aria-label={t.close} style={{
          position: 'sticky', top: 'var(--space-4)', float: 'right',  // se queda visible al hacer scroll
          margin: 'var(--space-4) var(--space-4) 0 0',
          width: 36, height: 36, borderRadius: 'var(--radius-full)',
          background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
        }}>✕</button>

        <div style={{ padding: 'var(--space-6)' }}>
          {item.media_type === 'video' ? (
            // si es video, lo embebe en un iframe con proporción 16:9
            <div style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-6)', background: 'var(--color-surface-offset)' }}>
              <iframe src={item.url} title={item.title} allowFullScreen frameBorder="0" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            // si es imagen, muestra la versión HD (o normal si no hay HD)
            <img src={item.hdurl || item.url} alt={item.title} loading="lazy"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', maxHeight: 500, objectFit: 'contain', background: 'var(--color-surface-offset)' }} />
          )}

          {/* badges con la fecha y copyright de la imagen */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            {[item.date, item.copyright && `© ${item.copyright}`].filter(Boolean).map((t, i) => (
              <span key={i} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', background: 'rgba(99,179,237,0.08)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99,179,237,0.15)' }}>{t}</span>
            ))}
          </div>

          {/* botones de acción: abrir en HD y copiar enlace */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
            {!item.media_type || item.media_type === 'image' ? (
              // enlace para abrir la imagen en nueva pestaña en máxima resolución
              <a href={item.hdurl || item.url} target="_blank" rel="noopener noreferrer" style={{
                padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)', color: 'var(--color-primary)'
              }}>{t.openHd}</a>
            ) : null}
            {/* botón para copiar el enlace al portapapeles */}
            <button onClick={copyLink} style={{
              padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', color: 'var(--color-text)'
            }}>{t.copy}</button>
          </div>

          {/* título completo de la imagen */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)', lineHeight: 1.2 }}>
            {item.title}
          </h2>
          {/* explicación astronómica completa de la NASA */}
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
            {item.explanation}
          </p>
        </div>
      </div>
    </div>
  )
}
