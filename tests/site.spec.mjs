import { expect, test } from '@playwright/test'

const channels = [
  ['/tech/', '技术'],
  ['/journal/', '日记'],
  ['/projects/', '项目']
]

const expectNoHorizontalOverflow = async page => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
}

test('首页关键功能可用', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  await expect(page.locator('main')).toBeVisible()
  await expect(page.locator('#page-header h1')).toHaveText('昂予')
  await expectNoHorizontalOverflow(page)

  const html = page.locator('html')
  const themeBefore = await html.getAttribute('data-theme')
  await page.locator('#nav-darkmode').click()
  await expect(html).not.toHaveAttribute('data-theme', themeBefore)

  await page.locator('#search-button').click()
  await expect(page.locator('#local-search .search-dialog')).toBeVisible()
  await page.locator('.local-search-input input').fill('Hexo')
  await expect(page.locator('.local-search-hit-item').first()).toBeVisible()
})

test('首页频道筛选同步地址和文章状态', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')

  await page.locator('[data-channel-filter="journal"]').click()
  await expect(page).toHaveURL(/\?channel=journal$/)
  await expect(page.locator('[data-channel-filter="journal"]')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-channel="journal"]:visible')).toHaveCount(1)
  await expect(page.locator('[data-channel="tech"]:visible')).toHaveCount(0)
})

test('三个内容频道可以访问', async ({ page }) => {
  for (const [pathname, title] of channels) {
    const response = await page.goto(pathname)
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('.channel-page-header h1')).toHaveText(title)
    await expectNoHorizontalOverflow(page)
  }
})

test('平板布局没有横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/')

  await expect(page.locator('#page-header h1')).toBeVisible()
  await expect(page.locator('#recent-posts')).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('移动导航和减少动态模式可用', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expectNoHorizontalOverflow(page)
  await page.locator('#toggle-menu').click()
  await expect(page.locator('#sidebar-menus')).toHaveClass(/open/)
  await expect(page.locator('#sidebar-menus')).toBeVisible()

  const transitionDuration = await page.locator('#nav-darkmode i').evaluate(element => getComputedStyle(element).transitionDuration)
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.001)
})

test('小屏和横屏布局没有溢出', async ({ page }) => {
  for (const viewport of [
    { width: 375, height: 812 },
    { width: 844, height: 390 }
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expectNoHorizontalOverflow(page)
    await expect(page.locator('#page-header h1')).toBeVisible()
  }
})

test('文章代码复制、阅读进度和 Twikoo 初始化可用', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    window.twikoo = {
      getCommentsCount: async () => [{ count: 0 }],
      init: ({ el, envId, path }) => {
        el.dataset.testReady = 'true'
        el.dataset.testEnv = envId
        el.dataset.testPath = path
        el.textContent = '评论组件已初始化'
      }
    }
  })
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/posts/4a17b156.html')

  const code = await page.locator('#article-container .highlight .code pre').first().innerText()
  await page.locator('#article-container .copy-button').first().click()
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(code)

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
  await expect.poll(async () => Number(await page.locator('.scroll-percent').textContent())).toBeGreaterThan(0)

  const comments = page.locator('#twikoo-wrap')
  await comments.scrollIntoViewIfNeeded()
  await expect(comments).toHaveAttribute('data-test-ready', 'true')
  await expect(comments).toHaveAttribute('data-test-env', 'https://twikoo.angyuer.com/')
  await expect(comments).toHaveAttribute('data-test-path', '/posts/4a17b156.html')
})

test('旧文章地址重定向到稳定链接', async ({ page }) => {
  await page.goto('/posts/0.html')
  await page.waitForURL('**/posts/f134a8e5.html')
  await expect(page.locator('.post-title')).toHaveText('Markdown 基本语法')
})
