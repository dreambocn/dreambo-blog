import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { decodeHtml, loadPages } from './seo-pages.mjs'

const pages = await loadPages()
const normalizePath = value => decodeURI(new URL(value, 'https://dreambo.cn/').pathname).replace(/\/$/, '') || '/'
const articlePaths = new Set(pages.filter(page => page.article).map(page => normalizePath(page.canonical)))
const knownPaths = new Set(pages.filter(page => page.canonical).map(page => normalizePath(page.canonical)))
const categories = pages.find(page => normalizePath(page.canonical || '/') === '/categories')
assert.ok(categories, '缺少分类页面。')
const categoryLinks = new Set([...categories.html.matchAll(/<a\b(?=[^>]*\bclass="[^"]*\bpost-item\b)[^>]*\bhref="([^"]+)"/g)]
  .map(match => normalizePath(decodeHtml(match[1]))))
for (const path of articlePaths) assert.ok(categoryLinks.has(path), `分类页静态 HTML 遗漏文章：${path}`)
assert.ok(categories.html.includes('<details') && categories.html.includes('<summary'), '分类页需要保留可在无脚本环境使用的原生折叠面板。')
const panelIds = [...categories.html.matchAll(/\baria-controls="([^"]+)"/g)].map(match => match[1])
assert.ok(panelIds.length > 0, '分类折叠面板缺少关联标识。')
for (const id of panelIds) assert.ok(categories.html.includes(`id="${id}"`), `折叠按钮没有对应面板：${id}`)

let checkedLinks = 0
const distRoot = resolve('dist')
for (const page of pages) {
  assert.ok(!page.html.includes('href="/girls/"'), `仍然存在失效导航：${page.file}`)
  for (const match of page.html.matchAll(/<a\b[^>]*\bhref="(\/[^"\s]*)"/g)) {
    const href = decodeHtml(match[1])
    if (href.startsWith('//')) continue
    const path = normalizePath(href)
    checkedLinks++
    if (knownPaths.has(path)) continue
    // 允许下载文件和静态资源；归一化后始终限制在构建目录内。
    const file = resolve(distRoot, `.${decodeURIComponent(new URL(href, 'https://dreambo.cn/').pathname)}`)
    assert.ok(file.startsWith(`${distRoot}${sep}`), `站内链接越出构建目录：${href}`)
    await access(file).catch(() => assert.fail(`站内链接无对应页面或文件：${href}，来源：${page.file}`))
  }
  const fonts = [...page.head.matchAll(/<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*fonts\.googleapis\.com)[^>]*>/g)]
  assert.equal(fonts.length, 1, `主题字体应只输出一次：${page.file}`)
  assert.ok(fonts[0][0].includes('media="print"'), `字体样式阻塞首屏：${page.file}`)
}

await access('dist/404.html')
const notFound = pages.find(page => page.file.replaceAll('\\', '/') === 'dist/404.html')
assert.ok(notFound?.meta.get('robots')?.some(value => value.includes('noindex')), '404 页面应明确禁止索引。')
const headers = await readFile('dist/_headers', 'utf8')
assert.ok(/\/assets\/\*\s*\r?\n\s*Cache-Control:\s*public, max-age=31536000, immutable/i.test(headers), 'Cloudflare 静态资源缓存规则错误。')
console.log(`站点核验通过：分类页覆盖 ${articlePaths.size} 篇文章，检查 ${checkedLinks} 个站内链接，字体非阻塞加载，404 与缓存文件齐全。`)
