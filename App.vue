<script setup lang="ts">
import { defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { useHead, useSeoMeta } from '@unhead/vue'
import { useFrontmatter, useSiteConfig } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const site = useSiteConfig()
const frontmatter = useFrontmatter()
const route = useRoute()
const isArticle = computed(() => route.path.startsWith('/posts/') && Boolean(frontmatter.value.date))
const canonical = computed(() => new URL(
  frontmatter.value.canonical || frontmatter.value.url || route.path,
  site.value.url,
))
const description = computed(() => frontmatter.value.description || site.value.description)

// 与主题使用相同地址，由 Unhead 合并为一条非阻塞字体样式。
const serifFontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap'
const serifFontReady = ref(false)
useHead(() => ({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'stylesheet', href: serifFontUrl, media: serifFontReady.value ? 'all' : 'print', 'data-blog-font': '' },
  ],
}))

onMounted(() => {
  const font = document.querySelector<HTMLLinkElement>('link[data-blog-font]')
  if (!font)
    return
  // 已缓存的样式可能在水合前加载完成；外部字体失败时继续使用系统字体。
  if (font.sheet)
    serifFontReady.value = true
  else
    font.addEventListener('load', () => { serifFontReady.value = true }, { once: true })
})

// 无效或缺失日期不输出，避免普通页面或新文章导致构建失败。
function articleDate(value: unknown) {
  if (!isArticle.value || !value)
    return undefined
  // 本站采用上海时区；只有日期的字段按本地零点处理，与主题保持一致。
  const text = String(value)
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00+08:00` : text)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

// 显式摘要优先于列表摘录，避免 HTML 或截断段落进入分享卡片。
useSeoMeta({
  description,
  ogDescription: description,
  twitterDescription: description,
  ogType: () => isArticle.value ? 'article' : 'website',
  ogUrl: () => canonical.value.href,
  articlePublishedTime: () => articleDate(frontmatter.value.date),
  articleModifiedTime: () => articleDate(frontmatter.value.updated || frontmatter.value.date),
  articleAuthor: () => isArticle.value ? site.value.author.link : undefined,
  robots: () => route.path === '/404' || frontmatter.value.draft || frontmatter.value.hide === true ? 'noindex, follow' : 'index, follow, max-image-preview:large',
})

// 框架默认只传站点域名；补齐页面路径，供所有结构化数据节点关联当前页面。
useHead(() => ({
  templateParams: {
    schemaOrg: {
      host: `${canonical.value.origin}/`,
      path: canonical.value.pathname,
    },
  },
}))

// 复用框架节点，保持站点名称稳定并修正页面地址，避免生成重复图谱。
useSchemaOrg([
  defineWebSite({ name: () => site.value.title, url: () => site.value.url }),
  defineWebPage({ url: () => canonical.value.href, description }),
])
</script>

<template>
  <!-- 全站元信息扩展，无需额外的可见页面元素。 -->
</template>
