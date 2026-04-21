import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_KEY = 'dZevrbNxRZCgtGvFlUFN6tkPFbVl9FHgTUgLejME'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60

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

export function useMarsRover(page = 1, earthDate = '2021-06-03') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cacheKey = `mars_${earthDate}_p${page}`
    const cached = getCache(cacheKey)
    if (cached) { setData(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    axios.get(`${BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
      params: { api_key: API_KEY, earth_date: earthDate, page }
    })
      .then(res => { setCache(cacheKey, res.data.photos); setData(res.data.photos) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, earthDate])

  return { data, loading, error }
}
