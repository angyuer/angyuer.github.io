'use strict'

const redirects = {
  'posts/0.html': '/posts/f134a8e5.html'
}

hexo.extend.generator.register('legacy-redirects', () => {
  return Object.entries(redirects).map(([path, target]) => {
    const canonical = new URL(target, hexo.config.url).href

    return {
      path,
      data: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${canonical}"><title>页面已迁移</title></head><body><main><h1>页面已迁移</h1><p>正在前往 <a href="${target}">${target}</a>。</p></main></body></html>`
    }
  })
})
