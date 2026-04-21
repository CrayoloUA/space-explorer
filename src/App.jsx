import { useEffect, useMemo, useRef, useState } from 'react'
import PlanetScene from './components/PlanetScene'
import APODCard from './components/APODCard'
import APODModal from './components/APODModal'
import MarsGallery from './components/MarsGallery'
import { useAPODGallery, useNeoFeed } from './hooks/useNASA'

function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const numeric = Number(target)
    if (!Number.isFinite(numeric)) return
    let frame
    const start = performance.now()
    const animate = now => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(numeric * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}

function Reveal({ children, style }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(node)
    return () => obs.disconnect()
  }, [])

  return <div ref={ref} className={visible ? 'reveal in' : 'reveal'} style={style}>{children}</div>
}

function GallerySkeletons() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div className="skeleton" style={{ aspectRatio: '16/9' }} />
          <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <div className="skeleton" style={{ height: '1.2em', marginBottom: 'var(--space-3)' }} />
            <div className="skeleton" style={{ height: '0.9em', marginBottom: 'var(--space-2)' }} />
            <div className="skeleton" style={{ height: '0.9em', width: '65%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CounterMetric({ value, label, accent }) {
  const animated = useCountUp(value)
  return (
    <div className="metric-card glass-panel">
      <div className="metric-value" style={{ color: accent }}>{animated}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}

function FavoritesSection({ language, favorites, onOpen, toggleFavorite }) {
  const t = {
    es: { title: 'Tus favoritos', subtitle: 'Las imágenes que guardaste para volver a ver después.', empty: 'Aún no has guardado favoritos. Marca una imagen con ⭐ para empezar.' },
    en: { title: 'Your favorites', subtitle: 'Images you saved to revisit later.', empty: 'No favorites yet. Tap ⭐ on any image to save it.' },
  }[language]

  return (
    <Reveal>
      <section className="section-shell" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{t.title}</h2>
          <p className="section-subtitle">{t.subtitle}</p>
        </div>
        {favorites.length === 0 ? (
          <div className="glass-panel" style={{ padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 'var(--space-3)' }}>⭐</div>
            <p>{t.empty}</p>
          </div>
        ) : (
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

function InsightsStrip({ language, favoritesCount, items }) {
  const videos = items.filter(item => item.media_type === 'video').length
  const images = items.filter(item => item.media_type === 'image').length
  const latest = items[0]?.date || '—'

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <CounterMetric value={favoritesCount} label={t.favorites} accent="var(--color-star)" />
          <CounterMetric value={images} label={t.images} accent="var(--color-primary)" />
          <CounterMetric value={videos} label={t.videos} accent="var(--color-nebula)" />
          <div className="metric-card glass-panel">
            <div className="metric-value" style={{ color: 'var(--color-success)' }}>{latest}</div>
            <div className="metric-label">{t.latest}</div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

function NeoSection({ language }) {
  const { data, loading, error } = useNeoFeed()
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
          <div className="glass-panel" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>{error}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
            {data.map(item => (
              <article key={item.id} className="glass-panel-hover" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', lineHeight: 1.15 }}>{item.name}</h3>
                  <span style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-full)', background: item.hazardous ? 'rgba(252,129,129,0.12)' : 'rgba(104,211,145,0.12)', color: item.hazardous ? 'var(--color-error)' : 'var(--color-success)', whiteSpace: 'nowrap' }}>
                    {item.hazardous ? t.hazard : t.safe}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  <div>{t.velocity}: <strong style={{ color: 'var(--color-text)' }}>{Number(item.velocity || 0).toLocaleString()} km/h</strong></div>
                  <div>{t.distance}: <strong style={{ color: 'var(--color-text)' }}>{Number(item.missDistance || 0).toLocaleString()} km</strong></div>
                  <div>H: <strong style={{ color: 'var(--color-primary)' }}>{item.magnitude}</strong></div>
                  <div>Ø: <strong style={{ color: 'var(--color-nebula)' }}>{item.diameterMin.toFixed(3)} - {item.diameterMax.toFixed(3)} km</strong></div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}

function APODSection({ language, favorites, toggleFavorite }) {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const { data, loading, error, refetch } = useAPODGallery(9)

  const t = {
    es: {
      badge: 'NASA · APOD API', title: 'Astronomy Picture of the Day', subtitle: 'Imágenes reales del universo seleccionadas por la NASA, con curaduría diaria y una experiencia más inmersiva.', refresh: '🔄 Nueva selección', search: 'Buscar por título o descripción...', lost: 'Señal perdida', retry: '🔄 Reintentar', noResults: 'No se encontraron resultados para', favorites: 'Favoritos', all: 'Todo', images: 'Imágenes', videos: 'Videos', heroCard1: 'Galería curada con contenido astronómico real.', heroCard2: 'Explora Marte y guarda tus hallazgos favoritos.'
    },
    en: {
      badge: 'NASA · APOD API', title: 'Astronomy Picture of the Day', subtitle: 'Real NASA-selected images of the universe, with daily curation and a more immersive experience.', refresh: '🔄 New selection', search: 'Search by title or description...', lost: 'Signal lost', retry: '🔄 Retry', noResults: 'No results found for', favorites: 'Favorites', all: 'All', images: 'Images', videos: 'Videos', heroCard1: 'Curated gallery with real astronomical content.', heroCard2: 'Explore Mars and save your favorite discoveries.'
    }
  }[language]

  const filtered = useMemo(() => data.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.explanation?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ? true : item.media_type === (filter === 'images' ? 'image' : 'video')
    return matchesSearch && matchesFilter
  }), [data, search, filter])

  return (
    <>
      <section className="section-shell">
        <div className="glass-panel-hover" style={{ borderRadius: 'calc(var(--radius-xl) + 8px)', padding: 'var(--space-8)', marginBottom: 'var(--space-8)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 10% 20%, rgba(126,208,255,0.13), transparent 25%), radial-gradient(circle at 80% 0%, rgba(211,146,255,0.13), transparent 25%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--space-6)' }}>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.badge}</p>
              <h2 className="section-title" style={{ marginBottom: 'var(--space-3)', background: 'linear-gradient(90deg, var(--color-primary), var(--color-nebula))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.title}</h2>
              <p className="section-subtitle">{t.subtitle}</p>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div className="metric-card glass-panel"><div className="metric-label">01</div><div style={{ marginTop: 'var(--space-2)' }}>{t.heroCard1}</div></div>
              <div className="metric-card glass-panel"><div className="metric-label">02</div><div style={{ marginTop: 'var(--space-2)' }}>{t.heroCard2}</div></div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-8)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-star)', fontSize: 'var(--text-sm)' }}>⭐ {favorites.length} {t.favorites}</span>
            <button onClick={refetch} className="tab-btn" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{t.refresh}</button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['all', 'images', 'videos'].map(key => (
              <button key={key} onClick={() => setFilter(key)} className={`tab-btn${filter === key ? ' active' : ''}`}>{t[key]}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-8)', position: 'relative', maxWidth: 520 }}>
          <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }}>🔍</span>
          <input type="search" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} className="glass-panel" style={{ width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)', borderRadius: 'var(--radius-full)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none' }} />
        </div>

        {error && <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}><div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🛸</div><h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.lost}</h3><p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', maxWidth: '36ch', margin: '0 auto var(--space-6)' }}>{error}</p><button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-error)', background: 'rgba(252,129,129,0.1)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{t.retry}</button></div>}

        {loading ? <GallerySkeletons /> : (
          filtered.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}><div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🔭</div><p>{t.noResults} <strong style={{ color: 'var(--color-text)' }}>"{search}"</strong></p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
              {filtered.map(item => (
                <APODCard key={item.date} item={item} onClick={setSelectedItem} onToggleFavorite={toggleFavorite} isFavorite={favorites.some(f => f.date === item.date)} language={language} />
              ))}
            </div>
          )
        )}
      </section>

      <InsightsStrip language={language} favoritesCount={favorites.length} items={data} />
      <NeoSection language={language} />
      <FavoritesSection language={language} favorites={favorites} onOpen={setSelectedItem} toggleFavorite={toggleFavorite} />
      {selectedItem && <APODModal item={selectedItem} onClose={() => setSelectedItem(null)} language={language} />}
    </>
  )
}

function FullscreenButton({ language }) {
  const [active, setActive] = useState(false)
  const t = language === 'es' ? 'Pantalla completa' : 'Fullscreen'

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setActive(true)
    } else {
      await document.exitFullscreen()
      setActive(false)
    }
  }

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return <button onClick={toggle} className={`tab-btn${active ? ' active' : ''}`}>⛶ {t}</button>
}

