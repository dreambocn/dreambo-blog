import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

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

  themeConfig: {
    banner: {
      enable: true,
      title: '梦博的小站',
    },
    bg_image: {
      enable: true,
      url: 'https://s2.loli.net/2025/03/18/YQUfI64wXgsaL1W.jpg',
      dark: 'https://s2.loli.net/2025/03/18/YQUfI64wXgsaL1W.jpg',
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
