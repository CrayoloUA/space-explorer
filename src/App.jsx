import { useState, useMemo } from 'react'
import PlanetScene from './components/PlanetScene'
import APODCard from './components/APODCard'
import APODModal from './components/APODModal'
import MarsGallery from './components/MarsGallery'
import { useAPODGallery } from './hooks/useNASA'

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

function FavoritesSection({ language, favorites, onOpen, toggleFavorite }) {
  const t = {
    es: { title: 'Tus favoritos', subtitle: 'Las imágenes que guardaste para volver a ver después.', empty: 'Aún no has guardado favoritos. Marca una imagen con ⭐ para empezar.' },
    en: { title: 'Your favorites', subtitle: 'Images you saved to revisit later.', empty: 'No favorites yet. Tap ⭐ on any image to save it.' },
  }[language]

  return (
    <section className="section-shell reveal" style={{ paddingTop: 0 }}>
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
            <APODCard
              key={item.date}
              item={item}
              onClick={onOpen}
              onToggleFavorite={toggleFavorite}
              isFavorite={true}
              language={language}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function InsightsStrip({ language, favoritesCount, items }) {
  const videos = items.filter(item => item.media_type === 'video').length
  const images = items.filter(item => item.media_type === 'image').length
  const latest = items[0]?.date || '—'

  const t = {
    es: {
      title: 'Panel rápido',
      subtitle: 'Un vistazo a tu exploración actual.',
      favorites: 'Favoritos guardados',
      images: 'Imágenes disponibles',
      videos: 'Videos disponibles',
      latest: 'Última fecha cargada',
    },
    en: {
      title: 'Quick panel',
      subtitle: 'A snapshot of your current exploration.',
      favorites: 'Saved favorites',
      images: 'Available images',
      videos: 'Available videos',
      latest: 'Latest loaded date',
    }
  }[language]

  const metrics = [
    { label: t.favorites, value: favoritesCount, accent: 'var(--color-star)' },
    { label: t.images, value: images, accent: 'var(--color-primary)' },
    { label: t.videos, value: videos, accent: 'var(--color-nebula)' },
    { label: t.latest, value: latest, accent: 'var(--color-success)' },
  ]

  return (
    <section className="section-shell reveal" style={{ paddingTop: 0 }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-2)' }}>{t.title}</h2>
        <p className="section-subtitle">{t.subtitle}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {metrics.map(metric => (
          <div key={metric.label} className="metric-card glass-panel">
            <div className="metric-value" style={{ color: metric.accent }}>{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function APODSection({ language, favorites, toggleFavorite }) {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const { data, loading, error, refetch } = useAPODGallery(9)

  const t = {
    es: {
      badge: 'NASA · APOD API',
      title: 'Astronomy Picture of the Day',
      subtitle: 'Imágenes reales del universo seleccionadas por la NASA, con curaduría diaria y una experiencia más inmersiva.',
      refresh: '🔄 Nueva selección',
      search: 'Buscar por título o descripción...',
      lost: 'Señal perdida',
      retry: '🔄 Reintentar',
      noResults: 'No se encontraron resultados para',
      favorites: 'Favoritos',
      all: 'Todo',
      images: 'Imágenes',
      videos: 'Videos',
      heroCard1: 'Galería curada con contenido astronómico real.',
      heroCard2: 'Explora Marte y guarda tus hallazgos favoritos.',
    },
    en: {
      badge: 'NASA · APOD API',
      title: 'Astronomy Picture of the Day',
      subtitle: 'Real NASA-selected images of the universe, with daily curation and a more immersive experience.',
      refresh: '🔄 New selection',
      search: 'Search by title or description...',
      lost: 'Signal lost',
      retry: '🔄 Retry',
      noResults: 'No results found for',
      favorites: 'Favorites',
      all: 'All',
      images: 'Images',
      videos: 'Videos',
      heroCard1: 'Curated gallery with real astronomical content.',
      heroCard2: 'Explore Mars and save your favorite discoveries.',
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
        {/* Hero card — sin float-soft para evitar el temblor */}
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

        {/* Toolbar */}
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

        {/* Search */}
        <div style={{ marginBottom: 'var(--space-8)', position: 'relative', maxWidth: 520 }}>
          <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }}>🔍</span>
          <input
            type="search"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass-panel"
            style={{ width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)', borderRadius: 'var(--radius-full)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none', transition: 'border-color var(--transition), box-shadow var(--transition)' }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-border-strong)'; e.target.style.boxShadow = '0 0 0 3px rgba(126,208,255,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
          />
        </div>

        {error && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🛸</div>
            <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.lost}</h3>
            <p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', maxWidth: '36ch', margin: '0 auto var(--space-6)' }}>{error}</p>
            <button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-error)', background: 'rgba(252,129,129,0.1)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{t.retry}</button>
          </div>
        )}

        {loading ? <GallerySkeletons /> : (
          <>
            {filtered.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🔭</div>
                <p>{t.noResults} <strong style={{ color: 'var(--color-text)' }}>"{search}"</strong></p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
                {filtered.map(item => (
                  <APODCard
                    key={item.date}
                    item={item}
                    onClick={setSelectedItem}
                    onToggleFavorite={toggleFavorite}
                    isFavorite={favorites.some(f => f.date === item.date)}
                    language={language}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <InsightsStrip language={language} favoritesCount={favorites.length} items={data} />
      <FavoritesSection language={language} favorites={favorites} onOpen={setSelectedItem} toggleFavorite={toggleFavorite} />
      {selectedItem && <APODModal item={selectedItem} onClose={() => setSelectedItem(null)} language={language} />}
    </>
  )
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
      localStorage.setItem('space_favorites', JSON.stringify(next))
      return next
    })
  }

  const t = {
    es: {
      hero: 'Explora el universo con imágenes reales de la NASA, una escena 3D más viva y una experiencia visual más cinematográfica.',
      cta: 'Explorar el universo →',
      scroll: 'SCROLL',
      mars: '🔴 Marte',
      apod: '🌌 APOD Gallery',
      pill1: 'Visual inmersivo',
      pill2: 'Datos reales NASA',
      pill3: 'Exploración interactiva',
    },
    en: {
      hero: 'Explore the universe with real NASA images, a livelier 3D scene, and a more cinematic visual experience.',
      cta: 'Explore the universe →',
      scroll: 'SCROLL',
      mars: '🔴 Mars',
      apod: '🌌 APOD Gallery',
      pill1: 'Immersive visuals',
      pill2: 'Real NASA data',
      pill3: 'Interactive exploration',
    },
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
            {[t.pill1, t.pill2, t.pill3].map(pill => (
              <span key={pill} className="pill-tag">{pill}</span>
            ))}
          </div>
          <a className="fade-up tab-btn active" href="#content" style={{ padding: 'var(--space-4) var(--space-8)', background: 'linear-gradient(135deg, rgba(126,208,255,0.18), rgba(211,146,255,0.16))', color: 'var(--color-text)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', boxShadow: 'var(--shadow-glow)' }}>{t.cta}</a>
        </div>

        {/* Scroll indicator — FIXED: solo opacity en pulseGlow, línea con scrollDrop */}
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', animation: 'pulseGlow 2.5s ease-in-out infinite' }}>{t.scroll}</span>
          <div style={{ width: 1, height: 52, background: 'linear-gradient(var(--color-primary), transparent)', animation: 'scrollDrop 2.5s ease-in-out infinite' }} />
        </div>
      </header>

      <nav id="content" className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, margin: '0 var(--space-4)', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', padding: 'var(--space-3) var(--space-6)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>🚀 SPACE EXPLORER</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')} className="tab-btn" style={{ minWidth: 52 }}>{language.toUpperCase()}</button>
          {[{ id: 'apod', label: t.apod }, { id: 'mars', label: t.mars }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>{tab.label}</button>
          ))}
        </div>
      </nav>

      <main>
        {activeTab === 'apod' ? (
          <APODSection language={language} favorites={favorites} toggleFavorite={toggleFavorite} />
        ) : (
          <div className="section-shell"><MarsGallery language={language} /></div>
        )}
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
