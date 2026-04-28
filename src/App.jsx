import { useEffect, useMemo, useRef, useState } from 'react'  // hooks de React necesarios en este archivo
import PlanetScene from './components/PlanetScene'              // escena 3D del hero
import APODCard from './components/APODCard'                    // tarjeta de imagen APOD
import APODModal from './components/APODModal'                  // modal de detalle APOD
import MarsGallery from './components/MarsGallery'              // galería de fotos de Marte
import { useAPODGallery, useNeoFeed } from './hooks/useNASA'    // hooks de datos NASA

// hook que anima un número desde 0 hasta `target` en `duration` ms con easing cúbico
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)  // valor animado actual

  useEffect(() => {
    const numeric = Number(target)
    if (!Number.isFinite(numeric)) return  // sale si el valor no es un número válido
    let frame
    const start = performance.now()  // marca el inicio de la animación
    const animate = now => {
      const progress = Math.min((now - start) / duration, 1)  // progreso de 0 a 1
      const eased = 1 - Math.pow(1 - progress, 3)             // ease-out cúbico: empieza rápido y frena al final
      setValue(Math.round(numeric * eased))                    // actualiza el valor redondeado
      if (progress < 1) frame = requestAnimationFrame(animate) // sigue animando hasta llegar a 1
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)  // cancela la animación al desmontar
  }, [target, duration])

  return value  // devuelve el número animado actual
}

// componente que aplica una animación de entrada (fade + slide up) cuando el elemento entra en el viewport
function Reveal({ children, style }) {
  const ref = useRef(null)                 // referencia al div contenedor
  const [visible, setVisible] = useState(false)  // true cuando el elemento es visible en pantalla

  useEffect(() => {
    const node = ref.current
    if (!node) return
    // IntersectionObserver detecta cuando el elemento entra en el viewport
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)   // activa la animación
        obs.disconnect()   // deja de observar una vez que apareció (la animación solo ocurre una vez)
      }
    }, { threshold: 0.15 })  // dispara cuando el 15% del elemento es visible
    obs.observe(node)
    return () => obs.disconnect()  // cleanup
  }, [])

  // alterna entre clase 'reveal' (invisible) y 'reveal in' (visible con animación CSS)
  return <div ref={ref} className={visible ? 'reveal in' : 'reveal'} style={style}>{children}</div>
}

// muestra 9 tarjetas placeholder animadas mientras se cargan las imágenes APOD
function GallerySkeletons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
      {Array.from({ length: 9 }, (_, i) => (  // crea 9 elementos
        <div key={i} className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '16/9' }} />  {/* placeholder de imagen */}
          <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <div className="skeleton" style={{ height: '1.2em', marginBottom: 'var(--space-3)' }} />   {/* placeholder título */}
            <div className="skeleton" style={{ height: '0.9em', marginBottom: 'var(--space-2)' }} />   {/* placeholder línea 1 */}
            <div className="skeleton" style={{ height: '0.9em', width: '65%' }} />                     {/* placeholder línea 2 corta */}
          </div>
        </div>
      ))}
    </div>
  )
}

// tarjeta de métrica con número animado y etiqueta
function CounterMetric({ value, label, accent }) {
  const animated = useCountUp(value)  // anima el número de 0 al valor real
  return (
    <div className="metric-card glass-panel">
      <div className="metric-value" style={{ color: accent }}>{animated}</div>  {/* número con color de acento */}
      <div className="metric-label">{label}</div>                               {/* texto descriptivo */}
    </div>
  )
}

