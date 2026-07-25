import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const checkOnly = args.includes('--check')
const rootArg = args.find(arg => !arg.startsWith('--')) || 'source/images/posts'
const root = path.resolve(rootArg)
const kib = 1024
const sourceLimit = 8 * 1024 * kib
const sourcePixelLimit = 40_000_000
const outputLimit = 450 * kib
const outputDimensionLimit = 2000
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png'])
const outputExtensions = new Set(['.webp', '.avif'])
const errors = []
let created = 0
let unchanged = 0

const variants = {
  webp: {
    qualities: [82, 76, 70, 64],
    options: quality => ({ quality, smartSubsample: true })
  },
  avif: {
    qualities: [55, 49, 43],
    options: quality => ({ quality, effort: 4 })
  }
}

const walk = async directory => {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  const nested = await Promise.all(entries.map(entry => {
    const fullPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(fullPath) : [fullPath]
  }))
  return nested.flat()
}

const relative = file => path.relative(process.cwd(), file)

const sameFile = async (file, buffer) => {
  const current = await fs.readFile(file).catch(error => {
    if (error.code === 'ENOENT') return null
    throw error
  })
  return current?.equals(buffer) || false
}

const encodeWithinBudget = async (input, format) => {
  const { qualities, options } = variants[format]
  let smallest = null

  for (const quality of qualities) {
    const buffer = await sharp(input)
      .rotate()
      .resize({
        width: outputDimensionLimit,
        height: outputDimensionLimit,
        fit: 'inside',
        withoutEnlargement: true
      })
      [format](options(quality))
      .toBuffer()

    if (!smallest || buffer.length < smallest.length) smallest = buffer
    if (buffer.length <= outputLimit) return buffer
  }

  return smallest
}

const writeVariant = async (input, output, format) => {
  const buffer = await encodeWithinBudget(input, format)
  if (buffer.length > outputLimit) {
    errors.push(`${relative(input)}: ${format.toUpperCase()} 无法压缩到 ${outputLimit / kib} KiB 以内`)
    return
  }

  const matches = await sameFile(output, buffer)
  if (matches) {
    unchanged += 1
    return
  }

  if (checkOnly) {
    errors.push(`${relative(output)}: 缺失或不是当前源图生成的最新版本`)
    return
  }

  await fs.writeFile(output, buffer)
  created += 1
  console.log(`${relative(input)} -> ${path.basename(output)}`)
}

const initialFiles = await walk(root)
const inputs = initialFiles
  .filter(file => sourceExtensions.has(path.extname(file).toLowerCase()))
  .sort()
const outputOwners = new Map()

for (const input of inputs) {
  const parsed = path.parse(input)
  const outputKey = path.join(parsed.dir, parsed.name).toLowerCase()
  if (outputOwners.has(outputKey)) {
    errors.push(`${relative(input)}: 与 ${relative(outputOwners.get(outputKey))} 会生成同名优化图片`)
    continue
  }
  outputOwners.set(outputKey, input)

  const [stat, metadata] = await Promise.all([fs.stat(input), sharp(input).metadata()])
  const pixels = (metadata.width || 0) * (metadata.height || 0)
  if (stat.size > sourceLimit) {
    errors.push(`${relative(input)}: 源图 ${(stat.size / 1024 / kib).toFixed(1)} MiB，超过 8 MiB`)
    continue
  }
  if (!pixels || pixels > sourcePixelLimit) {
    errors.push(`${relative(input)}: 源图像素必须有效且不超过 4000 万`)
    continue
  }

  await Promise.all(Object.keys(variants).map(format => {
    const output = path.join(parsed.dir, `${parsed.name}.${format}`)
    return writeVariant(input, output, format)
  }))
}

const optimizedFiles = (await walk(root))
  .filter(file => outputExtensions.has(path.extname(file).toLowerCase()))
  .sort()

for (const file of optimizedFiles) {
  const [stat, metadata] = await Promise.all([fs.stat(file), sharp(file).metadata()])
  if (stat.size > outputLimit) {
    errors.push(`${relative(file)}: ${(stat.size / kib).toFixed(1)} KiB，超过 ${outputLimit / kib} KiB`)
  }
  if ((metadata.width || 0) > outputDimensionLimit || (metadata.height || 0) > outputDimensionLimit) {
    errors.push(`${relative(file)}: 尺寸 ${metadata.width}x${metadata.height}，最长边不得超过 ${outputDimensionLimit}px`)
  }
}

if (errors.length) {
  console.error(`文章图片检查失败：\n${errors.join('\n')}`)
  process.exit(1)
}

const mode = checkOnly ? '检查' : '优化'
console.log(`文章图片${mode}通过：${inputs.length} 张源图，${optimizedFiles.length} 张优化图，${created} 个更新，${unchanged} 个未变化。`)
