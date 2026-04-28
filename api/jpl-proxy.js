export default async function handler(req, res) {
  const target = new URL('https://mars.nasa.gov/rss/api')

  Object.entries(req.query).forEach(([key, value]) => {
    target.searchParams.set(key, value)
  })

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Space-Explorer/1.0 (+https://github.com)'
      },
    })
    const data = await upstream.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(upstream.status).json(data)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
}
