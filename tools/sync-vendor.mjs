import fs from 'node:fs/promises'
import path from 'node:path'

const packageRoot = path.resolve('node_modules/@fortawesome/fontawesome-free')
const outputRoot = path.resolve('source/vendor/fontawesome')

await fs.rm(outputRoot, { recursive: true, force: true })
await fs.mkdir(path.join(outputRoot, 'css'), { recursive: true })
await fs.cp(path.join(packageRoot, 'css', 'all.min.css'), path.join(outputRoot, 'css', 'all.min.css'))
await fs.cp(path.join(packageRoot, 'webfonts'), path.join(outputRoot, 'webfonts'), { recursive: true })

console.log('Font Awesome 已同步到 source/vendor/fontawesome。')
