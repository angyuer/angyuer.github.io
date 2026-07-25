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