// sección que muestra las imágenes marcadas como favoritas por el usuario
function FavoritesSection({ language, favorites, onOpen, toggleFavorite }) {
  const t = {
    es: { title: 'Tus favoritos', subtitle: 'Las imágenes que guardaste para volver a ver después.', empty: 'Aún no has guardado favoritos. Marca una imagen con ⭐ para empezar.' },
    en: { title: 'Your favorites', subtitle: 'Images you saved to revisit later.', empty: 'No favorites yet. Tap ⭐ on any image to save it.' },
  }[language]

  return (
    <Reveal>  {/* aparece con animación al llegar al viewport */}
      <section className="section-shell" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        {favorites.length === 0 ? (
          // estado vacío cuando no hay favoritos guardados
          <div className="glass-panel" style={{ padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 'var(--space-3)' }}>⭐</div>
            <p>{t.empty}</p>
          </div>
        ) : (
          // grilla con máximo 6 favoritos
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 'var(--space-6)' }}>
            {favorites.slice(0, 6).map(item => (
              <APODCard key={item.date} item={item} onClick={onOpen} onToggleFavorite={toggleFavorite} isFavorite={true} language={language} />
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}

// barra de estadísticas rápidas: favoritos, imágenes, videos y última fecha
function InsightsStrip({ language, favoritesCount, items }) {
  const videos = items.filter(item => item.media_type === 'video').length   // cuenta los videos en la galería
  const images = items.filter(item => item.media_type === 'image').length   // cuenta las imágenes
  const latest = items[0]?.date || '—'                                       // fecha del item más reciente

  const t = {
    es: { title: 'Panel rápido', subtitle: 'Un vistazo a tu exploración actual.', favorites: 'Favoritos guardados', images: 'Imágenes disponibles', videos: 'Videos disponibles', latest: 'Última fecha cargada' },
    en: { title: 'Quick panel', subtitle: 'A snapshot of your current exploration.', favorites: 'Saved favorites', images: 'Available images', videos: 'Available videos', latest: 'Latest loaded date' },
  }[language]

  return (
    <Reveal>
      <section className="section-shell" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        {/* grilla de 4 métricas: favoritos, imágenes, videos y fecha */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <CounterMetric value={favoritesCount} label={t.favorites} accent="var(--color-star)" />    {/* dorado */}
          <CounterMetric value={images} label={t.images} accent="var(--color-primary)" />            {/* azul */}
          <CounterMetric value={videos} label={t.videos} accent="var(--color-nebula)" />             {/* violeta */}
          {/* la fecha no usa CounterMetric porque no es un número */}
          <div className="metric-card glass-panel">
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{latest}</div>
            <div className="metric-label">{t.latest}</div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

// sección que muestra asteroides cercanos a la Tierra del día de hoy
function NeoSection({ language }) {
  const { data, loading, error } = useNeoFeed()  // obtiene datos de la API NEO de la NASA
  const t = {
    es: { title: 'Asteroides cercanos', subtitle: 'Objetos cercanos a la Tierra reportados hoy por NASA NEO.', hazard: 'Riesgo potencial', safe: 'Sin riesgo', velocity: 'Velocidad', distance: 'Distancia mínima' },
    en: { title: 'Near-Earth asteroids', subtitle: 'Near-Earth objects reported today by NASA NEO.', hazard: 'Potentially hazardous', safe: 'No risk', velocity: 'Velocity', distance: 'Miss distance' },
  }[language]

  return (
    <Reveal>
      <section className="section-shell" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        {loading ? <GallerySkeletons /> : error ? (
          // panel de error si la API falla
          <div className="glass-panel" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>{error}</div>
        ) : (
          // grilla de tarjetas, una por asteroide
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
            {data.map(item => (
              <article key={item.id} className="glass-panel-hover" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
                {/* encabezado: nombre del asteroide + badge de peligrosidad */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1.15 }}>{item.name}</h3>
                  {/* badge rojo si es peligroso, verde si no */}
                  <span style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-full)', background: item.hazardous ? 'rgba(252,129,129,0.12)' : 'rgba(104,211,145,0.12)', color: item.hazardous ? 'var(--color-error)' : 'var(--color-success)', whiteSpace: 'nowrap' }}>
                    {item.hazardous ? t.hazard : t.safe}
                  </span>
                </div>
                {/* datos técnicos del asteroide */}
                <div style={{ display: 'grid', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  <div>{t.velocity}: <strong style={{ color: 'var(--color-text)' }}>{Number(item.velocity || 0).toLocaleString()} km/h</strong></div>      {/* velocidad relativa */}
                  <div>{t.distance}: <strong style={{ color: 'var(--color-text)' }}>{Number(item.missDistance || 0).toLocaleString()} km</strong></div>    {/* distancia de paso */}
                  <div>H: <strong style={{ color: 'var(--color-primary)' }}>{item.magnitude}</strong></div>                                                {/* magnitud absoluta */}
                  <div>Ø: <strong style={{ color: 'var(--color-nebula)' }}>{item.diameterMin.toFixed(3)} - {item.diameterMax.toFixed(3)} km</strong></div> {/* rango de diámetro */}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}

// sección principal con la galería APOD: búsqueda, filtros, tarjetas e insights
function APODSection({ language, favorites, toggleFavorite }) {
  const [search, setSearch] = useState('')           // texto del buscador
  const [selectedItem, setSelectedItem] = useState(null)  // item abierto en el modal
  const [filter, setFilter] = useState('all')        // filtro activo: 'all', 'images' o 'videos'
  const { data, loading, error, refetch } = useAPODGallery(9)  // descarga 9 imágenes APOD

  const t = {
    es: {
      badge: 'NASA · APOD API', title: 'Astronomy Picture of the Day', subtitle: 'Imágenes reales del universo seleccionadas por la NASA, con curaduría diaria y una experiencia más inmersiva.', refresh: '🔄 Nueva selección', search: 'Buscar por título o descripción...', lost: 'Señal perdida', retry: '🔄 Reintentar', noResults: 'No se encontraron resultados para', favorites: 'Favoritos', all: 'Todo', images: 'Imágenes', videos: 'Videos', heroCard1: 'Galería curada con contenido astronómico real.', heroCard2: 'Explora Marte y guarda tus hallazgos favoritos.'
    },
    en: {
      badge: 'NASA · APOD API', title: 'Astronomy Picture of the Day', subtitle: 'Real NASA-selected images of the universe, with daily curation and a more immersive experience.', refresh: '🔄 New selection', search: 'Search by title or description...', lost: 'Signal lost', retry: '🔄 Retry', noResults: 'No results found for', favorites: 'Favorites', all: 'All', images: 'Images', videos: 'Videos', heroCard1: 'Curated gallery with real astronomical content.', heroCard2: 'Explore Mars and save your favorite discoveries.'
    }
  }[language]

  // filtra los items según el texto de búsqueda y el tipo seleccionado; se recalcula solo si cambian data, search o filter
  const filtered = useMemo(() => data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.explanation?.toLowerCase().includes(search.toLowerCase())  // busca en título y descripción
    const matchesFilter = filter === 'all' ? true : item.media_type === (filter === 'images' ? 'image' : 'video')  // filtra por tipo de medio
    return matchesSearch && matchesFilter
  }), [data, search, filter])

  return (
    <>
      <section className="section-shell">
        {/* hero card de la sección APOD con descripción y tarjetas informativas */}
        <div className="glass-panel-hover" style={{ borderRadius: 'calc(var(--radius-xl) + 8px)', padding: 'var(--space-8)', marginBottom: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 20%, rgba(126,208,255,0.13), transparent 25%), radial-gradient(circle at 80% 0%, rgba(211,146,255,0.13), transparent 25%)', pointerEvents: 'none' }} />  {/* luces decorativas de fondo */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-6)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.badge}</p>  {/* etiqueta de la API */}
              <h2 className="section-title" style={{ marginBottom: 'var(--space-3)', background: 'linear-gradient(90deg, var(--color-primary), var(--color-nebula))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.title}</h2>  {/* título con degradado */}
              <p className="section-subtitle">{t.subtitle}</p>
            </div>
            {/* mini-tarjetas informativas a la derecha */}
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="metric-card glass-panel"><div className="metric-label">01</div><div style={{ marginTop: 'var(--space-2)' }}>{t.heroCard1}</div></div>
              <div className="metric-card glass-panel"><div className="metric-label">02</div><div style={{ marginTop: 'var(--space-2)' }}>{t.heroCard2}</div></div>
            </div>
          </div>
        </div>

        {/* barra de controles: contador de favoritos, botón de recarga y filtros */}
        <div style={{ marginBottom: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-star)', fontSize: 'var(--text-sm)' }}>⭐ {favorites.length} {t.favorites}</span>  {/* cantidad de favoritos */}
            <button onClick={refetch} className="tab-btn" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{t.refresh}</button>  {/* recarga imágenes aleatorias */}
          </div>
          {/* botones de filtro: Todo / Imágenes / Videos */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['all', 'images', 'videos'].map(key => (
              <button key={key} onClick={() => setFilter(key)} className={`tab-btn${filter === key ? ' active' : ''}`}>{t[key]}</button>  {/* resalta el filtro activo */}
            ))}
          </div>
        </div>

        {/* campo de búsqueda con ícono de lupa */}
        <div style={{ marginBottom: 'var(--space-8)', position: 'relative', maxWidth: 520 }}>
          <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }}>🔍</span>  {/* ícono decorativo */}
          <input type="search" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} className="glass-panel" style={{ width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)', borderRadius: 'var(--radius-full)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none' }} />
        </div>

        {/* panel de error con botón de reintentar */}
        {error && <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}><div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🛸</div><h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.lost}</h3><p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', maxWidth: '36ch', margin: '0 auto var(--space-6)' }}>{error}</p><button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-error)', background: 'rgba(252,129,129,0.1)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{t.retry}</button></div>}

        {loading ? <GallerySkeletons /> : (
          filtered.length === 0 ? (
            // estado vacío cuando la búsqueda no encuentra resultados
            <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}><div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🔭</div><p>{t.noResults} <strong style={{ color: 'var(--color-text)' }}>"{search}"</strong></p></div>
          ) : (
            // grilla de tarjetas con los resultados filtrados
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
              {filtered.map(item => (
                <APODCard key={item.date} item={item} onClick={setSelectedItem} onToggleFavorite={toggleFavorite} isFavorite={favorites.some(f => f.date === item.date)} language={language} />
              ))}
            </div>
          )
        )}
      </section>

      <InsightsStrip language={language} favoritesCount={favorites.length} items={data} />  {/* panel de estadísticas */}
      <NeoSection language={language} />  {/* sección de asteroides */}
      <FavoritesSection language={language} favorites={favorites} onOpen={setSelectedItem} toggleFavorite={toggleFavorite} />  {/* sección de favoritos */}
      {selectedItem && <APODModal item={selectedItem} onClose={() => setSelectedItem(null)} language={language} />}  {/* modal solo si hay item seleccionado */}
    </>
  )
}

// botón que activa/desactiva el modo pantalla completa del navegador
function FullscreenButton({ language }) {
  const [active, setActive] = useState(false)  // true cuando la pantalla está en fullscreen
  const t = language === 'es' ? 'Pantalla completa' : 'Fullscreen'

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()  // solicita pantalla completa
      setActive(true)
    } else {
      await document.exitFullscreen()  // sale de pantalla completa
      setActive(false)
    }
  }

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement))  // sincroniza el estado si el usuario sale con Escape
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)  // cleanup
  }, [])

  return <button onClick={toggle} className={`tab-btn${active ? ' active' : ''}`}>⛶ {t}</button>  // resalta el botón cuando está activo
}

// componente raíz de la aplicación: maneja tabs, idioma y favoritos
export default function App() {
  const [activeTab, setActiveTab] = useState('apod')  // tab activo: 'apod' o 'mars'
  const [language, setLanguage] = useState('es')       // idioma activo: 'es' o 'en'
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('space_favorites') || '[]') } catch { return [] }  // carga favoritos del localStorage al iniciar
  })

  // agrega o quita un item de favoritos y persiste el cambio en localStorage
  const toggleFavorite = (item) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.date === item.date)               // verifica si ya es favorito
      const next = exists ? prev.filter(f => f.date !== item.date) : [...prev, item]  // quita o agrega
      try { localStorage.setItem('space_favorites', JSON.stringify(next)) } catch {}  // guarda en localStorage
      return next
    })
  }

  const t = {
    es: { hero: 'Explora el universo con imágenes reales de la NASA, una escena 3D más viva y una experiencia visual más cinematográfica.', cta: 'Explorar el universo →', scroll: 'SCROLL', mars: '🔴 Marte', apod: '🌌 APOD Gallery', pill1: 'Visual inmersivo', pill2: 'Datos reales NASA', pill3: 'Exploración interactiva' },
    en: { hero: 'Explore the universe with real NASA images, a livelier 3D scene, and a more cinematic visual experience.', cta: 'Explore the universe →', scroll: 'SCROLL', mars: '🔴 Mars', apod: '🌌 APOD Gallery', pill1: 'Immersive visuals', pill2: 'Real NASA data', pill3: 'Interactive exploration' },
  }[language]

  return (
    <div>
      {/* sección hero que ocupa toda la pantalla con la escena 3D de fondo */}
      <header style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}><PlanetScene /></div>  {/* escena 3D de fondo en capa absoluta */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(4,7,13,0.18) 0%, rgba(4,7,13,0.45) 55%, rgba(4,7,13,0.92) 100%)' }} />  {/* viñeta radial oscura sobre la escena */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,13,0.2), rgba(4,7,13,0.35) 40%, var(--color-bg) 100%)' }} />  {/* degradado hacia el fondo del hero */}

        {/* contenido central del hero: título, subtítulo, pills y CTA */}
        <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-6)', maxWidth: 900 }}>
          <p className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.34em', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>NASA API · Three.js · React</p>  {/* subtítulo técnico */}
          <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 800, lineHeight: 0.95, marginBottom: 'var(--space-5)', letterSpacing: '-0.05em', background: 'linear-gradient(155deg, #ffffff 0%, var(--color-primary) 55%, var(--color-nebula) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Space Explorer</h1>  {/* título grande con degradado */}
          <p className="fade-up" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '44ch', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>{t.hero}</p>  {/* descripción del proyecto */}
          {/* pills de características */}
          <div className="fade-up" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
            {[t.pill1, t.pill2, t.pill3].map(pill => <span key={pill} className="pill-tag">{pill}</span>)}
          </div>
          {/* botón CTA que lleva a la sección de contenido */}
          <a className="fade-up tab-btn active" href="#content" style={{ padding: 'var(--space-4) var(--space-8)', background: 'linear-gradient(135deg, rgba(126,208,255,0.18), rgba(211,146,255,0.16))', color: 'var(--color-text)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', boxShadow: 'var(--shadow-glow)' }}>{t.cta}</a>
        </div>

        {/* indicador de scroll animado en la parte inferior del hero */}
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', animation: 'pulseGlow 2.5s ease-in-out infinite' }}>{t.scroll}</span>  {/* texto "SCROLL" pulsante */}
          <div style={{ width: 1, height: 52, background: 'linear-gradient(var(--color-primary), transparent)', animation: 'scrollDrop 2.5s ease-in-out infinite' }} />  {/* línea animada que aparece hacia abajo */}
        </div>
      </header>

      {/* barra de navegación pegajosa con logo, idioma, fullscreen y tabs */}
      <nav id="content" className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, margin: '0 var(--space-4)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', padding: 'var(--space-3) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>🚀 SPACE EXPLORER</span>  {/* logo */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <FullscreenButton language={language} />
          {/* botón para cambiar entre ES y EN */}
          <button onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')} className="tab-btn" style={{ minWidth: 52 }}>{language.toUpperCase()}</button>
          {/* tabs de APOD y Marte */}
          {[{ id: 'apod', label: t.apod }, { id: 'mars', label: t.mars }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>{tab.label}</button>
          ))}
        </div>
      </nav>

      {/* contenido principal: muestra APOD o Marte según el tab activo */}
      <main>
        {activeTab === 'apod' ? <APODSection language={language} favorites={favorites} toggleFavorite={toggleFavorite} /> : <div className="section-shell"><MarsGallery language={language} /></div>}
      </main>

      {/* pie de página con créditos y enlace a la NASA */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span>🚀 Space Explorer</span>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>Datos de <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>NASA Open APIs</a></span>  {/* enlace oficial de la NASA */}
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>React + Three.js</span>
      </footer>
    </div>
  )
}
