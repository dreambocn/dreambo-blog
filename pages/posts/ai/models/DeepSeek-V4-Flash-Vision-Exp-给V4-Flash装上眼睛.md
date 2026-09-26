---
title: DeepSeek-V4-Flash-Vision-Exp-给V4-Flash装上眼睛
date: 2026-09-09
updated: 2026-09-09
categories:
  - AI
  - 模型与动态
tags:
  - DeepSeek
  - 多模态
---
# DeepSeek-V4-Flash-Vision-Exp：给 V4-Flash 装上眼睛，但还不是视觉模型终局

DeepSeek 在 2026 年 8 月 21 日上线了 `DeepSeek-V4-Flash-Vision-Exp`。先纠正一个容易传错的名字：官方型号里没有 `V4.1`，正式名称是 **V4-Flash-Vision-Exp**。

它不是从头训练的一款全新旗舰，而是在 V4-Flash 架构上加入视觉模块、继续训练得到的实验版。更准确的理解是：**原来的 V4-Flash 负责文本、推理和 Agent，现在它可以同时看图了。**

我的判断是：这是一个很有价值的低价视觉 Agent 底座，但目前更适合拿来做工作流和产品验证，不适合仅凭官方榜单就宣布它已经全面追平 Claude、Gemini 或 GPT 的视觉能力。

## 一、它到底新增了什么

官方 API 目前支持：

- 图片描述
- 截图文字识别
- 图表分析
- 图文混合输入
- Tool Calls
- Chat Completions、Anthropic Messages、Responses 三种接口
- Base64、公开 URL、Files API 三种传图方式

图片格式支持 JPEG、PNG、GIF 和 WebP。单张图片最多折算为 384 个 token，单请求最多 600 张图片；外部 URL 单图上限 32 MiB，使用 Files API 的 `file_id` 时单图上限提高到 64 MiB。

它还保留了 V4-Flash 的 1M 上下文和最高 384K 输出长度。对于 Agent 来说，这个组合比“单独调用一个图片问答模型”更重要：模型可以先看截图，再调用工具，再根据工具结果继续操作。

官方给出的定位也很清楚：纯文本 Agent 任务与 `DeepSeek-V4-Flash-0731` 基本相当，需要视觉理解的 Agent 任务则显著提升。

## 二、和上一代 V4-Flash 差在哪里

Hugging Face 模型卡给出的对照数据如下：

| 评测 | V4-Flash-Vision-Exp | V4-Flash-0731 | 变化 |
|---|---:|---:|---:|
| Terminal-Bench 2.1 | 83.9 | 82.7 | +1.2 |
| NL2Repo | 57.7 | 54.2 | +3.5 |
| DeepSWE | 59.3 | 54.4 | +4.9 |
| Toolathlon-Verified | 75.9 | 70.3 | +5.6 |
| ApexBench | 36.5 | 26.2* | +10.3 |
| Agents' Last Exam | 27.3 | 25.2* | +2.1 |

\* 旧版 V4-Flash 在这两项测试里会忽略输入中的多模态元素，所以这不是完全公平的“纯视觉模型对纯视觉模型”比较，而是“能看图的 Agent”和“看不见图的 Agent”之间的能力差异。

这张表真正说明的是两件事：

第一，视觉能力没有明显牺牲文本 Agent 能力。Terminal-Bench、NL2Repo、DeepSWE 和工具调用测试甚至都有上涨，但这些涨幅不能简单归因于“加了视觉模块”，因为实验版同时包含继续训练和模型版本变化。

第二，视觉带来的价值主要出现在 Agent 能够看到环境的任务里。网页截图、图表、设计稿、终端界面、操作结果这些输入，过去的 V4-Flash 只能根据文字描述工作，现在可以直接读图。

## 三、官方成绩有多接近顶级模型

官方模型卡把它和 Claude Opus 4.8 放在一起比较：

| 评测 | V4-Flash-Vision-Exp | Claude Opus 4.8 |
|---|---:|---:|
| ApexBench | 36.5 | 39.4 |
| Agents' Last Exam | 27.3 | 25.7 |
| Chartography | 64.3 | 65.0 |
| ZeroBench | 35.0 | 34.0 |

从这四项看，它已经不是“只能识别猫狗”的早期视觉模型：在特定多模态 Agent 评测上确实接近，甚至超过了 Opus 4.8。

但这里有三个不能忽略的前提：

