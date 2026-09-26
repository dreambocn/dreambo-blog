<script lang="ts" setup>
import type { Categories, CategoryList, Post } from 'valaxy'
import { isCategoryList, useValaxyI18n } from 'valaxy'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  categories: Categories
}>()

const { t } = useI18n()
const { $tCategory } = useValaxyI18n()
const route = useRoute()
const router = useRouter()

// 当前展开的分类（同一时间只展开一个）
const expanded = ref<string | null>(null)

const topCategories = computed<CategoryList[]>(() =>
  Array.from(props.categories.values()).filter(isCategoryList),
)

// 递归收集某分类下（含子分类）的全部文章，按日期倒序
function collectPosts(node: CategoryList): Post[] {
  const result: Post[] = []
  for (const child of node.children.values()) {
    if (isCategoryList(child))
      result.push(...collectPosts(child))
    else if (!(child.hide && child.hide !== 'index'))
      result.push(child)
  }
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const postsByCategory = computed(() => {
  const map = new Map<string, Post[]>()
  for (const category of topCategories.value)
    map.set(category.name, collectPosts(category))
  return map
})

function postsOf(name: string) {
  return postsByCategory.value.get(name) ?? []
}

function displayName(name: string) {
  return name === 'Uncategorized' ? t('category.uncategorized') : $tCategory(name)
}

function formatDate(date: string | Date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 深链 ?category=X 只取顶级分类名（兼容旧的 A/B 形式）
function queryCategory(): string | null {
  const c = route.query.category
  const value = Array.isArray(c) ? c[0] : c
  if (!value)
    return null
  const top = value.split('/')[0]
  return topCategories.value.some(cat => cat.name === top) ? top : null
}

function toggle(name: string) {
  if (expanded.value === name) {
    expanded.value = null
    const { category: _drop, ...rest } = route.query
    router.replace({ query: rest })
  }
  else {
    expanded.value = name
    router.replace({ query: { ...route.query, category: name } })
  }
}

onMounted(() => {
  // 水合安全：首屏与 SSG 一致（收起），挂载后再按深链展开
  const q = queryCategory()
  if (!q)
    return
  expanded.value = q
  nextTick(() => {
    document
      .querySelector(`[data-category="${CSS.escape(q)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
})

// 浏览器前进/后退时同步展开态
watch(() => route.query.category, () => {
  expanded.value = queryCategory()
})
</script>

<template>
  <div class="categories-accordion">
    <div
      v-for="category in topCategories"
      :key="category.name"
      class="category-item"
    >
      <button
        class="category-header"
        :class="{ expanded: expanded === category.name }"
        :data-category="category.name"
        type="button"
        @click="toggle(category.name)"
      >
        <span class="category-icon">
          <div v-if="expanded === category.name" i-ri-folder-open-line />
          <div v-else i-ri-folder-line />
        </span>
        <span class="category-name">{{ displayName(category.name) }}</span>
        <span class="category-count">{{ category.total }}</span>
        <span class="category-arrow">
          <div i-ri-arrow-down-s-line />
        </span>
      </button>

      <Transition
        enter-active-class="animate-fade-in animate-duration-300"
        leave-active-class="animate-fade-out animate-duration-150"
      >
        <div v-if="expanded === category.name" class="posts-list">
          <RouterLink
            v-for="post in postsOf(category.name)"
            :key="post.path"
            :to="post.path || ''"
            class="post-item"
          >
            <span class="post-date">{{ formatDate(post.date) }}</span>
            <span class="post-title">{{ post.title }}</span>
          </RouterLink>
          <div v-if="!postsOf(category.name).length" class="post-empty">
            暂无文章
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.categories-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
}

.category-item {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dark .category-item {
  border-color: rgba(255, 255, 255, 0.1);
}

.category-item:hover {
  border-color: var(--va-c-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.category-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.dark .category-header:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.category-header.expanded {
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dark .category-header.expanded {
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.category-icon {
  display: inline-flex;
  color: var(--va-c-primary);
  font-size: 1.25rem;
}

.category-name {
  flex: 1;
  font-size: 1.05rem;
  font-weight: 500;
}

.category-count {
  padding: 0.15rem 0.55rem;
  border-radius: 1rem;
  background-color: rgba(0, 0, 0, 0.08);
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
}

.dark .category-count {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.category-arrow {
  display: inline-flex;
  font-size: 1.2rem;
  opacity: 0.5;
  transition: transform 0.25s, opacity 0.2s;
}

.category-header.expanded .category-arrow {
  transform: rotate(180deg);
  opacity: 0.9;
}

.posts-list {
  display: flex;
  flex-direction: column;
  padding: 0.35rem 0;
}

.post-item {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 1.1rem;
  border-left: 3px solid transparent;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, padding-left 0.2s;
}

.post-item:hover {
  padding-left: 1.35rem;
  border-left-color: var(--va-c-primary);
  background-color: rgba(0, 0, 0, 0.02);
}

.dark .post-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.post-date {
  flex-shrink: 0;
  min-width: 5.5rem;
  color: rgba(0, 0, 0, 0.5);
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.dark .post-date {
  color: rgba(255, 255, 255, 0.5);
}

.post-title {
  flex: 1;
  color: var(--va-c-text);
}

.post-item:hover .post-title {
  color: var(--va-c-primary);
}

.post-empty {
  padding: 0.8rem 1.1rem;
  color: rgba(0, 0, 0, 0.45);
  font-size: 0.9rem;
}

.dark .post-empty {
  color: rgba(255, 255, 255, 0.45);
}
</style>