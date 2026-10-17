import { writeFile } from 'node:fs/promises'
import { loadPages } from './seo-pages.mjs'

const pages = await loadPages()
const home = pages.find(page => page.file.replaceAll('\\', '/') === 'dist/index.html')
if (!home?.canonical) throw new Error('首页缺少规范地址，无法生成站点地图。')
const origin = new URL(home.canonical).origin
const entries = new Map()
const escapeXml = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

for (const page of pages) {
  // 排除错误页、禁止索引页及指向其他页面的别名输出。
  if (!page.canonical || /(?:^|[\\/])404\.html$/.test(page.file)) continue
  if (page.meta.get('robots')?.some(value => /\bnoindex\b/i.test(value))) continue
  const url = new URL(page.canonical)
  if (url.origin !== origin) continue
  const modified = page.article?.dateModified
  if (modified && Number.isNaN(Date.parse(modified))) throw new Error(`文章更新日期无效：${page.file}`)
  // 使用真实文章更新日期；聚合页不伪造最后修改时间或抓取频率。
  entries.set(url.href, modified || entries.get(url.href))
}

const xml = [...entries].sort(([left], [right]) => left.localeCompare(right)).map(([url, modified]) =>
  `  <url><loc>${escapeXml(url)}</loc>${modified ? `<lastmod>${escapeXml(modified)}</lastmod>` : ''}</url>`)
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml.join('\n')}\n</urlset>\n`)
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
console.log(`已生成 ${entries.size} 个规范地址的站点地图及 robots.txt。`)