export default function App() {
  const [activeTab, setActiveTab] = useState('apod')
  const [language, setLanguage] = useState('es')
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('space_favorites') || '[]') } catch { return [] }
  })

  const toggleFavorite = (item) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.date === item.date)
      const next = exists ? prev.filter(f => f.date !== item.date) : [...prev, item]
      try { localStorage.setItem('space_favorites', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const t = {
    es: { hero: 'Explora el universo con imágenes reales de la NASA, una escena 3D más viva y una experiencia visual más cinematográfica.', cta: 'Explorar el universo →', scroll: 'SCROLL', mars: '🔴 Marte', apod: '🌌 APOD Gallery', pill1: 'Visual inmersivo', pill2: 'Datos reales NASA', pill3: 'Exploración interactiva' },
    en: { hero: 'Explore the universe with real NASA images, a livelier 3D scene, and a more cinematic visual experience.', cta: 'Explore the universe →', scroll: 'SCROLL', mars: '🔴 Mars', apod: '🌌 APOD Gallery', pill1: 'Immersive visuals', pill2: 'Real NASA data', pill3: 'Interactive exploration' },
  }[language]

  return (
    <div>
      <header style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}><PlanetScene /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(4,7,13,0.18) 0%, rgba(4,7,13,0.45) 55%, rgba(4,7,13,0.92) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(4,7,13,0.2), rgba(4,7,13,0.35) 40%, var(--color-bg) 100%)' }} />

        <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-6)', maxWidth: 900 }}>
          <p className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.34em', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>NASA API · Three.js · React</p>
          <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-hero)', fontWeight: 800, lineHeight: 0.95, marginBottom: 'var(--space-5)', letterSpacing: '-0.05em', background: 'linear-gradient(155deg, #ffffff 0%, var(--color-primary) 55%, var(--color-nebula) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Space Explorer</h1>
          <p className="fade-up" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '44ch', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>{t.hero}</p>
          <div className="fade-up" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
            {[t.pill1, t.pill2, t.pill3].map(pill => <span key={pill} className="pill-tag">{pill}</span>)}
          </div>
          <a className="fade-up tab-btn active" href="#content" style={{ padding: 'var(--space-4) var(--space-8)', background: 'linear-gradient(135deg, rgba(126,208,255,0.18), rgba(211,146,255,0.16))', color: 'var(--color-text)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', boxShadow: 'var(--shadow-glow)' }}>{t.cta}</a>
        </div>

        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', animation: 'pulseGlow 2.5s ease-in-out infinite' }}>{t.scroll}</span>
          <div style={{ width: 1, height: 52, background: 'linear-gradient(var(--color-primary), transparent)', animation: 'scrollDrop 2.5s ease-in-out infinite' }} />
        </div>
      </header>

      <nav id="content" className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, margin: '0 var(--space-4)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', padding: 'var(--space-3) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>🚀 SPACE EXPLORER</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <FullscreenButton language={language} />
          <button onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')} className="tab-btn" style={{ minWidth: 52 }}>{language.toUpperCase()}</button>
          {[{ id: 'apod', label: t.apod }, { id: 'mars', label: t.mars }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>{tab.label}</button>
          ))}
        </div>
      </nav>

      <main>
        {activeTab === 'apod' ? <APODSection language={language} favorites={favorites} toggleFavorite={toggleFavorite} /> : <div className="section-shell"><MarsGallery language={language} /></div>}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span>🚀 Space Explorer</span>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>Datos de <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>NASA Open APIs</a></span>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>React + Three.js</span>
      </footer>
    </div>
  )
}
