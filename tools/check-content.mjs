import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const postsDir = path.resolve('source', '_posts')
const sourceDir = path.resolve('source')
const channelCategories = new Map([
  ['tech', '技术'],
  ['journal', '日记'],
  ['project', '项目']
])
const requiredFields = ['layout', 'title', 'date', 'updated', 'channel', 'categories', 'tags', 'summary', 'cover', 'featured']
const legacyStyleFiles = new Set(['md文件的基本常用编写语法.md'])
const legacyFilenameFiles = new Set([
  'md文件的基本常用编写语法.md',
  '如何在cocos-creator中使用fairyGui中使用默认字体.md',
  '我的第一篇博客文章.md'
])
const errors = []
const abbrlinks = new Map()

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.md'))
  .sort()

const characterLength = value => [...String(value).trim()].length

const parseDate = value => {
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(String(value))
  return Number.isFinite(timestamp) ? timestamp : null
}

const markdownLinesOutsideCode = content => {
  const output = []
  let fence = null
  let inComment = false

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()

    if (inComment) {
      if (trimmed.includes('-->')) inComment = false
      continue
    }

    if (trimmed.startsWith('<!--')) {
      if (!trimmed.includes('-->')) inComment = true
      continue
    }

    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = null
      continue
    }

    if (!fence) output.push(line)
  }

  return output
}

