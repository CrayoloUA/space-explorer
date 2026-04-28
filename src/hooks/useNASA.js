import { useState, useEffect } from 'react'  // hooks de React para estado y efectos secundarios
import axios from 'axios'                      // librería para hacer peticiones HTTP

// lee la clave del archivo .env.local (VITE_NASA_API_KEY=tu_clave); si no existe usa DEMO_KEY
const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const BASE_URL = 'https://api.nasa.gov'                       // URL base de la NASA API
const CACHE_TTL = 1000 * 60 * 60                              // tiempo de vida del caché: 1 hora en milisegundos
const JPL_BASE = '/jpl-proxy/rss/api'                         // ruta del proxy local para evitar CORS con la NASA JPL
const MARS_FALLBACK_SOLS = [1000, 500, 1500, 100, 200, 800, 1200, 50]  // sols alternativos si el sol pedido no tiene fotos

// devuelve localStorage si está disponible, o null si no (ej. en SSR o modo privado bloqueado)
function safeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch {}
  return null
}

// lee un valor del caché; lo descarta si expiró según CACHE_TTL
function getCache(key) {
  const storage = safeStorage()
  if (!storage) return null           // no hay almacenamiento disponible
  try {
    const raw = storage.getItem(key)  // obtiene el string guardado
    if (!raw) return null             // no existe esa clave
    const { data, ts } = JSON.parse(raw)                                         // desestructura datos y timestamp
    if (Date.now() - ts > CACHE_TTL) { storage.removeItem(key); return null }    // expiró: borra y retorna null
    return data                       // devuelve los datos si aún son válidos
  } catch { return null }
}

// guarda un valor en el caché junto con el timestamp actual
function setCache(key, data) {
  const storage = safeStorage()
  if (!storage) return  // no hay dónde guardar, sale sin hacer nada
  try { storage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}  // serializa y guarda
}

// extrae el mensaje de error más descriptivo de una respuesta de axios
function extractApiError(err) {
  return (
    err.response?.data?.error?.message ||  // error con estructura NASA estándar
    err.response?.data?.msg ||             // mensaje corto alternativo
    err.response?.data?.message ||         // otro formato de mensaje
    err.message                            // mensaje genérico del error de JS
  )
}

// hook que descarga una galería aleatoria de N imágenes APOD de la NASA
export function useAPODGallery(count = 9) {
  const [data, setData] = useState([])      // lista de imágenes descargadas
  const [loading, setLoading] = useState(true)  // indica si se está cargando
  const [error, setError] = useState(null)  // mensaje de error si falla
  const [tick, setTick] = useState(0)       // contador para forzar recarga cuando el usuario pulsa "refetch"

  useEffect(() => {
    let cancelled = false  // bandera para evitar actualizar estado si el componente se desmontó

    async function load() {
      setLoading(true)
      setError(null)
      const cacheKey = `apod_gallery_${count}`  // clave única de caché según la cantidad pedida
      let localError = null
      let result = getCache(cacheKey)            // intenta leer del caché primero

      if (!result) {  // si no hay caché válido, hace la petición a la API
        try {
          const res = await axios.get(`${BASE_URL}/planetary/apod`, {
            params: { api_key: API_KEY, count }  // parámetros: clave API y cantidad de imágenes
          })
          result = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))  // ordena de más reciente a más antiguo
          setCache(cacheKey, result)  // guarda en caché para no repetir la petición
        } catch (err) {
          localError = extractApiError(err)  // captura el mensaje de error legible
        }
      }

      if (!cancelled) {          // solo actualiza el estado si el componente sigue montado
        setData(result || [])    // guarda las imágenes o array vacío si falló
        setError(localError)     // guarda el error si lo hubo
        setLoading(false)        // termina la carga
      }
    }

    load()
    return () => { cancelled = true }  // cleanup: marca como cancelado si el efecto se limpia
  }, [count, tick])  // vuelve a ejecutar si cambia la cantidad o si el usuario pide recarga

  return { data, loading, error, refetch: () => setTick(t => t + 1) }  // expone datos y función de recarga
}

// convierte la estructura de imagen de la API JPL al formato que usa el componente
function normalizeJPLPhoto(img) {
  return {
    id: img.imageid,  // ID único de la foto
    img_src: img.image_files?.medium || img.image_files?.full || img.image_files?.large || img.image_files?.small,  // elige la mejor resolución disponible
    camera: { full_name: img.camera?.instrument || img.camera?.filter_name || 'Camera' },  // nombre de la cámara o valor por defecto
    earth_date: img.date_taken_utc?.slice(0, 10) || img.date_received?.slice(0, 10) || '',  // fecha en formato YYYY-MM-DD
  }
}

