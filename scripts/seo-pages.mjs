import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

// 仅解析生成器输出的静态标签，不执行页面脚本。
export function decodeHtml(text = '') {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, key) => {
    if (key.startsWith('#x')) return String.fromCodePoint(Number.parseInt(key.slice(2), 16))
    if (key.startsWith('#')) return String.fromCodePoint(Number(key.slice(1)))
    return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[key] || entity
  })
}

export async function* walk(directory, extension) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) yield* walk(path, extension)
    else if (entry.name.endsWith(extension)) yield path
  }
}

export async function loadPages() {
  const pages = []
  for await (const file of walk('dist', '.html')) {
    const html = await readFile(file, 'utf8')
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || ''
    const meta = new Map()
    let canonical
    for (const match of head.matchAll(/<(meta|link)\b[^>]*>/gi)) {
      const attributes = Object.fromEntries([...match[0].matchAll(/([\w:-]+)="([^"]*)"/g)]
        .map((attribute) => [attribute[1], decodeHtml(attribute[2])]))
      if (match[1] === 'meta') {
        const key = attributes.name || attributes.property
        if (!meta.has(key)) meta.set(key, [])
        meta.get(key).push(attributes.content)
      }
      else if (attributes.rel === 'canonical') canonical = attributes.href
    }
    const graph = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .flatMap(match => JSON.parse(match[1])['@graph'] || [])
    const article = graph.find(node => [node['@type']].flat().includes('BlogPosting'))
    pages.push({ file, html, head, meta, canonical, graph, article })
  }
  return pages
}
