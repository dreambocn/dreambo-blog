---
title: Ocean网关-模型选型对比
date: 2026-09-01
updated: 2026-09-01
categories:
  - AI
  - 工具与框架
tags:
  - 网关
  - 模型选型
---
# Ocean 网关 12 个模型：5 个可以从配置里删掉，剩下 7 个这样分工

一句话定位：Tuya Ocean Code Gateway 上有 12 个模型，本文把它们的能力（多榜单交叉去噪）和价格（各家官方 API 定价）放在一张表里，给出「什么活儿派什么模型」的分工表，以及 Claude Code 里对应的混搭配置。

方法说明：模型清单来自网关 `/v1/models` 接口实测（2026-09-01）；能力结论只在至少两个来源交叉后才写进来——Artificial Analysis 智能指数（v4.1.1）+ 各家官方评测。价格全部取自各家官方 API 定价页，网关实际结算以内部计费为准。

## 先上结论：任务到模型的分工表

| 活儿                                           | 派谁          | 理由                                                               |
| ---------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| 架构设计、疑难 bug、高风险重构                 | claude-opus-5 | Artificial Analysis 智能指数 63，全榜第一                          |
| 日常主力编码（大部分时间）                     | glm-5.3       | AA 60，开源模型第一梯队；$1.4/$4.4，是 opus-5 的 1/4 价            |
| 子代理、并发批量任务、commit message、会话摘要 | glm-5.3-flash | 促销价 $0.075/$0.25，缓存读取 $0.015/MTok，是 opus-5 缓存价的 1/33 |
| 前端/UI 重活                                   | glm-5.2       | Code Arena 百万用户前端盲测第一（官方口径），与 5.3 同价           |
| 看图、截图、视频理解                           | glm-5.3-flash | 原生多模态，1M 上下文                                              |
| GPT 系旗舰、要第二意见交叉验证                 | gpt-5.6-sol   | AA 61，与 opus-5 (high) 持平；CyberGym 83.6                        |
| GPT 系低价跑量                                 | gpt-5.6-luna  | $0.20/$1.20，GPT 系行为的最便宜入口                                |

低频高价值的活儿给 opus-5，高频例行活儿给 glm-5.3 和 glm-5.3-flash，这一头一尾定了，成本结构就定了。

## 12 个模型全景：谁被谁压死

按量单价（USD / MTok，2026-09-01 官方定价页）：

| 网关模型名       | 输入             | 输出            | 缓存写 | 缓存读 | 备注                             |
| ---------------- | ---------------- | --------------- | ------ | ------ | -------------------------------- |
| claude-opus-5    | $5               | $25             | $6.25  | $0.50  | AA 63 全榜第一                   |
| claude-opus-4-6  | $5               | $25             | $6.25  | $0.50  | 与 opus-5 同价，上一代           |
| claude-sonnet-5  | $2               | $10             | $2.50  | $0.20  |                                  |
| claude-haiku-4-5 | $1               | $5              | $1.25  | $0.10  |                                  |
| glm-5.3          | $1.4             | $4.4            | —      | $0.26  | 1M 上下文，开源第一梯队          |
| glm-5.2          | $1.4             | $4.4            | —      | $0.26  | 前端盲测第一（官方口径）         |
| glm-5.1          | $1.4             | $4.4            | —      | $0.26  | coding 对齐 Opus 4.6（官方口径） |
| glm-5.3-flash    | ~~$0.15~~ $0.075 | ~~$0.50~~ $0.25 | —      | $0.015 | 五折促销，2026-09-09 截止        |
| glm-5v-turbo     | 未单列           | 未单列          | —      | —      | 视觉 coding 基座，200K 上下文    |
| gpt-5.6-sol      | $4               | $20             | $5     | $0.40  | 促销价，至少持续到 2026-11-21    |
| gpt-5.6-terra    | $2               | $12             | $2.50  | $0.20  |                                  |
| gpt-5.6-luna     | $0.20            | $1.20           | $0.25  | $0.02  |                                  |

5 个可以删掉的理由：

- claude-opus-4-6：与 opus-5 同价，能力是上一代。GLM-5.1 的 coding 能力就已对齐 Opus 4.6 且便宜 3 倍多。它在网关里没有立足场景。
- glm-5.1：与 glm-5.3 完全同价（$1.4/$4.4），而 5.3 全面更强（AA 60 vs 更旧一代）。同价段没有理由选它。
- claude-haiku-4-5：被 glm-5.3-flash 压死。flash 促销价是它的 1/13，缓存读取是它的 1/7，还带 1M 上下文和原生多模态。Claude Code 的 HAIKU 槽位可以直接填 flash（下文有配置），haiku 没有必要再占一个位置。
- gpt-5.6-terra：两头受气。对上比 claude-sonnet-5（$2/$10）还贵，对下比 glm-5.3（$1.4/$4.4）全面更贵。GPT 系要么上 sol 要么用 luna，terra 是中间那个没人选的。
- glm-5v-turbo：多模态被 glm-5.3-flash 覆盖（flash 原生多模态、1M 上下文、更便宜），官方定价页也没有它的条目。除非专门做视觉 coding 的对比实验，否则用不上。

