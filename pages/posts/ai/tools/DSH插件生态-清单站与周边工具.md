---
title: DSH插件生态-清单站与周边工具
date: 2026-08-20
updated: 2026-08-20
categories:
  - AI
  - 工具与框架
tags:
  - DeepSeek
  - 插件
---
# 官方不做插件市场，于是社区做了六个

DSH（DeepSeek Harness）插件生态盘点，数据截至 2026-08-20。主角是 awesome-dsh-plugin，
但更有意思的是它周围那一圈东西，以及它们对同一个问题给出的完全不同的答案。

## 官方留下的空位

DSH 的设计基调是一切皆插件：模型、工具、沙箱、session 存储、UI，连 agent loop 本身都是插件。
所以插件的权力比一般 IDE 插件大得多，不是加个按钮那种，是能换掉主循环的那种。

官方的姿态是这样的：不做插件 registry，不收外部 PR，GitHub Issues 直接关掉，
反馈走 Discussions 和 Discord。官方推荐的扩展方式是你自己发一个插件，
然后给仓库打上 `dsh-plugin` 这个 topic。

核心和 Cordis 运行时官方管住，剩下全撒出去，连一个收口的地方都不给。
现在 GitHub 上 `dsh-plugin` topic 挂着 8,809 个仓库，没人收拢，没人验证。

这个空位有多大，看 `dsh plugin add` 的解析路径就知道。官方文档里是三条：

```bash
dsh plugin add your-package          # npm registry
dsh plugin add github:you/hello-dsh  # GitHub，要有 prepare 脚本且走 allowlist
dsh plugin add ./hello-0.1.0.tgz     # 本地 tarball
```

npm、GitHub、本地压缩包。没有第四条，没有 `dsh search`，没有中心索引。
你要找插件只能自己去 GitHub 翻那八千多个仓库。

## bundle 和 profile

理解后面的事需要先知道这两个概念，两分钟能讲完。bundle 是你写的东西，profile 是用户启动的东西。

一个 bundle 就是个 npm 包，在 `package.json` 里声明自己贡献了什么：

```json
{
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" } }
}
```

官方文档的原话是 "A bundle is an npm package that ships a configuration layer.
Its manifest declares `dsh.bundle`, answering 'what does this package contribute?':
a patch file that inserts or overrides plugin rows."

一个 bundle 里三个关键文件：`package.json` 声明 `dsh.bundle.patch` 指向补丁文件；
`cordis.patch.yml` 是一个 YAML 数组，每行一个 plugin row；`index.js` 是入口，
导出 `name` 和 `apply()`。

`cordis.patch.yml` 里有个细节，plugin row 引用的是包名而不是相对路径，
这样 Node 的模块解析才能找到装好的代码。

profile 是 `$DSH_HOME/profiles/<name>` 下的目录，描述一套能跑起来的组合。
`dsh plugin --profile web add xxx` 干的事是 pnpm link 这个包，
然后把它追加到 profile 的 `dsh.profile.bundles` 列表里。

生效顺序分层叠加，后面的赢：先是 `dsh.profile.bundles` 里每个 bundle 的 patch（按顺序），
然后 profile 自己的 `cordis.patch.yml`，然后 `$DSH_HOME/cordis.patch.yml`，
最后是命令行 `--patch <path>` 的覆盖层。有一条容易踩：
"Later layers win per row, and a patch replaces a row's entire config value
rather than deep-merging keys." 是整行替换，不是深合并。

看完这套就明白为什么插件能有八千个。门槛就是发个 npm 包，不用申请，不用审核，不用适配谁。

## awesome-dsh-plugin

星最多的那个目录，10.1k star，1.5k fork，210 个待审 PR。

收录标准四条：能用 `dsh plugin add` 装上、功能和它那句描述对得上、分类放对了、还在维护。
然后紧跟一句 "The list does not rank plugins or judge quality."
上榜只代表满足这四条运营规则，仓库死了或者装不上就摘掉。比起那些暗示上榜等于优质的目录，
这个自我定位算是诚实。

它现在已经不只是一份 README。有自己的域名 awesome-dsh-plugin.com，
还发布机器可读的 `awesome-dsh-plugin.com/plugins.json`。那份 JSON 的每条插件长这样：

```json
{
  "name": "dsh-smooth-stream",
  "owner": "Laplace-bit",
  "url": "https://github.com/Laplace-bit/dsh-smooth-stream",
  "category": "ui",
  "description": {
    "en": "Silky streaming reveal for the Web UI: text appears at the model's arrival rate...",
    "zh": "丝滑流式渲染：字跟着模型到达走、换行滑入、不闪..."
  },
  "npm": "dsh-smooth-stream",
  "stars": 33,
  "downloads": 937,
  "install": "dsh plugin --profile web add dsh-smooth-stream",
  "added": "2026-08-16"
}
```

