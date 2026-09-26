---
title: LangChain-删掉自己的系统提示词
date: 2026-08-20
updated: 2026-08-20
categories:
  - AI
  - 工具与框架
tags:
  - LangChain
  - 提示词
---
# LangChain 把自己的系统提示词删空了

Deep Agents v0.7，7 月 24 日发的，8 月一路补到 v0.7.7。改动是三件减法：内置系统提示词删空，
工具描述砍掉 43%，默认挂的 todo list 摘掉。一次默认对话的输入 token 从 5,395 掉到 1,895，降 65%。

数字好看，但照着"提示词越短越好"去抄会抄错。真正的动作在于那些提示词里的内容并没有消失，
只是换了地方放。

下面的数字我都对过官方博客、changelog 和四个 PR，包括对他们自己不太好看的那部分。

## 删了什么

官方把改动归成三条：

内置的 base system prompt 删掉（#4859）。Deep Agents 以前在你看不见的地方塞了一段通用指引，
教模型怎么干活、怎么用工具。现在这段没了，博客的说法是 "The authored base prompt starts empty"。

内置工具的描述精简 43%（#5009）。

`TodoListMiddleware` 不再默认挂载（#4929）。`create_deep_agent` 以前默认配一套 todo 规划，
现在要自己传 `middleware=[TodoListMiddleware()]`。

## 那段提示词去哪了

博客里有一句话是整件事的钥匙：

> "The authored base prompt starts empty and tool-usage prose that duplicated tool schemas
> has been trimmed."

被删的是"和工具 schema **重复**的"那部分讲工具怎么用的散文。不是啰嗦的散文，不是没用的散文，
是重复的散文。

没重复的那部分没删，挪到工具自己的返回值里去了。证据在同一个版本的 changelog，
v0.7 顺手改了一整套文件系统工具的行为：

- `write_file` 遇到文件已存在，从报错改成直接覆盖
- `read_file` 分页读时主动报告总行数、剩余行数、下一个 offset
- `grep` / `glob` 结果太多时返回部分结果加一个截断标记，`grep` 还加了 1,000 条匹配上限和可选上下文行
- 空结果的返回值从 `[]` 改成 `"No files found"`

四条单看都很琐碎，并排看就是同一件事：让工具自己把状态说清楚。

以前要在提示词里写"如果文件已存在你会收到报错，这时候你应该……"，现在不用写，
因为工具直接覆盖，那个分支不存在了。以前要写"结果可能被截断，你需要判断还有没有更多内容，
有就用 offset 继续读"，现在也不用，因为返回值里就摆着总行数、剩余行数和 next offset。
空结果返回 `[]` 时模型得猜这是没找到还是出错了，现在直接告诉它 No files found。

同一个信息原来在提示词里说一遍、在工具契约里说一遍，v0.7 做的是让它只说一遍，
说在离模型最近的地方。

能抄的是这个判断：每一句写在系统提示词里教模型用工具的话，先问它能不能改成工具返回值的一部分。
能改就改。提示词是每一轮都要付费的常驻成本，工具返回值只在真用到时才付费。

## todo list 被摘掉

"让 agent 先列个 todo 再干活"这个做法过去一年基本被当成常识，写进各家框架、各家 skill、
无数篇最佳实践。LangChain 跑了个 A/B 然后把它摘了。

PR #4929 里的原话：

> "Results showed no statistically significant accuracy improvement on any model,
> while token usage increased on two of three models."

三个模型的结果：

| 模型 | 不带 todos | 带 todos 的成本 |
|---|---|---|
| GPT-5.6 Terra | 高 7.8 个百分点 | 贵 23.8% |
| Claude Opus 4.8 | 无显著差异 | 略便宜，但指标更差 |
| GLM 5.2 | 高 2.0 个百分点 | 基本持平 |

三个模型都没测出准确率提升，两个模型 token 还涨了，其中一个不带 todo 反而好了 7.8 个百分点。

不过这不等于 todo list 没用。我第一版整理素材时写的就是"被 eval 证明没用"，是错的。
同一个 PR 里还有一条：OpenAI Codex 那个 profile 自己又把 `TodoListMiddleware` 通过
`extra_middleware` 加回去了，因为 Codex 的系统提示词里明确指示模型要用 `write_todos` 做对账。

所以 todo list 更像一个契约而不是一个能力。上层有人依赖它——比如提示词里写死了要用它对账——
它就是必需的，摘掉会直接坏。没人依赖、只是默认挂着以防万一，它就是每轮都在收费的成本。
同一个中间件在两种情况下价值完全相反，区别不在中间件，在有没有人真的依赖它。

这个判断可以搬到我们自己的 skill 和 rules 上：每一条常驻在上下文里的规则，
能不能指出谁在依赖它。指得出来就留着。

## 那份 eval 到底说了什么

我昨天在整理稿里写的是"在重做过的 eval 套件上无质量回退"。这句太干净了，博客写的是这样：

四个模型（`gpt-5.6-luna`、`gemini-3.6-flash`、`claude-sonnet-4-6`、`claude-opus-4-8`），
三类 benchmark。`gpt-5.6-luna` 最漂亮，token -34%、成本 -15%、reward +4%。
`claude-sonnet-4-6` 的成本反而上涨了，被两个特别难的自主任务拉高。
所有模型的 reward 置信区间都跨 0，只有 Luna 和 Opus 的 token 下降是统计显著的。

