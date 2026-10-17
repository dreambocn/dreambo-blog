import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolve } from 'node:path'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { discoverImages, findImageReferences } from '../scripts/image-references.mjs'

const file = resolve('pages', 'posts', '示例.md')

test('只识别真实图片，跳过代码示例与普通链接', () => {
  const source = [
    '![配图](https://example.com/a.png)',
    '[下载](https://example.com/download.png)',
    '`![代码示例](https://example.com/inline.png)`',
    '```markdown',
    '![围栏示例](https://example.com/code.png)',
    '```',
    '<img alt="图片" src="https://example.com/b.png?x=1&amp;y=2">',
  ].join('\r\n')
  const references = findImageReferences(source, file)
  assert.deepEqual(references.map(reference => reference.key), ['https://example.com/a.png', 'https://example.com/b.png?x=1&y=2'])
  for (const reference of references) assert.equal(source.slice(reference.start, reference.end), reference.raw)
})

test('保留带空格的图片路径、封面与笔记图片的准确替换范围', () => {
  const source = 'cover: /cover.jpg\n![图片](<assets/my image.png>)\n![[附件.jpg|200]]\n'
  const references = findImageReferences(source, file)
  assert.equal(references.length, 3)
  for (const reference of references) assert.equal(source.slice(reference.start, reference.end), reference.raw)
  assert.ok(references.some(reference => reference.key === `file:${resolve('public', 'cover.jpg')}`))
  assert.ok(references.some(reference => reference.key.endsWith('my image.png')))
})

test('站点配置和配图不参与笔记迁移', () => {
  const source = "// avatar: '/example.jpg'\navatar: '/user-avatar.jpg',\nfavicon: '/user-avatar.jpg',\n"
  const references = findImageReferences(source, resolve('site.config.ts'))
  assert.deepEqual(references, [])
})

test('采集范围只包含 posts 笔记目录', async () => {
  const prefix = resolve(tmpdir(), 'dreambo-note-images-')
  const root = await mkdtemp(prefix)
  try {
    await mkdir(resolve(root, 'pages', 'posts'), { recursive: true })
    await writeFile(resolve(root, 'pages', 'posts', '笔记.md'), '![正文](https://example.com/note.png)')
    await writeFile(resolve(root, 'pages', 'about.md'), '![站点配图](https://example.com/site.png)')
    await writeFile(resolve(root, 'site.config.ts'), "avatar: '/avatar.jpg'")
    const result = await discoverImages(root)
    assert.deepEqual([...result.images.keys()], ['https://example.com/note.png'])
  }
  finally {
    // 仅清理由本测试创建且已核实位于临时目录中的独立目录。
    assert.ok(root.startsWith(prefix))
    await rm(root, { recursive: true })
  }
})
