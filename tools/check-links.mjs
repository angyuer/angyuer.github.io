import fs from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'

const publicDir = path.resolve(process.argv[2] || 'public')
const errors = []

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

const existsAsPublicPath = pathname => {
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, '')
  const candidates = [
    path.join(publicDir, decoded),
    path.join(publicDir, decoded, 'index.html'),
    path.join(publicDir, `${decoded}.html`)
  ]
  return candidates.some(candidate => fs.existsSync(candidate))
}

for (const file of walk(publicDir).filter(file => file.endsWith('.html'))) {
  const $ = load(fs.readFileSync(file, 'utf8'))
  $('[href], [src]').each((_, element) => {
    const value = $(element).attr('href') || $(element).attr('src')
    if (!value || /^(?:https?:|mailto:|tel:|data:|javascript:|#|\/\/)/.test(value)) return

    const pathname = value.split(/[?#]/, 1)[0]
    const resolved = pathname.startsWith('/')
      ? pathname
      : `/${path.relative(publicDir, path.resolve(path.dirname(file), pathname))}`

    if (!existsAsPublicPath(resolved)) {
      errors.push(`${path.relative(publicDir, file)} -> ${value}`)
    }
  })
}

if (errors.length) {
  console.error(`发现 ${errors.length} 个失效的站内资源：\n${errors.slice(0, 50).join('\n')}`)
  process.exit(1)
}

console.log('站内链接检查通过。')
