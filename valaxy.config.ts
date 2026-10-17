import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonGiscus } from 'valaxy-addon-giscus'

// 按需保留页面使用的图标。
const safelist = [
  'i-ri-home-line',
]

/**
 * 博客主题与构建配置。
 */
export default defineValaxyConfig<UserThemeConfig>({
  // 站点信息统一维护在 site.config.ts。

  extendMd({ route, data }) {
    // 未单独设置列表摘录时，复用纯文本摘要，避免首页展示整篇正文。
    if (data.description && !route.meta.excerpt)
      route.addToMeta({ excerpt: data.description })
  },

  theme: 'yun',

  addons: [
    addonGiscus({
      repo: 'dreambocn/dreambo-blog',
      repoId: 'R_kgDOOKJDKg',
      category: 'Announcements',
      categoryId: 'DIC_kwDOOKJDKs4DGcgI',
      mapping: 'pathname',
      inputPosition: 'bottom',
    }),
  ],

  themeConfig: {
    banner: {
      enable: true,
      title: '梦博的小站',
    },
    bg_image: {
      enable: true,
      url: '/wallhaven-exrqrr.jpg',
      dark: '/wallhaven-exrqrr.jpg',
      opacity: 0.8,
    },
    colors: {
      primary: "#00bfff",
    },
    fireworks: {
      enable: true,
      colors: ['#00008b', '#4682b4', '#add8e6','#00bfff']
    },
    pages: [
      {
        name: '我的小伙伴们',
        url: '/links/',
        icon: 'i-ri-genderless-line',
        color: 'dodgerblue',
      },
    ],

    footer: {
      since: 2024,
      beian: {
        enable: true,
        icp: '津ICP备2024020482号-1',
      },
    },
  },

  unocss: { safelist },
})
