---
title: Shopify-弃RN回原生-不是性能是agent
date: 2026-09-11
updated: 2026-09-11
categories:
  - 开发实践
  - 移动端
tags:
  - React Native
  - 移动端
---
# Shopify 弃 RN 回原生：不是 RN 不行，是「省一半人力」这个理由没了

> 一句话定位：Shopify 9 月 10 日官宣四个移动 app 全量从 React Native 迁回 Swift/Kotlin，
> 理由不是性能、不是 RN 失败，而是 coding agent 把「跨端共享实现」的成本优势打掉了——
> 第一个大牌公司因为 AI 改变成本结构而推翻五年前架构决策的公开案例。
> 文中数字截至 2026 年 9 月 11 日。

9 月 10 日，Shopify 工程博客发布《Native is now the future of mobile at Shopify》，作者 Mustafa Ali。决定是：Shopify、Shop、Point of Sale、Inbox 四个 app 全部迁回 Swift 和 Kotlin，全程用 AI 辅助迁移。Shop app 已经完成了——从概念验证到重建后的原生版上架应用商店，只用了 12 周。主 app（300+ 屏幕、桌面小组件、Apple Watch 应用）年内发布。这篇文章在 Hacker News 拿了 850+ 分。

如果你以为这又是一篇「RN 不行」的老生常谈，那正好说反了——Shopify 用了整整一段否认这一点：

> "React Native apps can be fast. Ours are."

他们自己的 RN 应用很快。那为什么还要迁？

## 2020 年为什么选 RN

先看他们当年为什么做这个决定。2020 年官方文《React Native Is the Future of Mobile at Shopify》，三个理由：

- 不用把同一个功能做两遍
- 让开发者能跨栈工作
- 少追功能对齐，多交付价值

值得注意的是，六年后的这篇「分手文」里，Shopify 矢口不提 RN 没兑现承诺——相反，他们承认：

> "React Native consistently delivered these benefits."

RN 持续兑现了这三点，代价是性能优化、基础设施建设和跟进框架升级的持续投入，但当时收益远大于投入。所以这不是打脸文，作者自己也把话说得很清楚："React Native was the right choice for Shopify in 2020."

真正的问题是：当年那个决策的**前提**没了。

## 变的是什么：一个等式被打掉了

2020 年决策背后有个默认等式：**同一功能做两遍 = 两倍工作量**。跨端框架的全部价值都建立在这个等式上——用一套实现换掉两套，省下的人力就是收益。

Shopify 的原话是这么说的：

> "Native still means building and maintaining software on two platforms, that cost has not disappeared. What changed is that agents can now do enough of the implementation, translation, testing, and review work that it's no longer the deciding factor it was in 2020."

双平台的成本没有消失，但它不再是决定性因素了。

他们在原型验证里试过让 agent 干三件事：拿 iOS 版本当参照实现 Android 版（反之亦然）、帮助开发者跨出主栈做贡献、通过共享的规格说明/测试/评审节点来压低双平台 parity 的维护成本。结论是三件都能干，而且到 2025 年底，agent 已经不只是「帮我们写得更快」，而是让整个团队开始怀疑「做两遍是否还等于两倍工作量」。

于是成本表重排了：RN 最大的红利（共享实现）被 agent 削弱，而原生的优势（贴近平台能力和一手工具链，代码和平台之间少几层框架和依赖）原封不动。天平倒了，他们选择「核心假设变了就重新评估」——"LLMs changed one of the core assumptions behind our 2020 decision, so we reevaluated our mobile stack from first principles."

有意思的细节：Shopify 说自己 2021 年就开始用 LLM 了，比 ChatGPT 早一年。所以这不是跟风，是一个用了五年 agent 的团队对成本结构的重新核算。

## 怎么迁的：greenfield + 两套自研基建

方向定了之后是路线。这次迁出 RN 选了 greenfield（推倒重建），和 2020 年迁入时的 brownfield（渐进替换）正好相反。理由很直白：LLM 擅长拿现有版本当参照在新栈里写功能；干净的地基可以不带历史约束地重建；原型显示 agent 参与下重建速度远超从前。

但这套打法有两个绕不开的坑，Shopify 为此自研了两套基建，这部分是全文工程含量最高的料。