字段有 name、owner、url、page、category、description（双语）、npm、stars、downloads、
install、added，可选的还有 screenshots 和 tarball。总条数 1,650。

有 npm 包名、下载量、装机命令、双语描述、截图，这已经是个 registry 的数据模型，
只是宿主是一个 GitHub README 加一个静态站。

它的瓶颈是那 210 个待审 PR。人工审、对着源仓库核、审完合进 README，质量比全自动抓取高，
代价是排队。清单站的吞吐是人的吞吐，而生态的产出速度是八千个仓库的速度。

它那句安全警告写得很直接：

> "Installing a plugin runs third-party code on your machine with your own permissions —
> it can read your files, use your credentials, and reach the network."

装一个插件等于用你自己的权限在你机器上跑第三方代码，能读文件、能用凭据、能连网。
它建议装之前先看源码，尤其机器上存着认证凭据的时候。考虑到 DSH 的插件能替换 agent loop，
这句不算夸张。

## 六个目录，六个答案

问同一个问题"一共多少插件"：

| 来源 | 数量 | 怎么来的 | star |
|---|---|---|---|
| dsh-suite | 880+ | 每小时刷元数据，每日真装做兼容实测 | 42 |
| dsh-market（宣称） | 1,550+ | 直接消费 awesome-dsh-plugin 的 json | — |
| awesome-dsh-plugin | 1,650 | 人工审 PR，对着源仓库核 | 10.1k |
| imsai-sh/awesome-…-plugins | 3,100+ | 自动收集，只做格式校验 | 117 |
| dsh.so | 7,247 | 从 GitHub + npm 聚合 | — |
| GitHub `dsh-plugin` topic | 8,809 个仓库 | 谁打 tag 就算 | — |

从 880 到 8,809 差十倍。差别在于每家对"什么算一个插件"和"怎么算收录"的定义不同。

topic 那 8,809 个是只要有人打了 tag 就计数，里面有多少是空仓库、模板复制、装不上的，
没人知道。dsh.so 的 7,247 是从 GitHub 和 npm 自动聚合。awesome-dsh-plugin 的 1,650
过了人工审。dsh-suite 的 880 是真的装起来跑过的。

这四个数字不是同一件事的四次测量。所以"dsh 有几千个插件"这种说法基本没有信息量，
得先问是哪个口径。真能装能用的那个数，最保守的估计是 880。

dsh.so 自己在站上标的是 7,247 个插件，其中独立验证过的 0 个，还写了一句
"stars measure interest rather than quality, dsh.so does not endorse untested software."
这个坦白也顺便把生态的真实状况说清楚了。

## 只有一家在做验证

whyihaveyou/dsh-suite，MIT，266 commits，42 star。

它做了四件事。第一是活目录，CI 每小时刷一遍插件元数据，每天把列表里的插件真的装进临时 profile，
验证它跟当前 DSH 版本还兼容，然后打徽章：绿色 ok、黄色 unknown、红色 broken。
在线站点带筛选、搜索和兼容性过滤。这是全生态唯一一家做兼容性实测的，别家最多做到格式校验。

第二是装在 DSH 里的插件商店（`@dsh-suite/plugin-manager`），在设置面板加一个 Store 页，
不出 DSH 就能浏览和一键装，能按兼容状态排序筛选。

```bash
npx @deepseek-ai/dsh plugin --profile web add @dsh-suite/plugin-manager
```

第三是脚手架 `create-dsh-plugin`，生成能跑的 `dsh.bundle` 加 Cordis 骨架，
三个模板 tool / events / WebUI，自带 `--verify` 冒烟测试，依赖走 Next.js 那种版本钉法。

```bash
npm create dsh-plugin@latest my-plugin
```

第四是自己写的一批插件：plugin-manager（商店本体，7 star）、plugin-team-board
（多 agent 任务看板，7）、themes（151 套明暗配对皮肤，6）、plugin-session-export
（append-only 日志导成 Markdown/HTML，3）、plugin-notify（回合完成或报错推 IM webhook，3）、
preset-center（中文场景模板，1）、plugin-deus（1）。

一个做了兼容性 CI、脚手架和 in-app 商店的完整套件 42 star，一份明确声明不评价质量的静态清单
10.1k star。

## 市场本身也是插件

