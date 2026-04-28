import { useState } from 'react'  // hook para manejar el estado del error de imagen

// tarjeta individual que muestra una imagen o video APOD con su título, descripción y botón de favorito
export default function APODCard({ item, onClick, onToggleFavorite, isFavorite, language = 'es' }) {
  const [imgError, setImgError] = useState(false)  // true si la imagen no cargó correctamente
  const isVideo = item.media_type === 'video'       // true si el contenido es un video en lugar de imagen
  const t = {
    es: { video: 'Video', unavailable: 'No disponible', image: 'Imagen', favorite: 'Favorito' },
    en: { video: 'Video', unavailable: 'Unavailable', image: 'Image', favorite: 'Favorite' },
  }[language]  // selecciona los textos según el idioma activo

  return (
    // artículo completo que al hacer click abre el modal con detalle
    <article onClick={() => onClick(item)} style={{
      background: 'var(--color-surface)',                // fondo oscuro semitransparente
      border: '1px solid var(--color-border)',           // borde sutil
      borderRadius: 'var(--radius-xl)',                  // esquinas redondeadas grandes
      overflow: 'hidden',                                // recorta el contenido que se salga
      cursor: 'pointer',                                 // cursor de mano al pasar el mouse
      transition: 'transform var(--transition), box-shadow var(--transition)',  // animación suave al hover
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)' }}  // sube la card y agrega brillo al entrar el mouse
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}  // restaura al salir el mouse
    >
      {/* botón de estrella para marcar/desmarcar como favorito */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(item) }}  // stopPropagation evita abrir el modal
        aria-label={t.favorite}
        style={{
          position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', zIndex: 3,  // esquina superior izquierda sobre la imagen
          width: 36, height: 36, borderRadius: 'var(--radius-full)',
          background: 'rgba(5,8,16,0.8)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >{isFavorite ? '⭐' : '☆'}</button>  {/* muestra estrella llena si es favorito */}

      {/* contenedor de la imagen o video con proporción 16:9 */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--color-surface-offset)' }}>
        {isVideo ? (
          // si es video, muestra un ícono de play en lugar de imagen
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', background: 'linear-gradient(135deg, var(--color-surface-offset), var(--color-accent))' }}>
            <span style={{ fontSize: '2.5rem', opacity: 0.8 }}>▶</span>
            <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>{t.video}</span>
          </div>
        ) : imgError ? (
          // si la imagen falló, muestra un placeholder con ícono
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', color: 'var(--color-text-faint)' }}>
            <span style={{ fontSize: '2.5rem' }}>🌌</span>
            <span style={{ fontSize: 'var(--text-xs)' }}>{t.unavailable}</span>
          </div>
        ) : (
          // imagen normal con carga lazy para mejorar rendimiento
          <img src={item.url} alt={item.title} loading="lazy" width="400" height="225"
            onError={() => setImgError(true)}  // activa el estado de error si la imagen no carga
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}

        {/* badge con la fecha en la esquina superior derecha de la imagen */}
        <span style={{
          position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)',
          background: 'rgba(5,8,16,0.75)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)',
          padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--text-xs)',
          color: 'var(--color-primary)', fontFamily: 'var(--font-display)',
        }}>{item.date}</span>

        {/* badge inferior izquierdo que indica si es imagen o video */}
        <span style={{
          position: 'absolute', bottom: 'var(--space-3)', left: 'var(--space-3)',
          background: 'rgba(5,8,16,0.75)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)', padding: 'var(--space-1) var(--space-3)',
          fontSize: 'var(--text-xs)', color: 'var(--color-text)'
        }}>{isVideo ? t.video : t.image}</span>
      </div>

      {/* área de texto con título, descripción corta y copyright */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', flex: 1 }}>
        {/* título recortado a 2 líneas máximo */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.title}
        </h3>
        {/* descripción recortada a 3 líneas y 130 caracteres */}
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.explanation?.slice(0, 130)}...
        </p>
        {/* muestra el copyright solo si existe */}
        {item.copyright && (
          <span style={{ display: 'block', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            © {item.copyright}
          </span>
        )}
      </div>
    </article>
  )
}