1. 这些数字来自 DeepSeek 自己的模型卡，不是统一第三方实验室的盲测。
2. 文本 Agent 评测使用了 DeepSeek Harness，框架、推理档位和 temperature 都会影响成绩。
3. 只有四个多模态指标，不能外推成“所有视觉任务都接近 Opus”。OCR 小字、复杂图表、空间关系、长截图和 UI 操作可靠性，仍然需要单独测。

所以，比较稳妥的说法是：**它在公开的几项多模态 Agent 评测上已经进入顶级模型附近，但还不能据此得出全面视觉能力相当的结论。**

## 四、和其他多模态模型怎么选

### Claude：高难度视觉 Agent 的质量标杆

Claude 当前的模型线全部支持图片输入、工具调用和文本输出。以官方定价页列出的 Opus 5 为例，输入是 5 美元/百万 token，输出是 25 美元/百万 token；Sonnet 5 是 2/10 美元，Haiku 4.5 是 1/5 美元。

Claude 的优势是复杂任务的稳定性、长链路 Agent 行为、图文混合理解和成熟的开发者生态。代价是价格明显更高，尤其是输出 token；而且 Claude 4.7 及之后的 tokenizer 对同一段文本大约会产生 30% 更多 token，不能只看标价。

### Gemini：长上下文和多媒体输入更完整

Gemini 的产品路线长期围绕原生多模态、长上下文和多种媒体类型展开。需要处理视频、音频、超长文档或 Google 生态数据时，它通常更自然。

它的问题不是“能不能看图”，而是不同模型、不同 API 端点、不同地区和不同限额的价格与能力差异较多。做成本对比时，必须固定具体模型和具体接口，不能用“Gemini Flash”四个字概括全部产品。

### GPT：综合能力和产品集成更成熟

GPT 系模型的图像输入、结构化输出、工具调用和应用生态较完整，适合把视觉理解接入已有业务系统。它的优势更多体现在整体产品能力、工具生态和服务稳定性，而不只是某一张图答得准不准。

不足是价格通常高于 DeepSeek 的 Flash 档，且不同模型对视觉输入的 token 计费规则、图片分辨率和长上下文价格档位不同，实际账单需要按工作负载计算。

### DeepSeek：低价、开放、适合批量 Agent

DeepSeek 的优势很集中：

- API 价格低
- 保留 1M 上下文
- 支持 OpenAI 兼容格式，也支持 Anthropic 和 Responses 接口
- 模型权重以 MIT License 发布
- 可以把视觉输入和工具调用放在同一个 Agent 循环里
- 账号并发限制与 V4-Flash 相同，官方文档列为 2500

它的短板也同样明确：

- 型号名带 `Exp`，实验性质意味着接口、行为和服务质量仍可能变化
- 官方公开对比多，独立、统一、可复现的第三方视觉评测还不够多
- 视觉 token 上限低并不代表视觉理解一定弱，但复杂大图、细小文字和高精度版面任务要实测
- 本地部署门槛不低，模型卡给出的 vLLM 示例是单个 4×GB300 节点，不能把“开放权重”理解成普通消费级显卡可以直接跑
- 图片只允许出现在 user 消息里，system 或 assistant 消息带图片会返回 400

## 五、真正便宜到什么程度

截至 2026 年 9 月 9 日，DeepSeek 官方价格页列出的 `deepseek-v4-flash-vision-exp` 与 V4-Flash 相同：

| 时段 | 输入，缓存命中 | 输入，缓存未命中 | 输出 |
|---|---:|---:|---:|
| 空闲时段 | 0.05 元/百万 token | 1.5 元/百万 token | 4.5 元/百万 token |
| 高峰时段 | 0.10 元/百万 token | 3 元/百万 token | 9 元/百万 token |

高峰时段是北京时间周一至周五 9:00-12:00、14:00-18:00，其余时间是空闲时段。图片会按照尺寸换算成 token，最多 384 token，并与文本 token 一起计费。

这里最容易被忽略的是：**图片便宜，不等于每次请求只花一点钱。** 如果一个 Agent 反复上传大截图、输出很长的思考过程、又没有命中缓存，成本仍然会累积。真正应该算的是完整任务的输入、图片 token、输出和重复上下文，而不是只看“每张图片最多 384 token”。

### DeepSeek 的“降价活动”该怎么理解

这次 V4-Flash-Vision-Exp 上线时，官方并没有公布一个独立的“视觉模型限时折扣”。它的价格是直接沿用 V4-Flash 的低价表，空闲时段再按峰值价格的一半计费。

DeepSeek 过去的降价更像是随模型和推理架构升级一起发生的价格政策调整，而不是电商式的充值返现活动：

