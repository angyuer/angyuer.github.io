import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'

const root = path.resolve(process.argv[2] || 'public')
const outputDir = path.resolve('.lighthouseci')
const lighthouseEntry = fileURLToPath(import.meta.url)
const pages = [
  { name: 'home', path: '/' },
  { name: 'post', path: '/posts/4a17b156.html' }
]
const thresholds = {
  performance: 0.85,
  accessibility: 0.95,
  'best-practices': 0.9,
  seo: 0.95
}
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8']
])

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname)
    const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname
    const file = path.resolve(root, relativePath.replace(/^\/+/, ''))

    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end('Forbidden')
      return
    }

    const body = await fs.readFile(file)
    const contentType = mimeTypes.get(path.extname(file).toLowerCase()) || 'application/octet-stream'
    const supportsGzip = /\bgzip\b/.test(request.headers['accept-encoding'] || '')
    const compressible = /^(?:text\/|application\/(?:javascript|json|xml)|image\/svg\+xml)/.test(contentType)
    const headers = {
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
      Vary: 'Accept-Encoding'
    }
    const payload = supportsGzip && compressible ? gzipSync(body, { level: 6 }) : body
    if (payload !== body) headers['Content-Encoding'] = 'gzip'
    response.writeHead(200, headers)
    response.end(payload)
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`${lighthouseEntry}: ${error.message}`)
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end(error.code === 'ENOENT' ? 'Not found' : 'Server error')
  }
})

const listen = () => new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

const closeServer = () => new Promise(resolve => server.close(resolve))

if (!await fs.stat(root).then(stat => stat.isDirectory(), () => false)) {
  console.error(`找不到构建目录：${root}`)
  process.exit(1)
}

await fs.mkdir(outputDir, { recursive: true })
await listen()

const address = server.address()
const baseURL = `http://127.0.0.1:${address.port}`
let chrome
const failures = []

try {
  chrome = await launch({
    chromePath: process.env.CHROME_PATH,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  })

  for (const page of pages) {
    const result = await lighthouse(`${baseURL}${page.path}`, {
      logLevel: 'error',
      output: ['json', 'html'],
      port: chrome.port,
      onlyCategories: Object.keys(thresholds)
    })

    if (!result) {
      failures.push(`${page.path}: Lighthouse 没有返回结果`)
      continue
    }

    const reports = Array.isArray(result.report) ? result.report : [result.report]
    const [jsonReport, htmlReport] = reports
    if (!jsonReport || !htmlReport) {
      failures.push(`${page.path}: Lighthouse 报告格式不完整`)
      continue
    }
    await Promise.all([
      fs.writeFile(path.join(outputDir, `${page.name}.report.json`), jsonReport),
      fs.writeFile(path.join(outputDir, `${page.name}.report.html`), htmlReport)
    ])

    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([name, category]) => [name, category.score]))
    console.log(`${page.path} ${Object.entries(scores).map(([name, score]) => `${name}=${Math.round(score * 100)}`).join(' ')}`)

    for (const [category, minimum] of Object.entries(thresholds)) {
      const score = scores[category]
      if (typeof score !== 'number' || score < minimum) {
        failures.push(`${page.path}: ${category} ${Math.round((score || 0) * 100)}，要求至少 ${Math.round(minimum * 100)}`)
      }
    }
  }
} finally {
  if (chrome) await chrome.kill()
  await closeServer()
}

if (failures.length) {
  console.error(`Lighthouse 检查失败：\n${failures.join('\n')}`)
  process.exit(1)
}

console.log('Lighthouse 检查通过。')
