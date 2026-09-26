---
title: WebMCP-computer-use的换代
date: 2026-08-28
updated: 2026-08-28
categories:
  - AI
  - Agent
tags:
  - MCP
  - computer-use
---
# WebMCP 是 computer-use 的换代，不是 MCP 的分支

名字骗人。WebMCP 里带着 MCP，于是几乎所有讨论都把它拿去跟远程 MCP server 比，比出来的结论是"多了一条给 agent 接入的路"。这个参照系是错的。Chrome 146 Canary 在 2026 年 2 月落地第一个实现，2026 年 5 月 19 日的 Google I/O 宣布 Chrome 149 到 156 开公开 origin trial，到 2026 年 8 月底线上真实注册工具的站点接近零——要判断这个零是暂时的还是终局的，得把它放回真正的对照组里：computer-use。它替代的是那条路，继承的也是那条路的约束。

## 先说清楚它是什么

WebMCP 是一个浏览器 API，不是服务端组件。网页在自己的 JS 里把业务动作注册成工具，供同一个浏览器里的 agent 调用，协议传输由浏览器负责，页面只借用了 MCP 的 tool 原语。形态大致是这样（字段以 origin trial 期间的规范为准，下面会讲到它刚改过一次名）：

```js
document.modelContext.provideContext({
  tools: [{
    name: "search_flights",
    description: "在当前站点搜索航班，返回可预订的航段列表",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string" },
        to:   { type: "string" },
        date: { type: "string", format: "date" }
      },
      required: ["from", "to", "date"]
    },
    async execute({ from, to, date }) {
      const r = await searchFlights(from, to, date);
      return { content: [{ type: "text", text: JSON.stringify(r) }] };
    }
  }]
});
```

远程 MCP server（Streamable HTTP）是另一回事：站点在自己域名下跑一个标准端点，任何 agent 拿到授权都能连，跟浏览器没关系。两条路能并存，但不解决同一个问题。

## computer-use 的三个老毛病

现在 agent 操作网页的标准做法是截图加视觉定位：截一张图，让模型看出"提交按钮在哪"，算出坐标点下去，再截一张图看结果。这条路有三个改不掉的毛病。

**脆**。定位依赖像素和 DOM 结构，站点一次改版就碎一片。按钮挪个位置、换个图标、加个 A/B 实验，昨天跑通的流程今天就断。

**贵且慢**。每一步都要一张截图进上下文，多步流程的 token 成本和延迟都是线性堆上去的。

**语义靠猜**。一个写着"提交"的按钮到底提交什么、幂不幂等、能不能重试，页面上没写，模型只能试。试错在只读场景无所谓，在下单和支付场景是灾难。

## WebMCP 逐条换掉了它们

对着上面三条看：视觉定位换成声明式 schema，坐标不再存在，改版不影响工具签名；截图循环换成结构化返回，一次调用一个 JSON，不用来回截图；语义不用猜，`description` 和 `inputSchema` 是站点自己写的，幂等性、参数约束、副作用都可以明说。

有一点两者是完全一致的：**都复用用户当前的登录态**。agent 就在这个标签页里，用的是页面已有的 cookie 和 session，不用 OAuth，不用发 API key，不用说服用户走授权。

很多人把"鉴权免费"说成 WebMCP 的独特优势，这不准确。computer-use 同样免费。这一点恰恰是它俩同属一个生态位的根本证据——它们都是"在用户的浏览器里、以用户的身份、替用户操作"。WebMCP 相对 computer-use 的真正增量只有一个词：**确定性**。

## 但它继承了 computer-use 的全部约束

这是把它放回正确对照组之后最重要的一条，也是拿它跟远程 MCP server 比的时候会彻底看不见的一条。

标签页必须开着。工具的生命周期绑在页面上，页面关了工具就没了。必须有一个 agent 在浏览器里，必须有一个用户已经登录并且把页面打开着。于是无头运行、后台批量、定时任务、CI 里调用，全部做不了。

这不是实现不完善，是定义决定的——它本质上就是"在用户的浏览器里替用户操作"，和 computer-use 一模一样。远程 MCP server 和 CLI 没有这层约束，因为它们根本不在这一层上。

所以判断某个能力该不该走 WebMCP，问一句就够：这件事离开用户的浏览器还成立吗？成立的话，你要的是远程 MCP 或 API，不是 WebMCP。

## 还换来了 computer-use 没有的新攻击面

换代不是纯赚。computer-use 有个被低估的安全性质：agent 看到的，就是人类看到的那一个屏幕。要骗 agent，得先骗过同一块屏幕前的人。

WebMCP 打破了这个性质。工具的 name 和 description 是**模型可见、用户不可见**的，而且工具集可以在一次会话中动态变化。已经有针对这一点的攻击研究（Tool Surface Poisoning）：在 agent 执行任务的过程中改掉可见的工具集或工具描述，让恶意工具看起来合法，诱导 agent 在完成原任务的同时把它也调了。规范加了 permissions policy 和 secure context，但这些挡不住一个被骗的模型去调用一个本身合法的工具。

同源生态的数据不乐观：88% 的开源 MCP server 鉴权是坏的，超过四分之一的社区 agent skill 含注入或外泄漏洞。2026 年 4 月，Johns Hopkins 的一个团队靠往 GitHub PR 标题里注入指令，劫持了 Claude Code、Gemini CLI 和 GitHub Copilot，把 Actions secrets 外泄成了 PR 评论。

推下去的结论是：支付、改密码、下单、转账这类高价值动作，长期都得卡人工确认。而一旦每步都要点确认，相对于用户自己点几下省下来的那点时间就所剩无几。这个矛盾目前没有解法，而且 computer-use 也一样跑不掉。

## 换代成不成，只取决于站点愿不愿意配合

