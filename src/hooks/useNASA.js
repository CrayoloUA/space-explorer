import { useState, useEffect } from 'react'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60

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

async function withRetry(fn, times = 3, delayMs = 1500) {
  let lastErr
  for (let i = 0; i < times; i++) {
    try { return await fn() } catch (err) {
      lastErr = err
      const status = err.response?.status
      if (status && status >= 400 && status < 500) throw err
      if (i < times - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)))
    }
  }
  throw lastErr
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
          const res = await withRetry(() => axios.get(`${BASE_URL}/planetary/apod`, {
            params: { api_key: API_KEY, count }
          }))
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

export function useEpicImages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      const cacheKey = 'epic_natural_latest'
      let localError = null
      let result = getCache(cacheKey)

      if (!result) {
        try {
          // epic.gsfc.nasa.gov es el servidor directo de EPIC, sin API key ni redirecciones
          const res = await withRetry(() => axios.get('https://epic.gsfc.nasa.gov/api/natural'))
          result = res.data.slice(0, 12).map(img => {
            const [datePart] = img.date.split(' ')
            const [year, month, day] = datePart.split('-')
            return {
              id: img.identifier,
              image: img.image,
              caption: img.caption,
              date: datePart,
              thumbUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/thumbs/${img.image}.jpg`,
              fullUrl: `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${img.image}.png`,
              lat: img.centroid_coordinates?.lat?.toFixed(2),
              lon: img.centroid_coordinates?.lon?.toFixed(2),
            }
          })
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
  }, [])

  return { data, loading, error }
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
          const res = await withRetry(() => axios.get(`${BASE_URL}/neo/rest/v1/feed`, {
            params: { api_key: API_KEY, start_date: today, end_date: today }
          }))
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
