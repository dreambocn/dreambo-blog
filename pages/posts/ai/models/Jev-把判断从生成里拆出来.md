---
title: Jev-把判断从生成里拆出来
date: 2026-09-20
updated: 2026-09-20
categories:
  - AI
  - 模型与动态
tags:
  - AI
  - 模型
---
# Jev：把判断从生成里拆出来

2026 年 9 月 15 日，一家叫 TypeSafe AI 的旧金山公司走出隐身状态，带着 4000 万美元种子轮和第一个产品 Jev。创始人 Diogo Almeida 是前 OpenAI 研究员，参与过 RLHF、InstructGPT、ChatGPT 和 GPT-4——把语言模型「教听话」的那套方法，他是最早的一批实践者。

Jev 做的事一句话能说完：**不聊天、不写代码、不生成任何文字，只做判断。** 输入一段非结构化内容和一组预先定义好的问题，一次调用返回每个问题的答案，附带校准过的概率。

发布两天，官方视频在 X 上拿了 3600 万播放，社区出现至少六个开源复刻，多数选择拿千问（Qwen）系列模型微调。这篇文章把 Jev 是什么、为什么快、能干什么、干不了什么、复刻走到了哪，以及它到底是不是一个新品类，一次讲清。事实部分均截至 2026-09-20。

## 一、它是什么：一个不做聊天的模型

TypeSafe 给 Jev 起的品类名叫 System One model，取自卡尼曼《快思慢想》：系统一是快速、直觉、秒回的判断；系统二是缓慢、串行、推理的思考。Jev 对标前者，把后者继续留给 LLM。模型名本身则来自经济学家 William Stanley Jevons——杰文斯悖论的主角：蒸汽机效率提升后，煤的消耗不降反升。TypeSafe 的类比是，智能成本每降一个数量级，用例会涨几个数量级。

它的接口形态和 LLM 完全不同。调用前唯一的准备工作是用 JSON 声明问题及类型，只有三种原语：

- **Choice**：从最多 255 个预定义选项里选一个；
- **Score**：在你给定的量表上打分；
- **Noul**：输出一个校准的是/否概率（boolean 的谐音变体）。

然后 POST 到 `/v1/systemone`，传入任意非结构化状态——一封邮件、一条工单、一段爬来的网页——模型对每个问题独立求值，返回类型化答案加概率分布。比如一封客服投诉邮件，可以同时问「该哪个部门处理」（Choice）、「紧急程度多少分」（Score）、「是否有退款风险」（Noul）、「是否需要人工介入」（Noul），四个判断一次并行出齐。

和让 LLM 干同样的事对比一下差别就清楚了：LLM 也能判断，但它要一个 token 一个 token 地生成，你要祈祷它别突然写一段散文，还要解析它吐出来的 JSON，解析挂了要重试。Jev 没有字符串输出，没有东西需要解析，类型错误率为 0%——因为答案只能落在你预先定义的类型空间里，想跑题都没有跑道。

TypeSafe 官方对 Jev 的定位也说得很克制：不是智能体，是 sidecar（辅助模块）。LLM 负责理解人类混乱的请求，Jev 负责后面成千上万次的路由、审核、打分、风控。

## 二、为什么快、为什么便宜

快和便宜都来自同一个机械事实：**输出空间固定且预先枚举，所以不需要解码循环。**

自回归 LLM 的延迟大头在 decode——生成每个 token 都要把整个网络跑一遍，且严格串行，GPU 访存带宽成为瓶颈，哪怕只输出几行 JSON 也要几百毫秒到几秒。Jev 的输出空间在你定义问题时就封死了，一次前向传播就能算出所有候选答案的概率分布，prefill 完直接读分布，没有逐步采样。

账面上的数字（官方口径，jev-1.13.0，64k 上下文）：

- 延迟 70–500ms，多数调用约 100ms。官方演示里同一道判断 Jev 0.114 秒，GPT-5.6 Terra 8.566 秒；
- 输入 $0.042/百万 token（每十亿 $42），比 Claude Fable 5.1 的输入价低约 238 倍；**输出免费**——没有 decode loop 就没有输出 token 可计价，这个定价本身就是架构的注脚；
- 官方宣称在同类任务上智能水平接近现有 LLM，同时快两个数量级、便宜两个数量级。

另一半故事在训练方法上。TypeSafe 称之为 RLCD（Reinforcement Learning for Calibrated Decisions）：RLHF 优化的是人类评分员偏好，RLVR 优化的是程序可验证的正确性，RLCD 优化的是**认知上诚实的概率**——模型输出 0.7，意味着同类判断里约七成真的正确。

