import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import sharp from 'sharp'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const baselineDir = path.join(testDir, 'visual-baselines')
const updateBaselines = process.env.UPDATE_VISUAL_BASELINES === '1'

const cases = [
  { name: 'home-desktop-light', path: '/', width: 1440, height: 1000, theme: 'light' },
  { name: 'home-desktop-dark', path: '/', width: 1440, height: 1000, theme: 'dark' },
  { name: 'home-tablet-light', path: '/', width: 768, height: 1024, theme: 'light' },
  { name: 'home-mobile-light', path: '/', width: 390, height: 844, theme: 'light' },
  { name: 'about-desktop-light', path: '/about/', width: 1440, height: 1000, theme: 'light' },
  { name: 'about-mobile-dark', path: '/about/', width: 390, height: 844, theme: 'dark' },
  { name: 'projects-desktop-light', path: '/projects/', width: 1440, height: 1000, theme: 'light' },
  { name: 'projects-mobile-dark', path: '/projects/', width: 390, height: 844, theme: 'dark' },
  { name: 'post-desktop-dark', path: '/posts/4a17b156.html', width: 1440, height: 1000, theme: 'dark' },
  { name: 'home-mobile-fallback', path: '/', width: 390, height: 844, theme: 'light', fallback: true }
]

const normalize = buffer => sharp(buffer)
  .resize(96, 72, { fit: 'fill' })
  .blur(1.2)
  .removeAlpha()
  .raw()
  .toBuffer()

const compareVisual = async (actual, baselinePath) => {
  const baseline = await fs.readFile(baselinePath)
  const [actualPixels, baselinePixels] = await Promise.all([
    normalize(actual),
    normalize(baseline)
  ])

  let absoluteDifference = 0
  let changedPixels = 0
  const pixelCount = actualPixels.length / 3

  for (let index = 0; index < actualPixels.length; index += 3) {
    const difference = (
      Math.abs(actualPixels[index] - baselinePixels[index]) +
      Math.abs(actualPixels[index + 1] - baselinePixels[index + 1]) +
      Math.abs(actualPixels[index + 2] - baselinePixels[index + 2])
    ) / 3
    absoluteDifference += difference
    if (difference > 28) changedPixels += 1
  }

  return {
    meanDifference: absoluteDifference / pixelCount,
    changedRatio: changedPixels / pixelCount
  }
}

const settlePage = async page => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        caret-color: transparent !important;
        transition-duration: 0s !important;
      }
    `
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = [...document.images].filter(image => {
      const source = image.currentSrc || image.src
      const sameOrigin = !source || new URL(source, location.href).origin === location.origin
      return sameOrigin && (!image.loading || image.getBoundingClientRect().top < innerHeight * 1.5)
    })
    const imageReady = Promise.all(images.map(image => image.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', resolve, { once: true })
        })))
    await Promise.race([
      imageReady,
      new Promise(resolve => setTimeout(resolve, 3000))
    ])
  })
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

for (const visualCase of cases) {
  test(`${visualCase.name} 视觉基线`, async ({ page }) => {
    await page.setViewportSize({ width: visualCase.width, height: visualCase.height })
    await page.emulateMedia({ colorScheme: visualCase.theme, reducedMotion: 'reduce' })

    if (visualCase.fallback) {
      await page.addInitScript(() => {
        const nativeSupports = CSS.supports.bind(CSS)
        CSS.supports = (property, value) => {
          if (String(property).includes('backdrop-filter')) return false
          return nativeSupports(property, value)
        }
      })
    }

    await page.goto(visualCase.path)
    const html = page.locator('html')
    if (await html.getAttribute('data-theme') !== visualCase.theme) {
      await page.locator('#nav-darkmode').click()
      await expect(html).toHaveAttribute('data-theme', visualCase.theme)
    }
    if (visualCase.fallback) {
      await expect(html).toHaveClass(/no-backdrop-filter/)
      await expect(page.locator('#page-header #nav')).toHaveCSS('backdrop-filter', 'none')
    }

    await settlePage(page)
    const screenshot = await page.screenshot({ animations: 'disabled' })
    const baselinePath = path.join(baselineDir, `${visualCase.name}.webp`)

    if (updateBaselines) {
      await fs.mkdir(baselineDir, { recursive: true })
      await sharp(screenshot).webp({ quality: 92 }).toFile(baselinePath)
      return
    }

    const baselineExists = await fs.access(baselinePath).then(() => true, () => false)
    expect(baselineExists, `缺少视觉基线，请运行 npm run test:visual:update`).toBeTruthy()
    const result = await compareVisual(screenshot, baselinePath)
    expect(result.meanDifference, `${visualCase.name} 平均视觉差异过大`).toBeLessThan(10)
    expect(result.changedRatio, `${visualCase.name} 大面积视觉差异过多`).toBeLessThan(0.12)
  })
}