const validateLocalImage = (file, imagePath, label) => {
  let cleanPath
  try {
    cleanPath = decodeURIComponent(imagePath.split(/[?#]/, 1)[0])
  } catch {
    errors.push(`${file}: ${label}路径无法解析：${imagePath}`)
    return
  }
  if (!cleanPath.startsWith('/images/')) {
    errors.push(`${file}: ${label}必须位于 /images/ 下或使用 HTTPS 地址`)
    return
  }
  if (cleanPath.startsWith('/images/posts/') && !/\.(?:webp|avif)$/i.test(cleanPath)) {
    errors.push(`${file}: ${label}位于文章图片目录时必须使用 WebP 或 AVIF：${imagePath}`)
    return
  }

  const resolved = path.resolve(sourceDir, cleanPath.replace(/^\/+/, ''))
  if (!resolved.startsWith(`${sourceDir}${path.sep}`) || !fs.existsSync(resolved)) {
    errors.push(`${file}: ${label}不存在：${imagePath}`)
  }
}

const validateBody = (file, content) => {
  if (legacyStyleFiles.has(file)) return

  const lines = markdownLinesOutsideCode(content)
  const lintableContent = lines.join('\n')
  const headings = []

  for (const [index, line] of lines.entries()) {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/)
    if (!match) continue

    const level = match[1].length
    const title = match[2].trim()
    headings.push({ level, title, line: index + 1 })

    if (level === 1) errors.push(`${file}:${index + 1}: 正文不得使用一级标题，文章标题已由页面模板生成`)
    if (level > 4) errors.push(`${file}:${index + 1}: 标题最深只能使用四级标题`)
    if (/[。；，、：;,:]$/.test(title)) errors.push(`${file}:${index + 1}: 标题末尾不使用点号`)
  }

  if (headings.length && headings[0].level !== 2) {
    errors.push(`${file}:${headings[0].line}: 正文第一个标题必须是二级标题`)
  }

  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index].level > headings[index - 1].level + 1) {
      errors.push(`${file}:${headings[index].line}: 标题层级从 H${headings[index - 1].level} 跳到了 H${headings[index].level}`)
    }
  }

  const prose = lines
    .filter(line => !/^#{1,6}\s+/.test(line))
    .join('\n')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_>#|~-]/g, '')
    .replace(/\s/g, '')

  if (characterLength(prose) < 20) errors.push(`${file}: 正文有效内容不能少于 20 个字符`)

  const plainText = lintableContent
  if (/[０-９]/.test(plainText)) errors.push(`${file}: 阿拉伯数字必须使用半角形式`)
  if (/(?:!|！){2,}/.test(plainText)) errors.push(`${file}: 不得连续使用多个感叹号`)
  if (/\.\.\.|。。。/.test(plainText)) errors.push(`${file}: 中文省略号应使用 ⋯⋯`)

  const imagePattern = /!\[([^\]]*)\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g
  for (const match of lintableContent.matchAll(imagePattern)) {
    const [, alt, wrappedUrl, plainUrl] = match
    const imagePath = wrappedUrl || plainUrl
    if (!alt.trim()) errors.push(`${file}: Markdown 图片必须填写 Alt 文本：${imagePath}`)
    if (/^http:\/\//i.test(imagePath) || imagePath.startsWith('//')) errors.push(`${file}: 外部图片必须使用 HTTPS：${imagePath}`)
    else if (!/^https:\/\//i.test(imagePath)) validateLocalImage(file, imagePath, '正文图片')
  }

  const linkPattern = /(?<!!)\[([^\]]+)\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g
  for (const match of lintableContent.matchAll(linkPattern)) {
    const [, text, wrappedUrl, plainUrl] = match
    const target = wrappedUrl || plainUrl
    if (/^(点击这里|这里|链接)$/i.test(text.trim())) errors.push(`${file}: 链接文字必须说明目标内容：${text}`)
    if (/^http:\/\//i.test(target) || target.startsWith('//')) errors.push(`${file}: 外部链接必须使用 HTTPS：${target}`)
  }
}

for (const file of files) {
  const fullPath = path.join(postsDir, file)
  const { data, content } = matter.read(fullPath)

  for (const field of requiredFields) {
    if (!(field in data) || data[field] === null) errors.push(`${file}: 缺少 ${field}`)
  }

  if (!legacyFilenameFiles.has(file) && !/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file)) {
    errors.push(`${file}: 文件名必须使用小写半角字母、数字和连字符`)
  }

  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const summary = typeof data.summary === 'string' ? data.summary.trim() : ''
  const cover = typeof data.cover === 'string' ? data.cover.trim() : ''
  const publishedAt = parseDate(data.date)
  const updatedAt = parseDate(data.updated)

  if (data.layout !== 'post') errors.push(`${file}: layout 必须是 post`)
  if (characterLength(title) < 2 || characterLength(title) > 80) errors.push(`${file}: title 长度必须为 2～80 个字符`)
  if (/[。；，、：;,:]$/.test(title)) errors.push(`${file}: title 末尾不使用点号`)
  if (!publishedAt) errors.push(`${file}: date 不是有效日期`)
  if (!updatedAt) errors.push(`${file}: updated 不是有效日期`)
  if (publishedAt && updatedAt && updatedAt < publishedAt) errors.push(`${file}: updated 不得早于 date`)

  const expectedCategory = channelCategories.get(data.channel)
  if (!expectedCategory) errors.push(`${file}: channel 必须是 tech、journal 或 project`)
  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push(`${file}: categories 至少需要一项`)
  } else if (expectedCategory && data.categories[0] !== expectedCategory) {
    errors.push(`${file}: categories 第一项必须是 ${expectedCategory}`)
  }

  if (!Array.isArray(data.tags) || data.tags.length < 1 || data.tags.length > 8) {
    errors.push(`${file}: tags 需要包含 1～8 项`)
  } else {
    const tags = data.tags.map(tag => String(tag).trim())
    if (tags.some(tag => !tag)) errors.push(`${file}: tags 不能包含空值`)
    if (new Set(tags).size !== tags.length) errors.push(`${file}: tags 不能重复`)
  }

  if (characterLength(summary) < 20 || characterLength(summary) > 180) {
    errors.push(`${file}: summary 长度必须为 20～180 个字符`)
  }

  if (!cover) errors.push(`${file}: cover 不能为空`)
  else if (/^http:\/\//i.test(cover) || cover.startsWith('//')) errors.push(`${file}: 外部 cover 必须使用 HTTPS`)
  else if (!/^https:\/\//i.test(cover)) validateLocalImage(file, cover, 'cover')

  if (typeof data.featured !== 'boolean') errors.push(`${file}: featured 必须是布尔值`)

  if (data.abbrlink !== undefined) {
    const key = String(data.abbrlink)
    if (abbrlinks.has(key)) errors.push(`${file}: abbrlink ${key} 与 ${abbrlinks.get(key)} 重复`)
    else abbrlinks.set(key, file)
  }

  validateBody(file, content)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`内容检查通过：${files.length} 篇文章，采用阮一峰中文技术文档规范。`)
