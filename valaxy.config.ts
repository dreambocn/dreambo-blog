import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonGiscus } from 'valaxy-addon-giscus'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

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
      {
        name: '喜欢的女孩子',
        url: '/girls/',
        icon: 'i-ri-women-line',
        color: 'hotpink',
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
