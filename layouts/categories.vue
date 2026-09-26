<script lang="ts" setup>
import { useCategories, useFrontmatter, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const categories = useCategories()
const { $tO } = useValaxyI18n()

const pageIcon = computed(() => {
  if (!frontmatter.value.icon)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    frontmatter.value.icon = 'i-ri-folder-2-line'
  return frontmatter.value.icon
})
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            :title="$tO(frontmatter.title) || t('menu.categories')"
            :icon="pageIcon"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <Transition
            enter-active-class="animate-fade-in animate-duration-400"
            appear
          >
            <div text="center" class="yun-text-light" p="2">
              {{ t('counter.categories', Array.from(categories.children).length) }}
            </div>
          </Transition>
          <CategoriesAccordion :categories="categories.children" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>
</template>