reward 置信区间跨 0 的意思是没有证据说效果变好，也没有证据说变坏。所以准确的结论是
花的钱少了，效果看不出变化。

这已经是个很好的结果，同样的活 token 少 65%，效果测不出差别，谁不换。但它和"降本增效"
不是一回事，和"无质量回退"也不完全一样——"无回退"暗示了一个已被证实的结论，
而实际情况是这个结论的置信区间跨了 0。

sonnet 那条成本上涨也不该被抹掉。它说明这套减法不是对所有模型都均匀生效，
删掉的那些脚手架对某些模型在某些难任务上可能真的有用。

还有个细节。博客里给了三种 todos 仍然有益的场景：长的多轮任务、能力较弱的模型、
需要展示可见进度的 UI 场景。但他们自己的 PR #4929 里写的是没有证据表明 todos 在特定场景有帮助，
只测出它普遍不提升准确率还涨成本。博客比自己的 PR 给了更多台阶。这不算什么问题，
博客本来要照顾迁移的用户情绪，但它说明读一手源得读到 PR 那一层。

## 和 doc-budgets 那条放在一起看

前段时间拆 DeepSeek Harness 的时候记了一条做法。`scripts/doc-budgets.manifest.json`
给常驻文档定了字数上限：

```json
{
  "docs/AGENTS.md": 1320,
  "docs/architecture.md": 2400,
  "docs/cordis-primer.md": 600,
  "docs/testing.md": 1150
}
```

配套的 `verify-doc-budgets.ts` 头注释写着上限只准往下棘轮，还得留 5% 余量，
想往上调必须按 `docs/AGENTS.md` 里定义的流程给出理由。这是个 CI 门禁，文档写胖了合不进去。

理由是 AGENTS.md 这类文件每开一次会话都要进上下文，它胖一点，你就按 token 按次多交一次税。

两支互不相干的团队，一个用 CI 卡文档字数，一个用 eval 卡提示词，卡的是同一件事：
每轮都要进上下文的东西，体积得有人负责。

这两种管法互补，不是二选一。CI 门禁管的是别悄悄变胖，便宜、每次 push 都跑、不用跑模型。
eval 管的是这段到底有没有用，贵、慢，但只有它能回答删掉会不会变差。先上门禁守住体积，
再用 eval 决定哪块能砍。

## 我们能做的

我们每次会话都在往上下文里塞东西：全局 `CLAUDE.md`、`RTK.md`、`rules/` 下那一堆规范、
每个 skill 的 `SKILL.md`。全是常驻成本，而且从来没量过。

先量基线。不知道现在多少 token，后面所有讨论都是空的。把每次会话实际注入的那几个文件
加起来数一遍，五分钟的事。

然后找重复。照 LangChain 那个思路，把规范里教 AI 怎么用工具的段落挑出来，
一条条问能不能改成工具返回值的一部分。

我们的 skill 里有不少这类内容。比如 RTK 那几条守则——看到 `+N more` 就不许下全量结论、
禁止用 `rtk json` 分析数据——现在是写在规范里靠 AI 自觉遵守的。它们完全可以做成工具行为：
截断时返回值里带一个显式的 `truncated: true` 和回捞命令，而不是靠一段提示词提醒 AI 去看提示。
前者是每轮都交的税，后者只在真截断时才付费，而且靠契约不靠自觉。

最后清"以防万一"。每一条常驻规则问一句谁在依赖它，答不出具体依赖方的，
就是我们的 TodoListMiddleware。

有件事得说清楚：LangChain 敢删是因为他们有 eval 套件。删之前他们能在四个模型、
三类 benchmark 上跑对照，能算出置信区间，能发现 sonnet 的成本反而涨了。所以他们删得起，
删错了数据会告诉他们。

我们没有这套东西。照着这篇去删自己的 `CLAUDE.md`，删完感觉"好像也没变差"，这不叫验证。
真要动，顺序是先量，再攒一个最小的 eval（哪怕就十个最典型的真实任务，能跑、能重复、能比较），
然后才删，一次一块。暂时没能力评估哪块该删的，可以先立个上限防止它继续变胖，
doc-budgets 就是现成的抄法，这一步几乎零成本。

## 参考

- 官方博客：https://www.langchain.com/blog/deep-agents-v0-7
- changelog（v0.7.0，2026-07-24）：https://docs.langchain.com/oss/python/releases/changelog
- releases（v0.7.5 / 0.7.6 / 0.7.7 的 8 月补丁）：https://github.com/langchain-ai/deepagents/releases
- PR #4859 删除 base system prompt
- PR #5009 工具描述精简 43%
- PR #4929 TodoListMiddleware 改 opt-in，含三模型对照数据
- PR #4251 middleware override 成为一等公民
- DeepSeek Harness 的 doc-budgets 门禁：见 `DeepSeek-Harness-架构实测.md` 第六节第 3 条

迁移时会踩到的 breaking change：

- `TodoListMiddleware` 要从 `langchain.agents.middleware` 引入，不再从 `deepagents` 引
- v0.5 就标废弃的 backend factories 彻底移除，改传具体的 `BackendProtocol` 实例
- `StoreBackend` 要显式给 `namespace`
- `delete` 工具进了默认文件系统工具集，可以用 allowlist 关掉
- 解析返回值的代码要改，空结果从 `[]` 变成 `"No files found"`
