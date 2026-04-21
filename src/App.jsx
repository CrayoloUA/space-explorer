import { useState, Suspense } from 'react'
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

function APODSection() {
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const { data, loading, error, refetch } = useAPODGallery(9)

  const filtered = data.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.explanation?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-10)', display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)', background: 'linear-gradient(90deg, var(--color-primary), var(--color-nebula))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Astronomy Picture of the Day
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-base)' }}>
            Imágenes reales del universo — NASA APOD API
          </p>
        </div>
        <button onClick={refetch} style={{
          padding: 'var(--space-3) var(--space-5)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(99,179,237,0.3)',
          background: 'rgba(99,179,237,0.08)',
          color: 'var(--color-primary)',
          fontSize: 'var(--text-sm)',
          transition: 'background var(--transition)',
        }}>🔄 Nueva selección</button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 'var(--space-8)', position: 'relative', maxWidth: 480 }}>
        <span style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }}>🔍</span>
        <input
          type="search"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-10)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)', color: 'var(--color-text)',
            fontSize: 'var(--text-sm)', outline: 'none',
            transition: 'border-color var(--transition)',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,179,237,0.5)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        />
      </div>

      {error && (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🛸</div>
          <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-2)' }}>Señal perdida</h3>
          <p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>{error}</p>
          <button onClick={refetch} style={{ padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-error)', background: 'rgba(252,129,129,0.1)', color: 'var(--color-error)' }}>
            🔄 Reintentar
          </button>
        </div>
      )}

      {loading ? <GallerySkeletons /> : (
        <>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🔭</div>
              <p>No se encontraron imágenes para "{search}"</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 'var(--space-6)' }}>
              {filtered.map(item => <APODCard key={item.date} item={item} onClick={setSelectedItem} />)}
            </div>
          )}
        </>
      )}

      {selectedItem && <APODModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </section>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('apod')

  return (
    <div>
      {/* Hero con planeta 3D */}
      <header style={{ position: 'relative', height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Canvas 3D de fondo */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <PlanetScene />
          </Suspense>
        </div>

        {/* Overlay gradiente */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center bottom, rgba(5,8,16,0.7) 0%, transparent 60%), linear-gradient(to bottom, transparent 50%, var(--color-bg) 100%)' }} />

        {/* Contenido hero */}
        <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>
            NASA API · Three.js
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--space-6)', background: 'linear-gradient(180deg, #fff 0%, var(--color-primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Space Explorer
          </h1>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-muted)', maxWidth: '40ch', margin: '0 auto var(--space-8)' }}>
            Explora el universo con imágenes reales de la NASA y fotos del rover Curiosity en Marte
          </p>
          <a href="#content" style={{ padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#050810', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', letterSpacing: '0.05em', display: 'inline-block', transition: 'background var(--transition)', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.background = 'var(--color-primary-hover)'}
            onMouseLeave={e => e.target.style.background = 'var(--color-primary)'}
          >
            Explorar →
          </a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 'var(--space-8)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>
          <span>scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(var(--color-text-faint), transparent)' }} />
        </div>
      </header>

      {/* Tabs de navegación */}
      <div id="content" style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(5,8,16,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)', padding: 'var(--space-4) var(--space-8)', display: 'flex', gap: 'var(--space-2)' }}>
        {[{ id: 'apod', label: '🌌 APOD Gallery' }, { id: 'mars', label: '🔴 Marte' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-full)',
            border: activeTab === tab.id ? '1px solid rgba(99,179,237,0.4)' : '1px solid transparent',
            background: activeTab === tab.id ? 'rgba(99,179,237,0.1)' : 'transparent',
            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition)',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Contenido */}
      <main>
        {activeTab === 'apod' ? <APODSection /> : (
          <div style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: 1200, margin: '0 auto' }}>
            <MarsGallery />
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
        Space Explorer · Datos de <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>NASA API</a> · Hecho con React + Three.js
      </footer>
    </div>
  )
}