- 2025 年 8 月 V3.1 发布时，官方宣布执行新版价格表，并取消夜间时段优惠。
- 2025 年 9 月 V3.2-Exp 发布时，官方称 API 成本降低 50% 以上，并同步下调 API 价格。
- 2026 年 4 月 V4 预览版开始，V4-Pro 和 V4-Flash 统一提供 1M 上下文，并形成新的 Pro/Flash 分层。
- 2026 年 8 月 V4-Flash-Vision-Exp 上线时，视觉模型直接采用 V4-Flash 价格，图片 token 另行计费。

因此，本文不把第三方平台的“充值赠送”“中转站折扣”或搜索结果里的“限时优惠”算作 DeepSeek 官方活动。使用前仍应以官方价格页和账户实际结算为准，官方也明确保留调整价格的权利。

## 六、它最适合什么工作

我认为它最适合下面几类任务：

1. **视觉编码 Agent**：读取网页截图、终端截图、设计稿和报错截图，再调用工具改代码。
2. **批量图片理解**：商品图、表格、票据、图表、巡检图片的初筛和结构化抽取。
3. **低成本多模态工作流**：客服、运营、内容审核、资料归档和内部知识库预处理。
4. **长上下文图文任务**：把多轮文本、图片和工具结果放在同一个上下文里处理。
5. **本地或私有化评估**：需要权重可见、便于研究和二次部署的团队。

它不适合作为以下场景的默认唯一模型：

- 需要法律、医疗或财务级别高可靠判断的视觉任务
- 需要像素级 UI 还原、微小文字零误读的生产流程
- 需要实时视频、音频和图像统一处理的多媒体系统
- 尚未建立回归集，却要直接替换现有顶级视觉模型的关键链路

## 我们能做的

如果要认真评估，而不是被榜单带着走，可以用一套很小但有区分度的测试集：

- 纯文本 Agent：代码修复、终端操作、工具调用
- 截图理解：真实终端、浏览器和 IDE，不用纯色图或简单猫图
- OCR：小字号、密集表格、混合中英文数字
- 空间关系：上下左右、数量、相对位置和跨图比较
- 图表：趋势、异常点、单位和图例
- Agent 闭环：看图、采取动作、读取结果、继续判断
- 稳定性：同一输入重复 10 次，记录成功率、耗时和输出长度
- 成本：把图片 token、缓存命中、输出 token 一起记账

最后的选择可以很简单：

- 要最低成本和大规模调用，先试 V4-Flash-Vision-Exp。
- 要复杂视觉 Agent 的稳定上限，用 Claude 或 GPT 做对照。
- 要长视频、音频或 Google 生态集成，把 Gemini 放进候选。
- 要私有化和可研究性，优先看 DeepSeek 的开放权重，但先核算显存和推理栈。

DeepSeek 这次真正做成的，不是“世界第一视觉模型”，而是把视觉能力放进了一个便宜、长上下文、能调用工具的 Agent 底座里。对开发者来说，这个变化的意义可能比榜单上多几分更大：**以前很多工作流因为看不见而无法自动化，现在终于可以用低成本开始做了。**

## 参考

- DeepSeek 官方发布：V4-Flash-Vision-Exp 上线，2026-08-21：https://api-docs.deepseek.com/zh-cn/news/news260821
- DeepSeek API 模型与价格：https://api-docs.deepseek.com/zh-cn/quick_start/pricing
- DeepSeek API 图像理解指南：https://api-docs.deepseek.com/zh-cn/guides/vision
- DeepSeek API Token 用量计算：https://api-docs.deepseek.com/zh-cn/quick_start/token_usage
- DeepSeek API 限速与隔离：https://api-docs.deepseek.com/zh-cn/quick_start/rate_limit
- DeepSeek-V4-Flash-Vision-Exp 模型卡：https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- DeepSeek V4 预览版，2026-04-24：https://api-docs.deepseek.com/zh-cn/news/news260424
- DeepSeek V3.2-Exp 降价说明，2025-09-29：https://api-docs.deepseek.com/zh-cn/news/news250929
- DeepSeek V3.1 价格调整说明，2025-08-21：https://api-docs.deepseek.com/zh-cn/news/news250821
- Anthropic Claude 模型与价格：https://platform.claude.com/docs/en/about-claude/pricing
- Google Gemini API 定价：https://ai.google.dev/gemini-api/docs/pricing
- OpenAI API 定价：https://developers.openai.com/api/docs/pricing
