import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_KEY = 'dZevrbNxRZCgtGvFlUFN6tkPFbVl9FHgTUgLejME'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60

// Fechas confirmadas con fotos disponibles para usar como fallback
const FALLBACK_DATES = [
  '2022-01-01',
  '2021-09-15',
  '2021-03-10',
  '2020-10-05',
  '2020-03-01',
  '2019-06-20',
  '2018-11-15',
]

function getCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(key); return null }
    return data
  } catch { return null }
}

function setCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export function useAPODGallery(count = 9) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGallery = useCallback(() => {
    const cacheKey = `apod_gallery_${count}`
    const cached = getCache(cacheKey)
    if (cached) { setData(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    axios.get(`${BASE_URL}/planetary/apod`, { params: { api_key: API_KEY, count } })
      .then(res => {
        const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
        setCache(cacheKey, sorted)
        setData(sorted)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [count])

  useEffect(() => { fetchGallery() }, [fetchGallery])
  return { data, loading, error, refetch: fetchGallery }
}

async function fetchMarsPhotos(earthDate, page) {
  const res = await axios.get(`${BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
    params: { api_key: API_KEY, earth_date: earthDate, page }
  })
  return res.data.photos
}

export function useMarsRover(page = 1, earthDate = '2022-01-01') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [resolvedDate, setResolvedDate] = useState(earthDate)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      // Intentar la fecha elegida primero, luego los fallbacks
      const datesToTry = [earthDate, ...FALLBACK_DATES.filter(d => d !== earthDate)]

      for (const date of datesToTry) {
        const cacheKey = `mars_${date}_p${page}`
        const cached = getCache(cacheKey)
        if (cached && cached.length > 0) {
          if (!cancelled) { setData(cached); setResolvedDate(date); setLoading(false) }
          return
        }
        try {
          const photos = await fetchMarsPhotos(date, page)
          if (photos && photos.length > 0) {
            setCache(cacheKey, photos)
            if (!cancelled) { setData(photos); setResolvedDate(date); setLoading(false) }
            return
          }
        } catch {
          // 404 o error -> intenta la siguiente fecha
        }
      }

      // Si ninguna fecha funcionó
      if (!cancelled) { setData([]); setError('No se encontraron fotos'); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [page, earthDate])

  return { data, loading, error, resolvedDate }
}