剩下 7 个：claude-opus-5、claude-sonnet-5、glm-5.3、glm-5.2、glm-5.3-flash、gpt-5.6-sol、gpt-5.6-luna。

## 能力排名：榜单交叉后的结果

Artificial Analysis 智能指数 v4.1.1（2026-09-01 查）：

- 全榜前五：Claude Opus 5 (max) 63、Opus 5 (xhigh) 63、Claude Fable 5 62、Opus 5 (high) 61、GPT-5.6 Sol (max) 61。
- 开源模型前三：Kimi K3 (max) 60、GLM-5.3 (max) 60、Qwen3.8 58。
- 注意：全榜第三的 Claude Fable 5 不在网关模型列表里，不用惦记。

GLM 官方评测口径的补充交叉：

- GLM-5.3 的 Z.ai Code Bench Max 档 34.5%（5.2 是 23.4%），High 档 31.4% 超过 Claude Opus 4.8 的 29.5%。
- CyberGym 84.5%，高于 Mythos 5 的 83.8% 和 GPT-5.6 Sol 的 83.6%——网络安全和漏洞挖掘是这一代 GLM 新长出来的能力，做安全审计类任务值得单独一试。
- GLM-5.2 的差异化在 Code Arena：百万用户盲测里前端能力全球可用模型第一（官方口径）。

落点：opus-5 仍是天花板；glm-5.3 以 1/4 的价挤进全榜第一梯队，开源阵营与 Kimi K3 并列第一；sol 是 GPT 系最强，与 opus-5 (high) 同分。

## 第三方基准交叉：glm-5.3 与 opus-5 在 agent 实战里打平

OpenRouter 的 τ²-Bench Airline 榜（真实 API 端点持续跑分、119 个模型，测多轮工具调用，2026-09-01 查）对网关用户参考价值最大，因为网关模型几乎全在榜：

| 榜位 | 模型 | 准确率 |
| --- | --- | --- |
| #4 | claude-opus-5 | 80.1% |
| #5 | glm-5.3 | 80.0%（并列该榜最快档，70 秒/任务） |
| #12 | gpt-5.6-sol | 77.3% |
| #20 | claude-sonnet-5 | 76.7% |
| #26 | glm-5.2 | 75.2% |
| #28 | gpt-5.6-terra | 74.7% |
| #42 | glm-5.3-flash | 73.3% |
| #59 | gpt-5.6-luna | 70.7% |
| #68 | claude-haiku-4-5 | 67.3% |

两个信息量很大的点：

- **glm-5.3 和 opus-5 在 agentic 工具调用上打平**（80.0% vs 80.1%，差 0.1 个百分点）。AA 智能指数上 opus-5 领先的 3 分主要体现在推理和知识类评测，不是编码 agent 的实战形态——这直接动摇「主力必须 opus-5」的前提。
- **glm-5.3-flash 与 glm-5.3 差 6.7 个百分点**。第三方实测证实了两者的差距，比官方「flash 编程与 Opus 4.8 相当」的宣传口径实在。但 flash 仍明显压过 haiku-4-5（73.3% vs 67.3%）和 luna，坐实前文「haiku 可删」的判断。

AA 对 flash 的独立画像补充：智能指数 57，同级 111 个模型里第 4（中位数 29）；代价是输出偏慢（43 tok/s，同级第 51）且啰嗦（输出 token 比中位数多约 36%）——它便宜是因为单价低，不是 token 省。

OpenRouter 真实用量榜（周数据，截至 2026-08-31）是市场投票：glm-5.3-flash 按 token 处理量排全站第 4（8.14T，新上榜），gpt-5.6-luna 第 3。便宜模型跑量、旗舰省着用，已经是公开市场的主流用法。

修正后的能力口径：**agent 实战形态下 glm-5.3 ≈ opus-5，flash 与 5.3 有约 7 个百分点的可感知差距**。日常编码两者体感接近，高难任务 flash 明确到不了 5.3 的上限。

## 价格之外的特殊计费，比单价更容易踩坑

一、GPT-5.6 系列的长上下文计费档。输入超过 272K 后进入长上下文档：输入价 ×2、输出价 ×1.5（sol 从 $4/$20 变 $8/$30，luna 从 $0.20/$1.20 变 $0.40/$1.80）。想把整个大仓库一次性塞给 sol 之前，先算这笔账。

二、Anthropic 新 tokenizer。4.7 之后的 Claude 模型换了 tokenizer，同样文本 token 数约多 30%，Claude 系实际成本比标价高三成左右，横向对比时要打这个折扣。

三、促销到期日。glm-5.3-flash 五折价 2026-09-09 24:00（UTC+8）截止，回到 $0.15/$0.50——原价也仍是最便宜的一档，不用囤。sol 促销价至少持续到 2026-11-21。