校准是把模型接进生产系统的关键。校准过的置信度可以直接写进业务策略：≥98% 置信自动执行，中间地带进人工复核队列，低置信直接丢弃或升级。没有校准，置信度就只是个分数，你不敢让软件按它自动动作。

## 三、它能干什么

按官方文档和早期集成方（LangChain 已发布 experimental 中间件）给出的落地场景，全部围绕「高频、有界、答案可枚举」的判断：

**工单路由与客服分流。** 一封邮件同时判断分派部门、紧急程度、退款风险、是否需要人工，高置信直接自动处理。这是官方快速开始里的第一个例子。

**内容过滤与推荐预筛。** 实时折叠信息流里的引战和广告，或给上万条爬取内容做相关性预筛，只把精筛留给贵模型。判断密集、单次价值低、量大管饱——正是这类模型的主场。

**模型路由。** Agent 系统里最实际的用法：Jev 先判断一个请求该走便宜模型还是强模型，再转发。LangChain 的 ModelRouterMiddleware 已经把这套逻辑做成了中间件，criteria 由开发者定义，「选能完成任务的最便宜模型」。

**风控与执行策略。** 官方文档给了很直白的例子：置信度过了 98% 阈值才自动削减敞口或撤单。判断密集但答案空间有界的地方都能套——甚至有人拿 pari-mutuel 赔率市场做实验，赛马 18 个跑者、赛艇 6 条艇，正好落在 Choice 255 选项的射程内。

官方文档对使用方式的建议也很能说明这个模型的性格：高置信直接执行、中间复核、低置信交人。三档阈值该划在哪，随错误代价伸缩。

## 四、它干不了什么

边界同样清晰，而且都是结构性的，不是迭代几版能补的：

- **不能产生任何文字。** 聊天、写代码、写解释、开放生成，零能力。它不写 schema 给你，问题空间要你自己定义；
- **只接受文本输入。** 截至 9 月 20 日只支持字符串、JSON 和文本数组，看不了图；
- **准确率并不比前沿 LLM 高。** 在 TypeSafe 自家的 4-workflow 基准上约 68%，接近中档 LLM（如 GPT-5.6 Terra）。它卖的不是更准，是同等的准、快两个数量级、便宜两个数量级；
- **评测目前全是自家内部基准。** 还没有可复现的公开第三方基准，准确率和校准质量的声明都建立在 TypeSafe 自己的 eval 上。

另外要泼一盆冷水：知乎上的批评并不客气——这玩意儿「充其量是智能体系统里的 if-else 子模块」，用非自回归的有界判断换速度和成本；而且 Jev 本质仍是 Transformer，Transformer 该有的缺点它都有。这个批评在「能不能叫新品类」上是成立的质疑，但在「有没有用」上并不构成否定——if-else 子模块如果能便宜一百倍地做掉路由和预筛，它就是有用的。

## 五、社区复刻：微调千问的六个分身

Jev 发布两天内出现的开源复刻，几乎全部选择了同一条路：拿 Qwen 系列做底座，改造输出层为单次前向出分布，不解码生成文本。这也是「通过微调千问来模仿相同想法」的主要玩法：

| 项目 | 做法 | 结果 |
| --- | --- | --- |
| Bespoke Nimble | Qwen3.5-9B LoRA 微调，对比式合成数据 + 约束解码 | 自建评测上把底座 66% 拉到 90%，Jev 为 93%；H100 上约 100ms，可本地跑 |
| kev | Qwen2.5-0.5B~8B + LoRA + 读出头，单次 prefill 并行答题 | MacBook 可训可跑，附完整受控实验 |
| decider | Qwen3.5-2B 微调，单次出带校准概率的类型化决策 | 复现 System One 输出形态 |
| NanoJev | 0.6B 并行决策模型，直接返回完整概率分布 | 训练管线、权重、数据集全开源 |
| SemIf（原 OpenJev） | Qwen3.5 4B/35B 底座 + 末 token 上的小 NLI 分类头 | 开源替代路线 |
| LitJev | 零训练：提示工程让任意 Qwen 直接服务 /v1/systemone 同款 schema | 证明形态可以「装」出来 |

其中 jaredpalmer 的 kev 项目最有信息量，因为它做的不只是复刻，还有受控实验（记录级聚类配对 bootstrap，多种子重复，全量日志公开）：

- **容量主导域外效果。** 公开样本和合成数据预算持平时，0.6B→4B 提升 14–19 个百分点，4B→8B 只再涨 1.5–2 个百分点；
- **微调会侵蚀底座知识。** 微调后的 Qwen 在 MMLU 上 0.69–0.75，Jev 是 0.90；差距集中在知识型问题、复述识别（PAWS）、噪声标签情绪判断和日期算术。学习率压到 5e-5 也止不住流失；
- **域外整体落后 Jev 8–10 个百分点**（4B/8B 档），0.6B 档落后 26 个百分点。

