import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_KEY = 'dZevrbNxRZCgtGvFlUFN6tkPFbVl9FHgTUgLejME'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60

// Soles marcianos confirmados con fotos (1 sol = 1 día marciano)
// Sol 0 = 6 agosto 2012 (aterrizaje del Curiosity)
const FALLBACK_SOLS = [1000, 500, 1500, 2000, 2500, 3000, 3500, 100, 200]

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

async function fetchMarsBySol(sol, page) {
  const res = await axios.get(`${BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
    params: { api_key: API_KEY, sol, page }
  })
  return res.data.photos
}

export function useMarsRover(page = 1, sol = 1000) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [resolvedSol, setResolvedSol] = useState(sol)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      const solsToTry = [sol, ...FALLBACK_SOLS.filter(s => s !== sol)]

      for (const s of solsToTry) {
        const cacheKey = `mars_sol${s}_p${page}`
        const cached = getCache(cacheKey)
        if (cached && cached.length > 0) {
          if (!cancelled) { setData(cached); setResolvedSol(s); setLoading(false) }
          return
        }
        try {
          const photos = await fetchMarsBySol(s, page)
          if (photos && photos.length > 0) {
            setCache(cacheKey, photos)
            if (!cancelled) { setData(photos); setResolvedSol(s); setLoading(false) }
            return
          }
        } catch { /* continúa con el siguiente sol */ }
      }

      if (!cancelled) { setData([]); setError('No se encontraron fotos'); setLoading(false) }
    }

    load()
    return () => { cancelled = true }
  }, [page, sol])

  return { data, loading, error, resolvedSol }
}