四、OpenAI 侧的 Batch 和 Flex 是五折，Fast mode 是两倍，与上面各条叠加计算。

## 同样的活儿，各家花多少钱

统一口径：输入 100 万 + 输出 20 万 token，不考虑缓存，按上表标价（Claude 系未打 tokenizer 折扣）：

| 模型                    | 总花费 |
| ----------------------- | ------ |
| claude-opus-5           | $10.00 |
| gpt-5.6-sol             | $8.00  |
| gpt-5.6-terra           | $4.40  |
| claude-sonnet-5         | $4.00  |
| glm-5.3                 | $2.28  |
| claude-haiku-4-5        | $2.00  |
| gpt-5.6-luna            | $0.44  |
| glm-5.3-flash（促销价） | $0.125 |

opus-5 是 glm-5.3 的 4.4 倍，是 flash 促销价的 80 倍。

但 Claude Code 的真实消耗大头不是输出，是缓存命中的上下文读取。看缓存读取价：opus-5 $0.50、glm-5.3 $0.26、flash $0.015（每 MTok）。长会话反复读同一段上下文时，flash 与 opus-5 的真实差距是 33 倍，比表面单价差距更大。这也是「杂活全塞给 flash」在账单上最看得见回报的地方。

## Claude Code 里怎么配

网关同时提供 Anthropic 兼容端点，`ANTHROPIC_BASE_URL` 指过去即可。按 env 变量做模型映射，三个配方：

均衡档（默认推荐）：主模型 glm-5.3，杂活槽 glm-5.3-flash，啃硬骨头时 `/model` 临时切 opus-5。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "<网关地址>",
    "ANTHROPIC_AUTH_TOKEN": "<key>",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-5",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5.3-flash"
  }
}
```

这套映射实测可用——本文写作时就跑在这个配置上。90% 的活儿成本降到 opus-5 单飞的 1/4 以下，需要时仍能摸到天花板。

质量档：OPUS=claude-opus-5、SONNET=claude-sonnet-5、HAIKU=glm-5.3-flash。适合发布周、复杂重构这类不想省的时段。

## 周预算 $75 怎么花

固定每周 75 美元额度、每天几小时正常开发的场景，按官方价估算三档打法：

| 打法                                              | 周成本（估）  | 说明                                                                       |
| ------------------------------------------------- | ------------- | -------------------------------------------------------------------------- |
| A：glm-5.3 主力 + flash 打杂                      | ~$60-70       | 压线。主力会话控制在每天 25M 缓存读（≈$6.5/天）以内，子代理/摘要全给 flash |
| B：flash 主力 + 每天 1-2 次 glm-5.3 攻关键点      | ~$15-25       | 大量余量。flash 缓存读 $0.015/MTok 是 glm-5.3 的 1/17，日常编码它够用      |

三条预算纪律：

- **正常开发的主力是 glm-5.3**，不是 sonnet-5（2 倍价，能力没拉开差距），更不是 opus-5。
- **缓存读决定预算生死**。Claude Code 长会话八成以上的花费是缓存命中读取，控制单会话长度、勤开新会话，比换模型更省钱。
- **opus-5 定额配给**：每周划 $10-15（约 2-3 次硬会话），只在架构设计、疑难 bug 时 `/model` 临时切。

## 我们能做的

- 把默认配置换成均衡档，跑一周看账单再决定要不要微调——成本差异不靠感觉，靠对账。
- 子代理和后台任务固定在 glm-5.3-flash 上；只有 plan 阶段和疑难会话才上 opus-5。
- 安全审计类任务单独试 glm-5.3（CyberGym 84.5% 是它的新长板），前端重活试 glm-5.2。
- 记住两个时间点：9 月 9 日（flash 促销到期）、11 月 21 日（sol 促销到期）。

## 参考

- Ocean 网关模型列表（内部网关 `/v1/models` 实测，2026-09-01）
- Artificial Analysis 模型总榜（Intelligence Index v4.1.1，2026-09-01 查）：https://artificialanalysis.ai/models
- Z.ai 官方定价（2026-09-01 查）：https://docs.z.ai/guides/overview/pricing
- GLM-5.3-Flash 模型文档（2026-09-01 查）：https://docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash.md
- AA 的 GLM-5.3-Flash 评测页（2026-09-01 查）：https://artificialanalysis.ai/models/glm-5-3-flash
- OpenRouter τ²-Bench Airline 榜（2026-09-01 查）：https://openrouter.ai/benchmarks/tau2-bench-airline
- OpenRouter 用量榜（2026-08-31 数据）：https://openrouter.ai/rankings
- Claude API 定价（2026-09-01 查）：https://platform.claude.com/docs
- OpenAI API 定价（2026-09-01 查）：https://developers.openai.com/api/docs/pricing
- SWE-bench 官网（表格 JS 渲染，本轮未取到数据）：https://www.swebench.com
- Aider polyglot 榜（收录停留在上一代模型）：https://aider.chat/docs/leaderboards/
