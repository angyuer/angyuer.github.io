import fs from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'

const publicDir = path.resolve(process.argv[2] || 'public')
const errors = []
const legacyMultipleH1Pages = new Set(['posts/f134a8e5.html'])

const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const fullPath = path.join(directory, entry.name)
  return entry.isDirectory() ? walk(fullPath) : [fullPath]
})

if (!fs.existsSync(publicDir)) {
  console.error(`找不到构建目录：${publicDir}`)
  process.exit(1)
}

const htmlFiles = walk(publicDir).filter(file => file.endsWith('.html'))

for (const file of htmlFiles) {
  const relativeFile = path.relative(publicDir, file)
  const $ = load(fs.readFileSync(file, 'utf8'))
  const report = message => errors.push(`${relativeFile}: ${message}`)
  const isRedirect = $('meta[http-equiv="refresh"]').length > 0

  if (!$('html').attr('lang')?.trim()) report('html 缺少 lang 属性')
  if ($('title').length !== 1 || !$('title').text().trim()) report('需要唯一且非空的 title')
  if ($('main').length !== 1) report('需要唯一的 main 内容区域')
  if ($('h1').length === 0) report('缺少 h1')
  if ($('h1').length > 1 && !legacyMultipleH1Pages.has(relativeFile)) report(`只能包含一个 h1，当前有 ${$('h1').length} 个`)

  const canonical = $('link[rel="canonical"]')
  if (canonical.length !== 1 || !/^https:\/\//.test(canonical.attr('href') || '')) report('缺少唯一的 HTTPS canonical URL')

  if (isRedirect) {
    if (!/noindex/i.test($('meta[name="robots"]').attr('content') || '')) report('重定向页需要设置 noindex')
  } else {
    const description = $('meta[name="description"]')
    if (description.length !== 1 || !description.attr('content')?.trim()) report('缺少有效的 meta description')

    for (const property of ['og:title', 'og:description', 'og:url']) {
      const meta = `meta[property="${property}"]`
      if ($(meta).length !== 1 || !$(meta).attr('content')?.trim()) report(`缺少有效的 ${property}`)
    }
  }

  $('img').each((_, image) => {
    if ($(image).attr('alt') === undefined) report(`图片缺少 alt：${$(image).attr('src') || '(未知地址)'}`)
  })

  const ids = new Set()
  $('[id]').each((_, element) => {
    const id = $(element).attr('id')
    if (ids.has(id)) report(`存在重复 id：${id}`)
    ids.add(id)
  })
}

if (errors.length) {
  console.error(`HTML 检查失败，共 ${errors.length} 项：\n${errors.slice(0, 100).join('\n')}`)
  process.exit(1)
}

console.log(`HTML 检查通过：${htmlFiles.length} 个页面。`)
