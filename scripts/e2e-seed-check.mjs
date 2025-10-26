import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const url = process.env.URL || 'http://localhost:5174/?seed=true'
  console.log('Opening', url)
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle' })
    if (!resp || !resp.ok()) console.warn('Warning: HTTP response not OK', resp && resp.status())

    // Wait for the charts (canvas) or dashboard content to render
    await page.waitForSelector('canvas', { timeout: 8000 }).catch(() => {})

    // Inspect localStorage
    const keys = await page.evaluate(() => Object.keys(window.localStorage))
    console.log('localStorage keys:', keys)
    const hasProducts = keys.includes('oja_products_v1')
    const hasPurchases = keys.includes('oja_purchases_v1')
    const hasSales = keys.includes('oja_sales_v1')

    if (hasProducts && hasPurchases && hasSales) {
      console.log('E2E PASS: seed keys present')
      await browser.close()
      process.exit(0)
    }

    console.error('E2E FAIL: missing keys', { hasProducts, hasPurchases, hasSales })
    await browser.screenshot({ path: 'tmp/e2e-fail.png' }).catch(()=>{})
    await browser.close()
    process.exit(2)
  } catch (e) {
    console.error('E2E ERROR', e)
    await browser.close()
    process.exit(3)
  }
}

run()
