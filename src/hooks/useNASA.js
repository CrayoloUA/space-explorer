import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// Consigue tu key gratis en https://api.nasa.gov/
const API_KEY = 'DEMO_KEY'
const BASE_URL = 'https://api.nasa.gov'
const CACHE_TTL = 1000 * 60 * 60 // 1 hora

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

export function useAPOD(date = '') {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cacheKey = `apod_${date || 'today'}`
    const cached = getCache(cacheKey)
    if (cached) { setData(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    const params = { api_key: API_KEY }
    if (date) params.date = date

    axios.get(`${BASE_URL}/planetary/apod`, { params })
      .then(res => { setCache(cacheKey, res.data); setData(res.data) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [date])

  return { data, loading, error }
}

export function useMarsRover(page = 1) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cacheKey = `mars_p${page}`
    const cached = getCache(cacheKey)
    if (cached) { setData(cached); setLoading(false); return }

    setLoading(true)
    setError(null)
    axios.get(`${BASE_URL}/mars-photos/api/v1/rovers/curiosity/photos`, {
      params: { api_key: API_KEY, sol: 1000, page }
    })
      .then(res => { setCache(cacheKey, res.data.photos); setData(res.data.photos) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  return { data, loading, error }
}