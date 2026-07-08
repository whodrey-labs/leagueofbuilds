const http = require('http')
const { URL } = require('url')

const PORT = process.env.PORT || 8080
const DATA_DRAGON_BASE = 'https://ddragon.leagueoflegends.com'
const MERAKI_BASE = 'https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/champions'
const LOCALE = 'en_US'

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`)

  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  try {
    if (requestUrl.pathname === '/health') {
      writeJson(response, 200, { status: 'ok' })
      return
    }

    if (requestUrl.pathname === '/api/game-data') {
      const version = await getVersion(requestUrl.searchParams.get('version'))
      const [championList, itemList, runeList] = await Promise.all([
        fetchJson(`${DATA_DRAGON_BASE}/cdn/${version}/data/${LOCALE}/champion.json`),
        fetchJson(`${DATA_DRAGON_BASE}/cdn/${version}/data/${LOCALE}/item.json`),
        fetchJson(`${DATA_DRAGON_BASE}/cdn/${version}/data/${LOCALE}/runesReforged.json`),
      ])

      writeJson(response, 200, { version, championList, itemList, runeList })
      return
    }

    if (requestUrl.pathname.startsWith('/api/champion/')) {
      const championId = requestUrl.pathname.replace('/api/champion/', '')
      const version = await getVersion(requestUrl.searchParams.get('version'))
      const [championPayload, merakiChampion] = await Promise.all([
        fetchJson(`${DATA_DRAGON_BASE}/cdn/${version}/data/${LOCALE}/champion/${championId}.json`),
        fetchOptionalJson(`${MERAKI_BASE}/${championId}.json`),
      ])

      writeJson(response, 200, {
        ...championPayload.data[championId],
        merakiChampion,
      })
      return
    }

    writeJson(response, 404, { error: 'Not found' })
  } catch (error) {
    writeJson(response, 500, {
      error: 'Failed to fetch Riot data.',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on ${PORT}`)
})

async function getVersion(requestedVersion) {
  if (requestedVersion) {
    return requestedVersion
  }

  const versions = await fetchJson(`${DATA_DRAGON_BASE}/api/versions.json`)
  return versions[0]
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`)
  }

  return response.json()
}

async function fetchOptionalJson(url) {
  try {
    return await fetchJson(url)
  } catch {
    return null
  }
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(payload))
}

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
