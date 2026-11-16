(async () => {
const { chromium } = require('playwright')
const { readdirSync } = require('node:fs')
const path = require('node:path')
const dir = path.resolve(process.argv[2]), out = path.resolve(process.argv[3])
const b = await chromium.launch()
for (const f of readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const tall = f.includes('reels')
  const p = await b.newPage({ viewport: { width: 1080, height: tall ? 1920 : 1350 }, deviceScaleFactor: 1 })
  await p.goto('file://' + path.join(dir, f)); await p.waitForTimeout(300)
  await p.screenshot({ path: path.join(out, f.replace('.html', '.png')) }); await p.close()
}
await b.close()
})()
