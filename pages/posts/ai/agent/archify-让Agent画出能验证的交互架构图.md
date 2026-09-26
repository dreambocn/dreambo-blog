---
title: archify-让Agent画出能验证的交互架构图
date: 2026-09-22
updated: 2026-09-22
categories:
  - AI
  - Agent
tags:
  - Agent
  - 架构图
---
# archify-让Agent画出能验证的交互架构图

一句话定位：archify 是一个装进 coding agent 的画图 skill。它把你说的人话（或你已有的 Mermaid）翻译成一份带 schema 的 JSON 规格，校验通过后渲染成单文件交互 HTML——架构图、时序图、工作流、数据流、状态机五种，节点能点、路径能追、能导 PNG。

GitHub 上是 tt-a1i/archify，MIT 协议，截至 2026-09-22 约 6.9 万 star，9 月单月涨了 3 万，拿过 GitHub Trending 周榜全语言第一（2026-09-01，作者晒过截图）。当前版本 2.17.0-dev.1，迭代很快。作者是国内开发者，仓库里挂了微信群和 QQ 群入口，量子位 9 月发过项目报道和开发者访谈。

## 一、为什么使用它

让 AI 画架构图，多数人试到的结局是这样的：agent 现场生成一张 SVG 或一段 HTML，第一眼唬人，细看连线交叉、节点重叠，想挪一个框就得整张重生成，跟掷骰子一样。Mermaid 走另一个极端，图进 git 能版本化，但表达力有限，节点一多必乱，交互为零。

archify 的做法是把「画图」这道题拆开。模型只做它擅长的那一步：把描述翻译成受 schema 约束的 JSON 规格，多少节点、谁连谁、怎么分组。布局、布线、配色、动画全部由确定性代码完成，与模型发挥无关。翻译错了改规格，布局不满意调参数，不用整张重掷。

副产品是图的审美下限被代码托住了。模型状态再不稳定，产出至少是排版合格的图。

## 二、它独有的东西：校验收据

画图工具不少，archify 最值得抄的设计是它不信任模型的产出。SKILL.md 里写死了流程：agent 写完候选规格，必须跑

```bash
node bin/archify.mjs validate <type> <candidate.json> --quality showcase --json
```

showcase 档要求 9 项检查全过、0 组合错误、0 警告；只过 4 项的属于 basic，SKILL.md 原话是「never showcase acceptance」，不许当合格品交付。交付前还有一道 `deliver` 终检。每一步留机器收据，不靠模型自我感觉良好。

其他几点简短列一下：

- 五种图各有独立 schema 和渲染器，全是本地 node 代码，生成过程不出网。
- 输出是单文件自包含 HTML，viewer 和 SVG 全内联。我拿自带示例渲染了一次，811KB，发给同事双击就能看，点节点、追路径、切深浅主题的交互都在。
- 已有的 Mermaid flowchart、sequenceDiagram、stateDiagram 可以直接喂进去转，存量图不用重写。
- architecture 类型支持读真实仓库出图，带 `--repo-root`，图上标注源码依据。
- 导出覆盖 PNG/JPEG/WebP/SVG/WebM，另有 1200×630 分享卡；追踪过路径之后能导「路径分享卡」。
- 隐私上做了克制：唯一的网络行为是更新检查，一个 GET 到固定 manifest，不带版本号、agent 类型、项目数据，设 `ARCHIFY_UPDATE_CHECK_DISABLED=1` 可以整个关掉。

## 三、为什么推荐它

安装一行，四个 agent 官方都认：

```bash
npx skills add tt-a1i/archify -g
```

Cursor、Claude Code、Codex CLI、OpenCode 都在支持列表里。我把它装进本机统一的 skills 目录，几个 agent 共用一份；装完跑 `node bin/archify.mjs doctor` 全绿（要求 node ≥ 18，本机 v24），自带示例一次渲染成功，全程没跑 npm install。

推荐它还因为工程味正。skill 目录里是 schemas、renderers、迁移脚本和测试，谱系清楚（基于 Cocoon-AI 的 architecture-diagram-generator v1.0，MIT）。写作纪律也钉进了 SKILL.md：先落候选产物再谈渲染内部、主路径节点不超过 12 个、一次诊断只修一处几何。这些约束全是在压模型的乱发挥，我猜作者被 LLM 画图翻过不止一次车，才把规则一条条补成这样。

## 四、边界与代价

- 单文件 800KB 起。一个文档放十张图就是 8MB 量级，往 git 仓库里堆要掂量。
- 布局自由度低于手拖工具。skill 不鼓励手调坐标，先自动布局，出问题才允许诊断修复，且一次修一处。想精确控制每根线走向的人会觉得束手束脚，这是拿自由度换出图下限的取舍。
- 图漂亮不等于图正确。它保证渲染质量，不保证图描述的架构符合事实。用读仓库出图时它会引源码位置，关键节点值得抽查一下引得对不对。
- 2.17.0-dev.1 还是开发期版本，spec 结构可能再动，CHANGELOG 已经 95KB。
- 这个 skill 不轻：目录里两百多个文件，校验依赖 node。用惯纯提示词 skill 的会觉得重，但渲染质量就是这些代码给的。

## 五、适用场景

顺手：技术方案和答辩文档配架构图、时序图；老 Mermaid 图升级成交互版；发给没装任何工具的人看，自包含 HTML 的价值就在这；需要分步骤讲解的流程，开 trace motion 能按章节播放。

不顺手：需要和代码长期双向同步的活文档，它是一次性生成，代码变了图不会自己变；随手涂鸦，起手就 JSON 加校验的流程对草图来说太重。

## 结论

archify 把画图拆成两半：模型听懂人话，代码负责布局渲染，中间一道机器校验把关，产物是能直接发出去的单文件。装它花不了一分钟，下次写方案要配图，跟 agent 说一句「用 archify 画」，试一张就知道合不合手。

## 参考

- 仓库：https://github.com/tt-a1i/archify
- 在线画廊（11 个官方场景，可交互）：https://tt-a1i.github.io/archify/gallery.html
- 场景指南：https://tt-a1i.github.io/archify/guide.html
- 量子位项目报道（2026-09）：https://www.qbitai.com/2026/09/482469.html
- 量子位开发者访谈（2026-09）：https://www.qbitai.com/2026/09/488519.html
- GitTrend 2026-09 月榜（star 数据出处）：https://gittrend.io/monthly/2026-09