**坑一：AI 一次性重写会产生大量垃圾代码。** 他们的原话：直接把 LLM 指向 RN 代码库让它 one-shot 出原生版，"you end up with a huge amount of unmaintainable code that can't be shipped"。解法是自建的 **Helix** 系统：指向一个屏幕，agent 读 RN 代码后提出一串小粒度 checkpoint，每个 checkpoint 必须用测试证明行为、和运行中的 app 做视觉比对、通过两个对抗性 code reviewer、再由人点头，才能提交进入下一个。评审反馈会被记住，随着迁移推进整个循环越来越自主。本质是把「AI 写代码」约束在「每一步可验证」的轨道里。

**坑二：agent 改代码很快，验证输出很慢。** 原话："Agents can make code changes in seconds, but it takes them several minutes to test the output." 瓶颈在模拟器——依赖 accessibility tree 或截图的验证太慢。解法是把业务逻辑和 UI 彻底解耦，让业务逻辑能在桌面 headless 运行、通过 CLI 暴露给 agent：agent 用 CLI 检查 app 状态、导航、执行动作，毫秒级迭代，可以自主跑几个小时，需要真 UI 时再走 remote mode 驱动模拟器。换句话说，他们为 agent 专门重造了一套可被 agent 寻址的应用架构。

这套东西对写过自动化测试的人来说不陌生——它就是把「被测系统要可观测、可控制」的原则从测试域搬到了 agent 域。

## 生态代价：三个开源库的去向

Shopify 是三个重要 RN 开源库的维护方，这次一并交代了去向：

- **react-native-skia**：赞助到 2026 年底，William Candillon 会 fork 后改名继续发布，原仓库过渡完成后归档
- **FlashList**：周下载约 200 万、RN 高性能列表的事实标准，Shopify 继续修破坏兼容性的关键 bug，正在和几家公司谈长期接管
- **restyle**：用户基数小，维护到 2026 年底，之后归档

一个六年用户、三个核心库的维护方亲手给 RN 生态拔管，这个信号本身比任何跑分都响。

## 我们能做的

**一、跨端框架的估值逻辑变了。** 选跨端框架的理由从来是「省一份人力」，现在 agent 把「另一端的实现成本」压到了不再值得为此引入一层框架抽象的程度。手里有 RN/Flutter/小程序跨端项目的团队，值得重新算一次这笔账——不是跨端不好，是它解决的问题在贬值。作为小程序面板开发，这条和我直接相关：当 agent 能低成本维护双端实现时，容器层的价值要靠别的东西（平台能力、性能、包体）来证明。

**二、「核心假设变了就重新评估」是个可复用的决策模板。** Shopify 这次最值得学的不是结论而是动作：承认 2020 年的决定在当时是对的、识别出哪个前提变了、从第一性原理重推一遍。多数团队的架构决策缺的从来不是智慧，是「假设变了就敢翻案」的组织勇气——以及翻案时的成本核算能力。

**三、给 agent 修路是比「用 agent」更高杠杆的事。** Shopify 的 Helix 和 headless CLI 说明一件事：agent 时代的工程基建，是把系统改造成 agent 能高速验证、自主迭代的形态。模型能力大家都在同一个量级上，真正的差距在于反馈回路——谁的系统让 agent 验证得快，谁的 agent 就跑得远。

**四、防 AI slop 的解法是「小步 + 双重评审 + 人在环」。** Helix 的 checkpoint 设计可以直接抄：不让 agent 一次性大产出，拆成小粒度、每步带测试证据和视觉比对，再用对抗性 review 互相制衡。这套模式对任何用 agent 重写存量代码的团队都成立。

Shopify 那句话值得抄在结尾："Native is the right choice for Shopify now, but React Native was the right choice for Shopify in 2020." 技术选型没有永远的对错，只有前提还在不在。agent 干掉的不是某个框架，是「人力成本恒定」这个旧世界的地心引力。

## 参考

- Shopify Engineering: [Native is now the future of mobile at Shopify](https://shopify.engineering/back-to-native)（Mustafa Ali，2026-09-10）
- Shopify Engineering: [React Native Is the Future of Mobile at Shopify](https://shopify.engineering/react-native-future-mobile-shopify)（2020，当年的决定）
- Simon Willison: [Native is now the future of mobile at Shopify](https://simonwillison.net/2026/Sep/10/shopify-react-native/)（2026-09-10，本文线索来源）
- Hacker News 讨论（852 分）：https://news.ycombinator.com/item?id=49643982