这张全景图给出的结论比较一致：**输出形态和速度容易复刻，概率校准和域外泛化才是 Jev 的护城河。** LitJev 尤其说明问题——不改权重也能让 Qwen「装出」System One 的接口形状，但装不出校准。Bespoke Nimble 的 90% 对 93% 看着只差 3 个点，但那是发布方自己策划的评测；kev 的域外实验显示，离开策展数据后差距是两位数。

有意思的是，连 Jev 本身的校准也不是完美的。独立测试项目 jev-ood-calibration 用 900 条规则生成的、Jev 不可能见过的工单做域外校准检验：Choice 和 Score 偏自信，Boolean（Noul）偏不自信，全套原始响应和 ECE 计算全部公开。这说明这个品类的校准能力仍在早期，不是已经 solved 的问题。

## 六、讨论：if-else 子模块，还是判断的 primitives

把争论两边都摆开，再谈前景。

**怀疑方的论点**：这就是个便宜的分类器加了个好接口。答案空间要预先有界，等于每个场景都要人先想清楚 schema；准确率不超过前沿 LLM 直接作答；Transformer 的毛病一个没少。按这个看法，Jev 是「用工程换钱」的中间件生意，不是模型品类创新。

**支持方的论点**更有意思，值得展开：

生成已经通用化了——一个模型什么都能写。但判断为什么还锁在生成里？想让 LLM 给个 yes/no，你得付出整条自回归管线的延迟和成本，还要防它写散文、防 JSON 解析挂掉。Jev 的赌注是：**判断可以从生成里拆出来，做成一个类型安全、概率校准、软件敢直接消费的原语（primitive）。** 就像函数调用不需要模型「解释」自己为什么这么调，高频决策也不需要模型「说明理由」。

这个视角下最有想象力的推演来自社区：如果这类模型成熟，工具调用、路由、MCP 式决策可能从生成式小模型手里被夺回，还给判别式模型——判别式天然更快、更便宜、更可测；更进一步的版本是把它做成**近零边际成本的端侧判断层**，通知分诊、UI 适配、传感器触发的实时决策，全部本地完成，不上云、不花推理费。

而 TypeSafe 自己给的前景框架是杰文斯悖论：判断的成本降两个数量级之后，现在因为太贵而不值得自动化的决策——每条通知要不要打断你、每封邮件要不要进收件箱主列表、每个请求要不要走强模型——会整体涌现出来变成市场。煤的故事是效率越高烧得越多；判断的故事可能是越便宜用得越稠密。

冷静地落一下地：这个品类能不能立住，看的不是发布视频的播放量，而是两件事——**校准质量能不能经得起域外的持续检验**（连 Jev 自己都在偏自信），以及**软件工程师会不会真的把它嵌进生产链路**（而不是只出现在 demo 里）。目前 OpenRouter 已上架 typesafe/jev-1.13，Vercel AI Gateway 提供免排队托管，LangChain 出了中间件，接入摩擦已经很低。剩下的问题只有一个：你的系统里，有多少判断其实是被 LLM 的价格逼着交给人做的。

## 参考

- TypeSafe AI 官方公告：https://typesafe.ai/blog/introducing-system-one-models-and-jev
- TypeSafe 文档 System One 概念页：https://docs.typesafe.ai/concepts/system-one
- LangChain：What Is Jev? A Guide to TypeSafe AI's System One Model：https://www.langchain.com/blog/building-a-harness-with-jev
- DataCamp：Jev: TypeSafe's System One Model That Never Hallucinates：https://www.datacamp.com/blog/system-one-models-jev
- explainx：How Does Jev Work? RLCD & Parallel Inference Explained：https://www.explainx.ai/blog/how-does-jev-work-rlcd-system-one-model-explained-2026
- flaviocopes：A deep dive into Jev, TypeSafe's System One model：https://flaviocopes.com/jev/
- MarkTechPost：TypeSafe AI Releases Jev：https://www.marktechpost.com/2026/09/19/typesafe-ai-releases-jev/
- 动区动趋：爆紅的 Jev 模型是什麼？OpenAI 元老打造只做決策的 AI：https://www.blocktempo.com/jev-typesafe-ai-openai-system-one-model-diogo-almeida-explained/
- 知乎：如何看待前 OpenAI 研究员发布的新模型「Jev」：https://www.zhihu.com/question/2083549123160925836
- Latent.Space：Here are 6 Clones of Jev in 2 days：https://www.latent.space/p/ainews-here-are-6-clones-of-jev-in
- GitHub：jaredpalmer/kev：https://github.com/jaredpalmer/kev
- GitHub：awesome-jev 复刻项目清单：https://github.com/yibie/awesome-jev
