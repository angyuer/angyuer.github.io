import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.argv[2] || 'source/images/posts')
const supported = new Set(['.jpg', '.jpeg', '.png'])

const walk = async directory => {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => [])
  const nested = await Promise.all(entries.map(entry => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  }))
  return nested.flat()
}

const inputs = (await walk(root)).filter(file => supported.has(path.extname(file).toLowerCase()))

for (const input of inputs) {
  const parsed = path.parse(input)
  const webp = path.join(parsed.dir, `${parsed.name}.webp`)
  const avif = path.join(parsed.dir, `${parsed.name}.avif`)
  const pipeline = sharp(input).rotate().resize({ width: 2000, withoutEnlargement: true })
  await Promise.all([
    pipeline.clone().webp({ quality: 82 }).toFile(webp),
    pipeline.clone().avif({ quality: 55, effort: 5 }).toFile(avif)
  ])
  console.log(`${path.relative(process.cwd(), input)} -> WebP + AVIF`)
}

if (!inputs.length) console.log(`没有需要优化的图片：${path.relative(process.cwd(), root)}`)
