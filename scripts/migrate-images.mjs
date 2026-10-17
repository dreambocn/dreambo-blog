import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { basename, extname, join, relative, resolve } from 'node:path'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { setTimeout as delay } from 'node:timers/promises'
import { discoverImages } from './image-references.mjs'

const options = new Set(process.argv.slice(2))
const apply = options.has('--apply')
const concurrencyArgument = process.argv.find(value => value.startsWith('--concurrency='))
const concurrency = concurrencyArgument ? Number(concurrencyArgument.split('=')[1]) : 8
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 16) throw new Error('并发数必须在 1 到 16 之间。')
const root = process.cwd()
const work = resolve(process.env.BLOG_IMAGE_WORK || join(homedir(), 'Documents', 'Codex', 'work', 'dreambo-blog', '2026-10-17-r2-images'))
const configPath = process.env.PICGO_CONFIG || join(homedir(), '.picgo', 'config.json')
const config = JSON.parse(await readFile(configPath, 'utf8')).picBed?.['aws-s3']
if (!config?.accessKeyID || !config.secretAccessKey || !config.bucketName || !config.outputURLPattern)
  throw new Error('PicGo 的 S3 上传配置不完整，请先在本机配置。')
const publicHost = new URL(config.outputURLPattern.replace('{protocol}', 'https').replace('{path}', 'image.png')).hostname
const { sources, images } = await discoverImages(root)
const allEntries = [...images].filter(([key]) => !key.startsWith(`https://${publicHost}/`))
const limitArgument = process.argv.find(value => value.startsWith('--limit='))
const limit = limitArgument ? Number(limitArgument.split('=')[1]) : Infinity
if (limit !== Infinity && (!Number.isInteger(limit) || limit < 1)) throw new Error('迁移数量限制必须是正整数。')
const entries = allEntries.slice(0, limit)
const counts = { unique: images.size, references: [...images.values()].reduce((sum, refs) => sum + refs.length, 0), pending: allEntries.length, selected: entries.length, alreadyTarget: images.size - allEntries.length }
console.log(JSON.stringify({ bucket: config.bucketName, publicHost, ...counts }))
if (!apply) {
  const hosts = {}
  for (const [key] of entries) {
    const host = key.startsWith('file:') ? '本地文件' : new URL(key).hostname
    hosts[host] = (hosts[host] || 0) + 1
  }
  console.log(JSON.stringify(hosts))
}
else {
  await mkdir(join(work, 'downloads'), { recursive: true })
  const checkpointFile = join(work, 'checkpoint.json')
  const destination = { bucket: config.bucketName, endpoint: config.endpoint, publicPattern: config.outputURLPattern }
  let state = { root, destination, records: {} }
  try { state = JSON.parse(await readFile(checkpointFile, 'utf8')) }
  catch (error) { if (error.code !== 'ENOENT') throw error }
  if (state.root !== root || JSON.stringify(state.destination) !== JSON.stringify(destination))
    throw new Error('检查点与当前仓库或上传目标不一致，请使用独立工作目录。')
  state.inventory ||= { unique: counts.unique, references: counts.references }
  // 补齐已有检查点的来源引用，后续运行即使已替换也能输出完整清单。
  for (const [source, record] of Object.entries(state.records)) {
    record.references ||= (images.get(source) || images.get(record.target) || []).map(ref => ({ file: relative(root, ref.file).replaceAll('\\', '/'), original: ref.raw }))
  }
  // 隔离早期范围外的站点配图，仅保留笔记来源参与迁移与统计。
  state.excludedUploads ||= {}
  for (const [source, record] of Object.entries(state.records)) {
    if (record.references.length && !record.references.some(ref => ref.file.startsWith('pages/') && ref.file.endsWith('.md'))) {
      state.excludedUploads[source] = { ...record, excludedReason: '站点配图不属于笔记迁移范围，引用已恢复为本地地址。' }
      state.inventory.unique--
      state.inventory.references -= record.references.length
      delete state.records[source]
    }
  }
  const require = createRequire(join(homedir(), '.picgo', 'package.json'))
  const pluginRoot = join(homedir(), '.picgo', 'node_modules', 'picgo-plugin-s3', 'dist')
  const { default: uploader } = require(join(pluginRoot, 'uploader.js'))
  const { FileNameGenerator, OutputURLGenerator } = require(join(pluginRoot, 'utils.js'))
  // 复用已安装上传插件与代理，不改变用户配置，也不复制凭据到工作目录。
  const client = uploader.createS3Client({ ...config, proxy: config.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY })
  let checkpointQueue = Promise.resolve()
  function checkpoint() {
    checkpointQueue = checkpointQueue.then(async () => {
      const temporary = `${checkpointFile}.next`
      await writeFile(temporary, JSON.stringify(state, null, 2))
      // Windows 上日志查看器可能短暂占用目标文件，重试原子替换。
      for (let attempt = 0; ; attempt++) {
        try { await rename(temporary, checkpointFile); break }
        catch (error) {
          if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 5) throw error
          await delay(100 * (attempt + 1))
        }
      }
    })
    return checkpointQueue
  }
  const hash = buffer => createHash('sha256').update(buffer).digest('hex')
  function imageType(buffer) {
    if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png'
    if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return '.jpg'
    if (/^GIF8[79]a/.test(buffer.subarray(0, 6).toString())) return '.gif'
    if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return '.webp'
    if (/<svg[\s>]/i.test(buffer.subarray(0, 1024).toString())) return '.svg'
    if (buffer.subarray(4, 8).toString() === 'ftyp' && /avif|avis/.test(buffer.subarray(8, 32).toString())) return '.avif'
    if (buffer.subarray(0, 2).toString() === 'BM') return '.bmp'
    if (buffer.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]))) return '.ico'
    throw new Error('来源返回的内容不是支持的图片格式。')
  }
  async function download(url, timeout = 25000) {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeout) })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    if (Number(response.headers.get('content-length')) > 32 * 1024 * 1024) throw new Error('图片超过 32 MiB 限制。')
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length > 32 * 1024 * 1024) throw new Error('图片超过 32 MiB 限制。')
    imageType(buffer)
    return buffer
  }
  async function verify(record) {
    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // 大图按低速连接预留读取时间，避免误把已上传对象判为失败。
        const timeout = Math.min(120000, Math.max(30000, Math.ceil(record.bytes / 32768) * 1000 + 10000))
        const buffer = await download(record.target, timeout)
        if (hash(buffer) !== record.sha256) throw new Error('公开图片与原始内容哈希不一致。')
        return
      }
      catch (error) { lastError = error; await delay(400 * (attempt + 1)) }
    }
    throw lastError
  }
  const byHash = new Map(Object.values(state.records).filter(item => item.status === 'verified').map(item => [item.sha256, item]))
  const onlyHost = process.argv.find(value => value.startsWith('--only-host='))?.slice('--only-host='.length)
  const processingEntries = entries.filter(([key]) =>
    (!options.has('--verify-only') || state.records[key]?.target)
    && (!onlyHost || (!key.startsWith('file:') && new URL(key).hostname === onlyHost)),
  )
  let completed = 0
  let next = 0
  async function migrate(key) {
    const prior = state.records[key]
    if (prior?.status === 'verified') return
    let record = prior
    try {
      if (prior?.target && prior?.status === 'uploaded') {
        await verify(prior)
        prior.status = 'verified'
        delete prior.error
        byHash.set(prior.sha256, prior)
        return
      }
      let buffer
      let name
      if (prior?.cacheFile) {
        buffer = await readFile(join(work, 'downloads', prior.cacheFile))
        name = prior.name
      }
      else if (key.startsWith('file:')) {
        buffer = await readFile(key.slice(5))
        name = basename(key.slice(5))
      }
      else {
        try { buffer = await download(key) }
        catch { await delay(500); buffer = await download(key) }
        name = decodeURIComponent(basename(new URL(key).pathname))
      }
      const extension = imageType(buffer)
      if (!extname(name)) name += extension
      const digest = hash(buffer)
      const duplicate = byHash.get(digest)
      if (duplicate) {
        state.records[key] = { ...duplicate, duplicate: true, references: images.get(key).map(ref => ({ file: relative(root, ref.file).replaceAll('\\', '/'), original: ref.raw })) }
        return
      }
      const cached = join(work, 'downloads', `${digest}${extension}`)
      await writeFile(cached, buffer)
      const item = { fileName: name, extname: extname(name), buffer, type: 'aws-s3', uploadDate: prior?.uploadDate ? new Date(prior.uploadDate) : new Date() }
      // 使用和 Typora 完全相同的插件格式化规则，不覆盖已有文件。
      const objectKey = prior?.key || new FileNameGenerator(item).format(config.uploadPath)
      record = { status: 'pending', key: objectKey, sha256: digest, bytes: buffer.length, name, cacheFile: `${digest}${extension}`, uploadDate: item.uploadDate.toISOString(), references: images.get(key).map(ref => ({ file: relative(root, ref.file).replaceAll('\\', '/'), original: ref.raw })) }
      state.records[key] = record
      await checkpoint()
      let result
      // 网络抖动时重试同一个对象键，保持内容与目标地址稳定。
      for (let attempt = 0; attempt < 3; attempt++) {
        result = await uploader.createUploadTask({ client, bucketName: config.bucketName, path: objectKey, item, acl: config.acl || '', index: 0 })
        if (!result.error) break
        await delay(500 * (attempt + 1))
      }
      if (result.error) throw new Error(result.error.message)
      record.target = new OutputURLGenerator(config, { ...item, buffer: undefined, uploadPath: objectKey, url: result.url }).format()
      if (new URL(record.target).hostname !== publicHost) throw new Error('插件输出的域名与配置不一致。')
      record.status = 'uploaded'
      state.records[key] = record
      await checkpoint()
      await verify(record)
      record.status = 'verified'
      byHash.set(digest, record)
    }
    catch (error) {
      // 验证失败但已上传时保留对象地址，重试只做校验，避免重复上传。
      state.records[key] = { ...record, status: record?.target ? 'uploaded' : 'failed', error: String(error.message).slice(0, 300) }
    }
    finally {
      await checkpoint()
    }
  }
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < processingEntries.length) {
      const [key] = processingEntries[next++]
      await migrate(key)
      completed++
      if (completed % 20 === 0 || completed === processingEntries.length) {
        const records = Object.values(state.records)
        console.log(`迁移进度 ${completed}/${processingEntries.length}；已验证 ${records.filter(item => item.status === 'verified').length}；处理中或待恢复 ${records.filter(item => item.status !== 'verified').length}`)
      }
    }
  }))
  client.destroy()

  // 只替换明确识别的图片引用，不对全文进行字符串替换；校验文件未被并发修改。
  const replacements = new Map()
  for (const [key, refs] of images) {
    const record = state.records[key]
    if (record?.status !== 'verified') continue
    for (const reference of refs) {
      if (!replacements.has(reference.file)) replacements.set(reference.file, [])
      replacements.get(reference.file).push({ ...reference, target: record.target })
    }
  }
  for (const file of replacements.keys()) {
    const original = sources.get(file)
    if (await readFile(file, 'utf8') !== original) throw new Error(`文件已被修改，请重新运行后再替换：${relative(root, file)}`)
  }
  for (const [file, refs] of replacements) {
    let source = sources.get(file)
    for (const ref of refs.sort((left, right) => right.start - left.start)) source = source.slice(0, ref.start) + ref.target + source.slice(ref.end)
    await writeFile(file, source)
  }
  const migratedRecords = Object.values(state.records).filter(record => record.status === 'verified')
  const report = {
    date: '2026-10-17', bucket: config.bucketName, publicHost, ...counts,
    summary: {
      sourceImages: state.inventory.unique,
      imageReferences: state.inventory.references,
      migratedSources: migratedRecords.length,
      incompleteSources: Object.values(state.records).filter(record => record.status !== 'verified').length,
    },
    replacedReferences: migratedRecords.reduce((sum, record) => sum + record.references.length, 0),
    uploadedObjects: new Set(migratedRecords.map(record => record.target)).size,
    changedFiles: [...new Set(migratedRecords.flatMap(record => record.references.map(ref => ref.file)))],
    currentRun: { processed: processingEntries.length, replacedReferences: [...replacements.values()].reduce((sum, refs) => sum + refs.length, 0), changedFiles: [...replacements.keys()].map(file => relative(root, file).replaceAll('\\', '/')) },
    inventory: state.inventory,
    records: Object.entries(state.records).map(([source, record]) => ({ source: source.startsWith('file:') ? relative(root, source.slice(5)).replaceAll('\\', '/') : source, ...record })),
    excludedUploads: Object.entries(state.excludedUploads).map(([source, record]) => ({ source: source.startsWith('file:') ? relative(root, source.slice(5)).replaceAll('\\', '/') : source, ...record })),
  }
  await checkpoint()
  await mkdir(join(root, 'outputs'), { recursive: true })
  await writeFile(join(root, 'outputs', 'image-migration-2026-10-17.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ replacedReferences: report.replacedReferences, changedFiles: report.changedFiles.length, verified: report.records.filter(item => item.status === 'verified').length, incomplete: report.records.filter(item => item.status !== 'verified').length }))
}
