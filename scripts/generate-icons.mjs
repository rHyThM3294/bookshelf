// 從品牌標記（favicon 的深色底＋橘色菱形）產生 PWA manifest 需要的點陣圖示。
// 手動執行：node scripts/generate-icons.mjs（品牌顏色改了才需要重跑，不接 CI）
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const ICONS_DIR = 'public/icons'
mkdirSync(ICONS_DIR, { recursive: true })

// 一般圖示：跟 favicon 一樣，圖案幾乎佔滿整個畫布
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#1a1612"/>
  <rect x="160" y="160" width="192" height="192" rx="32" fill="#c4622d" transform="rotate(45 256 256)"/>
</svg>
`

// maskable 圖示：各平台會用不同形狀（圓形／圓角方形…）裁切，
// 圖案必須留在安全區內（置中、明顯縮小），背景才需要滿版無圓角
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1612"/>
  <rect x="166" y="166" width="180" height="180" rx="24" fill="#c4622d" transform="rotate(45 256 256)"/>
</svg>
`

const targets = [
  { path: `${ICONS_DIR}/icon-192.png`, svg: standardSvg, size: 192 },
  { path: `${ICONS_DIR}/icon-512.png`, svg: standardSvg, size: 512 },
  { path: `${ICONS_DIR}/icon-maskable-512.png`, svg: maskableSvg, size: 512 },
  { path: 'public/apple-touch-icon.png', svg: standardSvg, size: 180 },
]

for (const { path, svg, size } of targets) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path)
  console.log(`✓ ${path}`)
}
