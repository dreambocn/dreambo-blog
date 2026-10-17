import { readFile, readdir } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { decodeHtml } from './seo-pages.mjs'

// 保留字符位置，跳过代码块和行内代码，避免改写文章中的演示代码。
export function maskCode(source) {
  let fence
  return source.split(/(?<=\n)/).map(line => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (marker) {
      const wasInside = Boolean(fence)
      if (!fence) fence = marker[1]
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined
      if (wasInside || fence) return line.replace(/[^\r\n]/g, ' ')
    }
    if (fence) return line.replace(/[^\r\n]/g, ' ')
    return line.replace(/(`+)[^\r\n]*?\1/g, match => ' '.repeat(match.length))
  }).join('')
}

export function findImageReferences(source, file, root = process.cwd()) {
  // 本工具仅迁移笔记引用，不扫描站点配置或其他项目资源。
  if (!file.endsWith('.md')) return []
  const masked = file.endsWith('.md') ? maskCode(source) : source
  const references = []
  const seen = new Set()
  function add(raw, start) {
    if (!raw || seen.has(start)) return
    const url = decodeHtml(raw).replace(/\\([ ()])/g, '$1')
    if (/^(?:data:|blob:|#)/i.test(url)) return
    let key
    if (/^https?:\/\//i.test(url)) key = new URL(url).href
    else {
      const path = decodeURIComponent(url.split(/[?#]/)[0])
      key = `file:${path.startsWith('/') ? resolve(root, 'public', `.${path}`) : resolve(dirname(file), path)}`
    }
    references.push({ file, raw, url, key, start, end: start + raw.length })
    seen.add(start)
  }
  if (file.endsWith('.md')) {
    for (const match of masked.matchAll(/!\[(?:\\.|[^\]\\\n])*\]\(\s*(?:<([^>\n]+)>|((?:\\.|[^\s)])+))/g)) {
      const raw = match[1] || match[2]
      add(raw, match.index + match[0].lastIndexOf(raw))
    }
    for (const tag of masked.matchAll(/<img\b[^>]*>/gi)) {
      const match = tag[0].match(/\bsrc\s*=\s*(["'])(.*?)\1/i)
      if (match) add(match[2], tag.index + match.index + match[0].indexOf(match[1]) + 1)
    }
    for (const match of masked.matchAll(/!\[\[([^\]|\n]+)(?:\|[^\]\n]*)?\]\]/g)) {
      add(match[1], match.index + 3)
    }
    for (const match of masked.matchAll(/^(?:cover|ogImage|image):\s*["']?([^\s"'\r\n]+)["']?\s*$/gm)) {
      add(match[1], match.index + match[0].indexOf(match[1]))
    }
  }
  return references
}

async function* markdownFiles(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, item.name)
    if (item.isDirectory()) yield* markdownFiles(file)
    else if (extname(file) === '.md') yield file
  }
}

export async function discoverImages(root = process.cwd()) {
  const files = []
  for await (const file of markdownFiles(join(root, 'pages', 'posts'))) files.push(file)
  const sources = new Map()
  const images = new Map()
  for (const file of files) {
    const source = await readFile(file, 'utf8')
    sources.set(file, source)
    for (const reference of findImageReferences(source, file, root)) {
      if (!images.has(reference.key)) images.set(reference.key, [])
      images.get(reference.key).push(reference)
    }
  }
  return { sources, images }
}
