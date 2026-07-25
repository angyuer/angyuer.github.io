import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const CHANNELS = {
  tech: { category: '技术' },
  journal: { category: '日记' },
  project: { category: '项目' }
}

const BODY_TEMPLATES = {
  tech: `<!-- 正文从 H2 开始，删除不需要的章节。 -->
## 问题

<!-- 说明问题、现象和期望结果。 -->

## 环境

<!-- 列出系统、运行时、框架和关键依赖版本。 -->

## 方案

<!-- 说明选择、取舍和实现思路。 -->

## 实现

<!-- 给出关键步骤和必要代码。 -->

## 验证

<!-- 记录验证方法和结果。 -->

## 参考资料

<!-- 引用第三方资料时注明作者、名称和原文地址。 -->`,
  journal: `<!-- 正文从 H2 开始，删除不需要的章节。 -->
## 记录

<!-- 记录发生的事情和背景。 -->

## 思考

<!-- 写下判断、感受或变化。 -->

## 接下来

<!-- 记录下一步行动。 -->`,
  project: `<!-- 正文从 H2 开始，删除不需要的章节。 -->
## 背景与目标

<!-- 说明项目背景、约束和目标。 -->

## 我的职责

<!-- 说明负责的范围和协作边界。 -->

## 方案

<!-- 说明架构、技术选择和关键决策。 -->

## 难点与取舍

<!-- 记录问题、备选方案和最终取舍。 -->

## 结果

<!-- 使用事实或数据说明结果。 -->

## 复盘

<!-- 总结有效做法、遗留问题和后续计划。 -->

## 参考资料

<!-- 引用第三方资料时注明作者、名称和原文地址。 -->`
}

const [, , channel, ...titleParts] = process.argv
const title = titleParts.join(' ').trim()

if (!CHANNELS[channel] || !title) {
  console.error('用法: npm run new:tech -- "文章标题"')
  process.exit(1)
}

const pad = value => String(value).padStart(2, '0')
const now = new Date()
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
const slugBase = title
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 72)
const slug = slugBase || `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${now.getTime()}`
const output = path.resolve('source', '_posts', `${slug}.md`)
const imageDir = path.resolve('source', 'images', 'posts', slug)

if (fs.existsSync(output)) {
  console.error(`文件已存在: ${output}`)
  process.exit(1)
}

const frontMatter = {
  layout: 'post',
  title,
  date,
  updated: date,
  channel,
  categories: [CHANNELS[channel].category],
  tags: [],
  summary: '',
  cover: `/images/posts/${slug}/cover.webp`,
  featured: false
}

if (channel === 'project') {
  Object.assign(frontMatter, {
    project_status: 'ongoing',
    project_period: '',
    project_role: '',
    project_stack: [],
    project_links: []
  })
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.mkdirSync(imageDir, { recursive: true })
fs.writeFileSync(output, matter.stringify(`\n${BODY_TEMPLATES[channel]}\n`, frontMatter), 'utf8')
console.log(`文章：${path.relative(process.cwd(), output)}`)
console.log(`图片：${path.relative(process.cwd(), imageDir)}`)