// hace la petición a la API JPL de Marte para un sol y página dados
async function fetchJPLPhotos(sol, page) {
  const res = await axios.get(JPL_BASE, {
    params: { feed: 'raw_images', category: 'mars2020', feedtype: 'json', num: 25, page, sol }  // solicita 25 fotos crudas del rover Perseverance
  })
  return (res.data.images || []).map(normalizeJPLPhoto).filter(p => p.img_src)  // normaliza y filtra las que tienen URL de imagen
}

// hook que descarga fotos del rover Perseverance en Marte para un sol y página dados
export function useMarsRover(page = 1, sol = 1000) {
  const [data, setData] = useState([])           // lista de fotos de Marte
  const [loading, setLoading] = useState(true)   // estado de carga
  const [error, setError] = useState(null)       // mensaje de error
  const [resolvedSol, setResolvedSol] = useState(sol)  // el sol que finalmente devolvió fotos (puede diferir del pedido)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      let localError = null

      const solsToTry = [sol, ...MARS_FALLBACK_SOLS.filter(s => s !== sol)]  // lista de sols a intentar: primero el pedido, luego los fallbacks

      for (const s of solsToTry) {  // itera cada sol hasta encontrar uno con fotos
        const cacheKey = `jpl_mars_sol${s}_p${page}`  // clave de caché por sol y página
        const cached = getCache(cacheKey)
        if (cached?.length > 0) {  // si hay caché con fotos, lo usa directamente
          if (!cancelled) { setData(cached); setResolvedSol(s); setLoading(false) }
          return
        }
        try {
          const photos = await fetchJPLPhotos(s, page)  // intenta descargar fotos del sol actual
          if (photos.length > 0) {            // si encontró fotos, las guarda y termina
            setCache(cacheKey, photos)
            if (!cancelled) { setData(photos); setResolvedSol(s); setLoading(false) }
            return
          }
        } catch (err) {
          localError = extractApiError(err)
          const status = err.response?.status
          if (status === 429 || status === 403) break  // si hay límite de tasa o acceso denegado, deja de intentar
        }
      }

      // si ningún sol devolvió fotos, reporta el error
      if (!cancelled) {
        setData([])
        setError(localError || 'No se encontraron fotos para ningún sol disponible.')
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }  // cleanup
  }, [page, sol])  // vuelve a cargar si cambia la página o el sol

  return { data, loading, error, resolvedSol }  // expone datos y el sol que efectivamente se usó
}

// hook que descarga la lista de asteroides cercanos a la Tierra del día de hoy
export function useNeoFeed() {
  const [data, setData] = useState([])           // lista de asteroides
  const [loading, setLoading] = useState(true)   // estado de carga
  const [error, setError] = useState(null)       // mensaje de error
  const [tick, setTick] = useState(0)            // contador para forzar recarga

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const cacheKey = 'neo_feed_today'  // clave fija porque siempre pide el día actual
      let localError = null
      let result = getCache(cacheKey)    // intenta usar caché antes de ir a la API

      if (!result) {
        try {
          const today = new Date().toISOString().split('T')[0]  // fecha de hoy en formato YYYY-MM-DD
          const res = await axios.get(`${BASE_URL}/neo/rest/v1/feed`, {
            params: { api_key: API_KEY, start_date: today, end_date: today }  // pide asteroides solo de hoy
          })
          const items = res.data.near_earth_objects?.[today] || []  // extrae el array de asteroides de hoy
          result = items.slice(0, 6).map(item => ({  // toma máximo 6 asteroides y los normaliza
            id: item.id,
            name: item.name,
            hazardous: item.is_potentially_hazardous_asteroid,          // si es potencialmente peligroso
            magnitude: item.absolute_magnitude_h,                       // magnitud absoluta (brillo)
            diameterMin: item.estimated_diameter.kilometers.estimated_diameter_min,  // diámetro mínimo estimado
            diameterMax: item.estimated_diameter.kilometers.estimated_diameter_max,  // diámetro máximo estimado
            velocity: item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour,  // velocidad relativa en km/h
            missDistance: item.close_approach_data?.[0]?.miss_distance?.kilometers,           // distancia mínima de paso en km
          }))
          setCache(cacheKey, result)  // guarda en caché
        } catch (err) {
          localError = extractApiError(err)
        }
      }

      if (!cancelled) {
        setData(result || [])
        setError(localError)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }  // cleanup
  }, [tick])  // vuelve a ejecutar solo si el usuario pide recarga

  return { data, loading, error, refetch: () => setTick(t => t + 1) }  // expone datos y función de recarga
}