一切皆插件这个设计让市场这东西也能做成插件。

dsh-market（装的时候叫 dshmarket），需要 dsh web 0.1.0-rc.6 或更新：

```bash
dsh plugin --profile web add dshmarket
```

装完在设置里多一个 Plugin Market 页，能浏览、搜索、一键装，有分类筛选、star 数、
最热最新排序、跟界面语言联动的双语描述。宣称 1,550+ 插件。

它的 catalog 不是自己攒的，是直接拉 awesome-dsh-plugin 的 `plugins.json`，
每次打开实时拉取，npm 映射和 star 数每天 CI 刷一遍。也就是说 awesome-dsh-plugin
已经从一份给人看的清单变成了给程序消费的数据源，它自己可能没打算走到这一步。

dsh-market 的安全模型有三道：只允许装 awesome-dsh-plugin 清单里的源，其他一律拒绝；
build 脚本默认禁用；终端和 CLI 类插件在装之前会被标出来。

第一条等于把那份 awesome list 当成了 allowlist。这是目前整个生态里最像样的安全设计，
而且是社区做的。

另外有个 dsh-find-plugin，让 agent 帮你找插件，你说要什么它去找：

```bash
dsh plugin --profile web add dsh-find-plugin
```

## 开发侧

同一件事——怎么写一个 dsh 插件——三个人用三种形态做了答案。

`create-dsh-plugin` 是脚手架，属于上面那个 42 star 的套件，三模板加 `--verify` 冒烟。

`bugmaker2/dsh-plugin-template` 是模板仓库，8 star，MIT。TypeScript 写 `src/index.ts`，
编译到 `lib/index.js` 当 Harness 入口，`pnpm-lock.yaml` 钉开发依赖。
流程是 clone、`pnpm install`、`pnpm run build`、`dsh plugin --profile hello add .`，
装完加载时打印 hello world。

`HarcoChen/dsh-plugin-guide` 是 skill，0 star。它不是给人读的文档，是给 agent 读的：

```bash
npx skills add HarcoChen/dsh-plugin-guide --skill deepseek-harness-plugin -g -a codex
```

`SKILL.md` 是主流程，配套参考文件覆盖包配置、插件实现、测试和文档，
覆盖对象包括面向模型的 tool、capability provider、LLM adapter、Web Client 插件、
bundle、profile、session 事件。它还写了一条免责：如果参考资料过时了，
以 checkout 里的当前源码和仓库指令为准。知道自己会过期并且提前说好该信谁，这条可以抄。

## 周边

anywhere-labs/deepseek-harness-desktop，15.3k star，MIT，Windows x64 和 macOS Universal。
社区做的桌面壳，把 web UI 和服务包成原生 app，不用装 Node、不用命令行，带自动更新和托盘。
它的说法是万物皆插件、桌面本身也是插件，桌面能力走同一套插件机制接进去，
第三方插件能访问桌面服务。内置插件市场。明确声明和 DeepSeek 官方无关联。

yjh051108/dsh-routing-suite，6.3k star，MIT，两个东西打包。`dsh-super-injector` v0.3.3
做运行时注入、热重载、迁移、卸载和自愈路由，不用重启。`dsh-router-standard` v0.3.0
是任务感知预设，三种模式 spec / react / mixed，加按模型自动选人格。
装法是带 submodule clone，跑 PowerShell 安装脚本，重启选 Router Standard (experimental)。
注意是 PowerShell，Windows 优先。

另外两个目录站：0xsline/awesome-deepseek-harness，751 star，覆盖插件、工具和基础设施，
20 多个分类。hikariming/dshfind，181 star，Next.js 16 加 React 19，
每天 02:17 UTC 自动同步 `dsh-plugin` topic 不用手动提交，另外配了 DSH 原理教学
（monad、coeffect、effect 组合那一套）和作者项目排行。

有一处存疑。0xsline 那个说自己的数据源之一是 `dsh-external/hub`，
但同时提到某些 `dsh-external` 仓库链接可能仍需 org 访问权限。
我没能确认这个 hub 到底是官方基础设施还是社区的，引用时别当官方源。

## SEO 站已经来了

搜 dsh plugin 会冒出来这些域名：dsh-plugin.org、dshhub.org、dshplugin.world、
dshplugin.app、dshpluginstore.com、dshplugin.store、dshplugins.xyz、dshmarket.com、
dshbase.com、deepseekdocs.com、deepseek-code.com、deepseekplugin.org、open-harness.net。

其中几个自称 Verified Plugins 或者 Plugin Registry。在全生态独立验证过的插件数是 0
的前提下，这个 Verified 怎么来的可以自己判断。

