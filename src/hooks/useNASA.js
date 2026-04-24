import { useState, useEffect } from 'react'
import axios from 'axios'

const API_KEY = 'W7eUA0oyUgxcbtbRVRd3dKKFC0DbrDBoyfP3QYV1'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60
const JPL_BASE = '/jpl-proxy/rss/api'
const MARS_FALLBACK_SOLS = [1000, 500, 1500, 100, 200, 800, 1200, 50]

function safeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
  } catch {}
  return null
}

function getCache(key) {
  const storage = safeStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { storage.removeItem(key); return null }
    return data
  } catch { return null }
}

function setCache(key, data) {
  const storage = safeStorage()
  if (!storage) return
  try { storage.setItem(key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function extractApiError(err) {
  return (
    err.response?.data?.error?.message ||
    err.response?.data?.msg ||
    err.response?.data?.message ||
    err.message
  )
}

export function useAPODGallery(count = 9) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const cacheKey = `apod_gallery_${count}`
      let localError = null
      let result = getCache(cacheKey)

      if (!result) {
        try {
          const res = await axios.get(`${BASE_URL}/planetary/apod`, {
            params: { api_key: API_KEY, count }
          })
          result = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
          setCache(cacheKey, result)
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
    return () => { cancelled = true }
  }, [count, tick])

  return { data, loading, error, refetch: () => setTick(t => t + 1) }
}

function normalizeJPLPhoto(img) {
  return {
    id: img.imageid,
    img_src: img.image_files?.medium || img.image_files?.full || img.image_files?.large || img.image_files?.small,
    camera: { full_name: img.camera?.instrument || img.camera?.filter_name || 'Camera' },
    earth_date: img.date_taken_utc?.slice(0, 10) || img.date_received?.slice(0, 10) || '',
  }
}

async function fetchJPLPhotos(sol, page) {
  const res = await axios.get(JPL_BASE, {
    params: { feed: 'raw_images', category: 'mars2020', feedtype: 'json', num: 25, page, sol }
  })
  return (res.data.images || []).map(normalizeJPLPhoto).filter(p => p.img_src)
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
      let localError = null

      const solsToTry = [sol, ...MARS_FALLBACK_SOLS.filter(s => s !== sol)]

      for (const s of solsToTry) {
        const cacheKey = `jpl_mars_sol${s}_p${page}`
        const cached = getCache(cacheKey)
        if (cached?.length > 0) {
          if (!cancelled) { setData(cached); setResolvedSol(s); setLoading(false) }
          return
        }
        try {
          const photos = await fetchJPLPhotos(s, page)
          if (photos.length > 0) {
            setCache(cacheKey, photos)
            if (!cancelled) { setData(photos); setResolvedSol(s); setLoading(false) }
            return
          }
        } catch (err) {
          localError = extractApiError(err)
          const status = err.response?.status
          if (status === 429 || status === 403) break
        }
      }

      if (!cancelled) {
        setData([])
        setError(localError || 'No se encontraron fotos para ningún sol disponible.')
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [page, sol])

  return { data, loading, error, resolvedSol }
}

export function useNeoFeed() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const cacheKey = 'neo_feed_today'
      let localError = null
      let result = getCache(cacheKey)

      if (!result) {
        try {
          const today = new Date().toISOString().split('T')[0]
          const res = await axios.get(`${BASE_URL}/neo/rest/v1/feed`, {
            params: { api_key: API_KEY, start_date: today, end_date: today }
          })
          const items = res.data.near_earth_objects?.[today] || []
          result = items.slice(0, 6).map(item => ({
            id: item.id,
            name: item.name,
            hazardous: item.is_potentially_hazardous_asteroid,
            magnitude: item.absolute_magnitude_h,
            diameterMin: item.estimated_diameter.kilometers.estimated_diameter_min,
            diameterMax: item.estimated_diameter.kilometers.estimated_diameter_max,
            velocity: item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour,
            missDistance: item.close_approach_data?.[0]?.miss_distance?.kilometers,
          }))
          setCache(cacheKey, result)
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
    return () => { cancelled = true }
  }, [tick])

  return { data, loading, error, refetch: () => setTick(t => t + 1) }
}
