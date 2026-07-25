import fs from 'node:fs'
import path from 'node:path'

const publicDir = path.resolve(process.argv[2] || 'public')
const kib = 1024
const limits = new Map([
  ['.html', 300 * kib],
  ['.css', 200 * kib],
  ['.js', 200 * kib],
  ['.jpg', 450 * kib],
  ['.jpeg', 450 * kib],
  ['.png', 450 * kib],
  ['.webp', 450 * kib],
  ['.avif', 450 * kib],
  ['.gif', 450 * kib],
  ['.woff2', 180 * kib]
])
const coreAssets = [
  'css/index.css',
  'css/custom.css',
  'js/utils.js',
  'js/main.js',
  'js/site.js',
  'vendor/fontawesome/css/all.min.css',
  'images/hero/hero-desktop.webp'
]
const requiredOutput = ['CNAME', 'atom.xml', 'robots.txt', 'search.json', 'sitemap.xml']
const coreBudget = 1024 * kib
const errors = []

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

if (!fs.existsSync(publicDir)) {
  console.error(`找不到构建目录：${publicDir}`)
  process.exit(1)
}

for (const file of walk(publicDir)) {
  const extension = path.extname(file).toLowerCase()
  const limit = limits.get(extension)
  if (!limit) continue

  const size = fs.statSync(file).size
  if (size > limit) {
    errors.push(`${path.relative(publicDir, file)}: ${(size / kib).toFixed(1)} KiB，超过 ${(limit / kib).toFixed(0)} KiB`)
  }
}

const coreSize = coreAssets.reduce((total, asset) => {
  const file = path.join(publicDir, asset)
  if (!fs.existsSync(file)) {
    errors.push(`缺少核心静态资源：${asset}`)
    return total
  }
  return total + fs.statSync(file).size
}, 0)

for (const output of requiredOutput) {
  if (!fs.existsSync(path.join(publicDir, output))) errors.push(`缺少必要构建产物：${output}`)
}

if (coreSize > coreBudget) {
  errors.push(`核心静态资源：${(coreSize / kib).toFixed(1)} KiB，超过 ${(coreBudget / kib).toFixed(0)} KiB`)
}

if (errors.length) {
  console.error(`静态资源预算检查失败：\n${errors.join('\n')}`)
  process.exit(1)
}

console.log(`静态资源预算检查通过：核心资源 ${(coreSize / kib).toFixed(1)} KiB。`)