权威位置空着，SEO 就会来填，而且填进来的东西看起来跟真的一样，
有分类、有装机命令、有 star 数，就是没人验证过。

要找插件的话，按这个顺序信：dsh-suite 的兼容性徽章（唯一做过真实安装验证的）、
awesome-dsh-plugin（过了人工审）、插件的 GitHub 源码本身（尤其你机器上有凭据的时候）。
剩下那些 .xyz / .world / .app 当搜索结果看就行。

## 风险

把前面的事实串起来：topic 下 8,809 个仓库，独立验证过的 0 个，唯一做兼容实测的目录 42 star，
装一个插件等于用你的权限跑第三方代码，而 DSH 的插件能替换 agent loop 本身。

最后这条让性质变了。普通 IDE 插件顶多在编辑器里作乱，一个能改 agent 主循环的插件
可以决定模型看到什么、工具调用怎么执行、结果怎么回报。这和之前那批 coding agent
沙箱逃逸是同一类问题的两端：那边是攻击者想办法突破沙箱，这边是用户主动请第三方代码进来，
连沙箱都不用突破。

目前唯一像样的缓解是 dsh-market 那个 allowlist 加禁 build 脚本加标记 CLI 插件的三件套，
社区做的。

抛开 DSH，这个案例说明平台把 registry 空出来会发生什么。繁荣是真的，发个 npm 包就算插件，
三个月八千个仓库。但同时会发生四件事：数量口径失控，六个目录六个数字差十倍；
验证没人做，因为它又贵又不涨 star，42 比 10.1k 就是市场给出的定价；
传播力和技术投入脱钩，awesome-list 这个体裁本身有传播力，兼容性 CI 没有；
SEO 会来占权威这个位置，并且自称 Verified。

最后收口的地方往往不是官方，而是某个刚好有机器可读产物的社区项目。
awesome-dsh-plugin 大概没打算当 registry，但它有了域名和 plugins.json，
于是 dsh-market 把它当数据源，还把它当成了安全 allowlist。

如果哪天我们的 skill 或插件要开放给业务线自己写，这三件事得一开始就有人负责，
靠自觉都解决不了：一份机器可读的清单（不然第二天就有人自己攒一份，口径立刻分叉）、
能自动跑的兼容性验证（人工审的吞吐就是 210 个 PR 排队那个上限）、
一份 allowlist（装了就跑本机权限代码这件事，不会因为大家都是同事就变安全）。

## 参考

官方
- 仓库：https://github.com/deepseek-ai/deepseek-harness
- 打包与安装文档：https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish
- topic（8,809 repos）：https://github.com/topics/dsh-plugin

目录和市场
- awesome-dsh-plugin，10.1k star，1,650 条：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
  机器可读：https://awesome-dsh-plugin.com/plugins.json
- dsh-suite，42 star，880+，唯一做兼容实测：https://github.com/whyihaveyou/dsh-suite
  在线目录：https://whyihaveyou.github.io/dsh-suite/zh.html
- dsh-market，in-app 市场，消费 awesome 的 json：https://github.com/dsh-market/dsh-market
- 0xsline/awesome-deepseek-harness，751 star：https://github.com/0xsline/awesome-deepseek-harness
- hikariming/dshfind，181 star：https://github.com/hikariming/dshfind
- imsai-sh/awesome-deepseek-harness-plugins，117 star，3,100+，仅格式校验：https://github.com/imsai-sh/awesome-deepseek-harness-plugins
- dsh.so，7,247 条，自陈 0 个已验证：https://www.dsh.so/zh/ecosystem/

开发
- create-dsh-plugin：`npm create dsh-plugin@latest`，属 dsh-suite
- bugmaker2/dsh-plugin-template，8 star：https://github.com/bugmaker2/dsh-plugin-template
- HarcoChen/dsh-plugin-guide，0 star，skill 形态：https://github.com/HarcoChen/dsh-plugin-guide

周边
- anywhere-labs/deepseek-harness-desktop，15.3k star：https://github.com/anywhere-labs/deepseek-harness-desktop
- yjh051108/dsh-routing-suite，6.3k star：https://github.com/yjh051108/dsh-routing-suite

本目录相关
- `DeepSeek-Harness-架构实测.md`，DSH 本体的架构和门禁
- `2026-08-20-AI热点整理.md` 第 15 条、第 22 条

需自行核实
- `dsh-external/hub` 是否为官方基础设施，未能确认，可能需要 org 权限
- 各目录站的插件数量均为其自陈口径，无第三方核对
