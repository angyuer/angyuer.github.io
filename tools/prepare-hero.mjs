import path from 'node:path'
import sharp from 'sharp'

const source = path.resolve(process.argv[2] || 'assets/hero/hero-source.jpg')
const outputDirectory = path.resolve('source/images/hero')

await Promise.all([
  sharp(source)
    .rotate()
    .resize(1600, 900, { fit: 'cover', position: 'attention' })
    .webp({ quality: 84 })
    .toFile(path.join(outputDirectory, 'hero-desktop.webp')),
  sharp(source)
    .rotate()
    .resize(720, 960, { fit: 'cover', position: 'attention' })
    .webp({ quality: 76 })
    .toFile(path.join(outputDirectory, 'hero-mobile.webp'))
])

console.log('主视觉已生成：hero-desktop.webp、hero-mobile.webp')
