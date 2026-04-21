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
        <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
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

function APODSection({ language, favorites, toggleFavorite }) {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const { data, loading, error, refetch } = useAPODGallery(9)

  const t = {
    es: {
      badge: 'NASA · APOD API',
      title: 'Astronomy Picture of the Day',
      subtitle: 'Imágenes reales del universo seleccionadas por la NASA',
      refresh: '🔄 Nueva selección',
      search: 'Buscar por título o descripción...',
      lost: 'Señal perdida',
      retry: '🔄 Reintentar',
      noResults: 'No se encontraron resultados para',
      favorites: 'Favoritos'
    },
    en: {
      badge: 'NASA · APOD API',
      title: 'Astronomy Picture of the Day',
      subtitle: 'Real NASA-selected images of the universe',
      refresh: '🔄 New selection',
      search: 'Search by title or description...',
      lost: 'Signal lost',
      retry: '🔄 Retry',
      noResults: 'No results found for',
      favorites: 'Favorites'
    }
  }[language]

  const filtered = useMemo(() => data.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.explanation?.toLowerCase().includes(search.toLowerCase())
  ), [data, search])

  return (
    <section style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-10)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.badge}</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)', background: 'linear-gradient(90deg, var(--color-primary), var(--color-nebula))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t.title}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>{t.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--color-star)', fontSize: 'var(--text-sm)' }}>⭐ {favorites.length} {t.favorites}</span>
          <button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(99,179,237,0.3)', background: 'rgba(99,179,237,0.08)', color: 'var(--color-primary)', fontSize: 'var(--text-sm)', transition: 'all var(--transition)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{t.refresh}</button>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-8)', position: 'relative', maxWidth: 480 }}>
        <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }}>🔍</span>
        <input type="search" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none' }} />
      </div>

      {error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-4)' }}>🛸</div>
          <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-display)' }}>{t.lost}</h3>
          <p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', maxWidth: '36ch', margin: '0 auto var(--space-6)' }}>{error}</p>
          <button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-error)', background: 'rgba(252,129,129,0.1)', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>{t.retry}</button>
        </div>
      )}

      {loading ? <GallerySkeletons /> : (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
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

      {selectedItem && <APODModal item={selectedItem} onClose={() => setSelectedItem(null)} language={language} />}
    </section>
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
    es: { hero: 'Explora el universo con imágenes reales de la NASA y fotos del rover Curiosity en Marte', cta: 'Explorar el universo →', scroll: 'SCROLL', mars: '🔴 Marte', apod: '🌌 APOD Gallery' },
    en: { hero: 'Explore the universe with real NASA images and Curiosity rover photos from Mars', cta: 'Explore the universe →', scroll: 'SCROLL', mars: '🔴 Mars', apod: '🌌 APOD Gallery' },
  }[language]

  return (
    <div>
      <header style={{ position: 'relative', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}><PlanetScene /></div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center bottom, rgba(5,8,16,0.5) 0%, transparent 60%), linear-gradient(to bottom, transparent 40%, var(--color-bg) 100%)' }} />
        <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-4)', maxWidth: 700 }}>
          <p className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>NASA API · Three.js · React</p>
          <h1 className="fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, lineHeight: 1.05, marginBottom: 'var(--space-5)', background: 'linear-gradient(160deg, #ffffff 0%, var(--color-primary) 60%, var(--color-nebula) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Space Explorer</h1>
          <p className="fade-up" style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '44ch', margin: '0 auto var(--space-8)', lineHeight: 1.7 }}>{t.hero}</p>
          <a className="fade-up" href="#content" style={{ padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#050810', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', transition: 'all var(--transition)', boxShadow: 'var(--shadow-glow)' }}>{t.cta}</a>
        </div>
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', letterSpacing: '0.15em', animation: 'pulseGlow 2.5s ease-in-out infinite' }}>
          <span>{t.scroll}</span>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(var(--color-primary), transparent)', opacity: 0.5 }} />
        </div>
      </header>

      <nav id="content" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,8,16,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-3) var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>🚀 SPACE EXPLORER</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setLanguage(l => l === 'es' ? 'en' : 'es')} style={{ padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>{language.toUpperCase()}</button>
          {[{ id: 'apod', label: t.apod }, { id: 'mars', label: t.mars }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-full)', border: activeTab === tab.id ? '1px solid rgba(99,179,237,0.5)' : '1px solid transparent', background: activeTab === tab.id ? 'rgba(99,179,237,0.12)' : 'transparent', color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-display)', fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label}</button>
          ))}
        </div>
      </nav>

      <main>
        {activeTab === 'apod' ? (
          <APODSection language={language} favorites={favorites} toggleFavorite={toggleFavorite} />
        ) : (
          <div style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: 1200, margin: '0 auto' }}><MarsGallery language={language} /></div>
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