computer-use 和 WebMCP 最大的差别不在技术，在**要不要网站同意**。

computer-use 不需要。它把网站当成一块屏幕，站点方零成本、零知情、也零否决权。WebMCP 需要，而且要的不是"加几行注册代码"那么轻。

它要求把业务动作抽成幂等、带 JSON Schema、能脱离 UI 被调用的函数。而绝大多数 web 前端不是这么长的：校验散在表单组件里，状态依赖某个上游路由，提交按钮的 onClick 里塞着埋点、弹窗和跳转，中间还有几个只有点过前一步才会被初始化的变量。把这些抽出来，重构量不比重新写一个服务层小。

**WebMCP 是拿站点的开发成本，换 agent 的确定性。** 一整套采用曲线的问题，都从这句话里长出来：成本在站点这边，收益在 agent 那边。站点等 agent 支持，agent 等站点部署，教科书式的双边冷启动。截至 2026 年 8 月，没有主流 agent 真的在调 WebMCP 工具，Gemini in Chrome 被宣称是第一个；Google 点名的九家试验站点（Expedia、Booking.com、Shopify、Credit Karma、TurboTax、Redfin、Etsy、Instacart、Target）也没有一家公开确认已上线。

真正可能打破僵局的不是"WebMCP 好用"，是分发方施压。Lighthouse 在 2026 年 5 月加了 agentic browsing 相关审计项，其中 `form-coverage` 预期会从 informational 升级为 warning。这条路径和 schema.org 一模一样：结构化数据当年不是因为开发者觉得爽而普及的，是因为 Google 用搜索排名奖励它，不做掉排名。

## 谁会配合

把激励摊开看。暴露工具给 agent 是有代价的：转化归属丢失、广告曝光丢失、请求量和风控成本上升。纯内容站和广告驱动的站点没有任何理由支持它——agent 取走内容直接回答用户，页面一次都不用打开。

会配合的是交易型站点，而且动机是防御性的：**computer-use 已经能绕过他们直接操作页面了**。与其被一个看不见、控制不了、随时可能点错的视觉 agent 绕过，不如自己定义入口，自己决定哪些动作能被调、哪些必须走确认，把转化和品牌留在自己这边。

也就是说，WebMCP 的采用动力不来自它对站点有多好，来自 computer-use 对站点有多可怕。这也解释了那份试验名单为什么全是机票、电商、报税、房产、生鲜——被 agent 绕过损失最大的正是这几类。

结论不是"未来 web 都会支持 WebMCP"，而是：**吃搜索流量、且怕被 agent 绕过的交易型站点会支持，其余不会。**

## 生态位：它在 computer-use 那一格

摊成一张表最清楚。横轴是"要不要用户的浏览器"，这一刀切下去，格局就出来了：

| | 要用户浏览器 | 要站点配合 | 确定性 | 典型场景 |
|---|---|---|---|---|
| computer-use | 是 | 否 | 低 | 站点不配合时的兜底 |
| WebMCP | 是 | 是 | 高 | 消费者交互式交易流程 |
| 远程 MCP server | 否 | 是 | 高 | 跨 agent 的开放能力接入 |
| CLI / API | 否 | — | 高 | 开发者自动化、CI、批处理 |

上面两行在同一格里互相替代，下面两行是另一个世界，跟它们基本不重叠。所以拿 WebMCP 去跟远程 MCP server 比"哪个更适合接入 agent"，是在比两个不冲突的东西。

顺带一提，MCP 生态本身没有降温，SDK 月下载量约 9700 万。WebMCP 采用率接近零不代表 MCP 协议层不行，只说明"让站点主动配合 agent"这个特定形态还没跑通。

还有个信号值得记一笔：工具注册入口从 `navigator.modelContext` 挪到了 `document.modelContext`，理由是工具属于具体页面而非浏览器。Chrome 150 把旧名保留成 alias 并标废弃。origin trial 期间就改一次名，说明规范的形状还在动。

## 我们能做的

现在不值得为生产系统投入 WebMCP。规范在动，采用率接近零，消费端 agent 还没就位，现在写的注册代码大概率要重写。

值得现在做的只有一件事：**把核心业务动作抽成干净的、带 schema 的、幂等的服务层函数。** 这一层无论最后接 WebMCP、接远程 MCP server、还是接 CLI，都是复用的。传输层会反复变，这层不会。别赌传输层。

要判断这次换代成不成，别盯 WebMCP 自己的新闻，盯两个外部信号：一是 computer-use 那边的可靠性和成本还在不在降——它降得越快，站点配合的动力越弱；二是 Lighthouse 里 agentic browsing 审计项的状态，等 `form-coverage` 真从 informational 变成 warning，就是不做的成本开始大于做的成本的那一天。

## 参考

- [Join the WebMCP origin trial — Chrome for Developers](https://developer.chrome.com/blog/ai-webmcp-origin-trial)
- [WebMCP — AI on Chrome 文档](https://developer.chrome.com/docs/ai/webmcp)
- [Agent security considerations for WebMCP](https://developer.chrome.com/docs/agents/security)
- [The State of WebMCP: July 2026 — Spronta](https://www.spronta.com/blog/state-of-webmcp-july-2026/)
- [WebMCP updates, clarifications, and next steps — Patrick Brosset](https://patrickbrosset.com/articles/2026-02-23-webmcp-updates-clarifications-and-next-steps/)
- [WebMCP Tool Surface Poisoning: Runtime Manipulation Attacks on LLM Agents — arXiv](https://arxiv.org/html/2606.06387v1)
- [MCP Security Crisis: Systemic Design Flaws in AI Agent Infrastructure — Cloud Security Alliance](https://labs.cloudsecurityalliance.org/research/csa-research-note-mcp-security-crisis-20260504-csa-styled/)
