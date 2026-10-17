import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { decodeHtml, loadPages, walk } from './seo-pages.mjs'

const pages = await loadPages()
const articles = pages.filter(page => page.article && !page.meta.get('robots')?.some(value => /\bnoindex\b/i.test(value)))
const sourceDescriptions = []
for await (const file of walk('pages/posts', '.md')) {
  const source = await readFile(file, 'utf8')
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  assert.ok(frontmatter, `文章缺少头部配置：${file}`)
  if (/^(?:draft|hide):\s*true\s*$/m.test(frontmatter)) continue
  const value = frontmatter.match(/^description:\s*(.+)$/m)?.[1]
  assert.ok(value, `文章缺少独立摘要：${file}`)
  sourceDescriptions.push(value.startsWith('"') ? JSON.parse(value) : value.replace(/^'|'$/g, ''))
}
assert.equal(new Set(sourceDescriptions).size, sourceDescriptions.length, '文章摘要存在重复。')
const canonicalArticles = new Map()
const descriptions = new Set()
const sitemap = await readFile('dist/sitemap.xml', 'utf8')
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decodeHtml(match[1]))
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, '站点地图包含重复地址。')

for (const page of articles) {
  const expect = (condition, message) => assert.ok(condition, `${message}：${page.file}`)
  const oneMeta = (name) => {
    const values = page.meta.get(name) || []
    assert.equal(values.length, 1, `标签 ${name} 缺失或重复：${page.file}`)
    return values[0]
  }
  expect(page.canonical && new URL(page.canonical).pathname !== '/', '文章规范地址错误')
  const description = oneMeta('description')
  expect(sourceDescriptions.includes(description), '输出摘要与文章配置不一致')
  expect(description === oneMeta('og:description') && description === oneMeta('twitter:description'), '分享摘要不一致')
  expect(description === page.article.description, '文章结构化摘要不一致')
  expect(oneMeta('og:type') === 'article', '分享类型不是文章')
  expect(oneMeta('og:url') === page.canonical, '分享地址与规范地址不一致')
  expect(oneMeta('og:title') === page.article.headline && oneMeta('twitter:title') === page.article.headline, '文章标题不一致')
  expect((page.html.match(/<h1\b/gi) || []).length === 1, '文章应只有一个主标题')
  expect(oneMeta('article:published_time') === page.article.datePublished, '发布日期不一致')
  expect(oneMeta('article:modified_time') === page.article.dateModified, '更新日期不一致')
  expect(Date.parse(page.article.dateModified) >= Date.parse(page.article.datePublished), '更新日期早于发布日期')
  const webpage = page.graph.find(node => node['@id'] === page.article.mainEntityOfPage?.['@id'])
  expect(webpage?.url === page.canonical, '结构化数据关联到了错误页面')
  const author = page.graph.find(node => node['@id'] === page.article.author?.['@id'])
  expect(author?.url === oneMeta('article:author') && new URL(author.url).origin === new URL(page.canonical).origin, '作者地址不正确')
  expect(page.graph.find(node => node['@type'] === 'WebSite')?.name === "DreamBo's Blog", '站点名称被文章标题覆盖')
  expect(!page.head.includes('https://valaxy.site'), '仍含模板作者地址')
  expect(sitemapUrls.includes(page.canonical), '站点地图遗漏文章')
  const image = oneMeta('og:image')
  expect(/^https?:\/\//.test(image) && image === oneMeta('twitter:image'), '分享图片地址无效或不一致')
  if (canonicalArticles.has(page.canonical)) {
    expect(canonicalArticles.get(page.canonical) === page.article.headline, '不同文章使用了同一个规范地址')
  }
  canonicalArticles.set(page.canonical, page.article.headline)
  descriptions.add(description)
}
assert.equal(canonicalArticles.size, sourceDescriptions.length, '生成文章数量与公开文章数量不一致。')
assert.equal(descriptions.size, sourceDescriptions.length, '生成摘要数量与公开文章数量不一致。')
assert.ok(!sitemapUrls.some(url => /\/404(?:\.html)?$/.test(url)), '站点地图不应包含错误页。')
const robots = await readFile('dist/robots.txt', 'utf8')
assert.ok(robots.includes('Sitemap: https://dreambo.cn/sitemap.xml'), 'robots.txt 未声明本站站点地图。')
console.log(`SEO 核验通过：${canonicalArticles.size} 篇文章，${descriptions.size} 条独立摘要，${sitemapUrls.length} 个站点地图地址。`)
