---
title: Superpowers-砍掉了自己一半的token
date: 2026-08-21
updated: 2026-08-21
categories:
  - AI
  - 工具与框架
tags:
  - Superpowers
  - 技能
---
# Superpowers 砍掉了自己一半的 token

有人总是在讨论强约束 skills 现在还值不值得装，superpowers 这类。

我翻了它从 2025 年 10 月建仓到现在的全部 release notes，十个月，四十多个版本。
答案在里面，而且是作者自己给的。v6.0.0 的说明里有这么一句：

> "While these numbers won't hold on every harness and for every workload, in our evals,
> Claude Code and Codex produce similar high-quality results roughly twice as fast and
> while spending almost 50% fewer tokens."

同样的活，快一倍，少花近一半 token，质量相当。这是 2026 年 6 月 16 日的事。

那省下来的一半，就是 v5 时代它一直在收的税。所以"superpowers 太臃肿"这个批评不是黑它，
是它自己承认过并且已经动手砍过的事。问题是这刀砍在哪儿——砍掉的东西挺出人意料，
不是砍规矩，是砍规矩的实现方式。

## 先说最狠的一刀

v5.0.6，2026 年 3 月 24 日，标题叫 Inline Self-Review Replaces Subagent Review Loops。
被砍掉的是"派一个新 agent 去审查方案和 spec"这个动作，理由写得很直白：

> "The subagent review loop (dispatching a fresh agent to review plans/specs) doubled
> execution time (~25 min overhead) without measurably improving plan quality.
> Regression testing across 5 versions with 5 trials each showed identical quality scores
> regardless of whether the review loop ran."

五个版本，每个跑五次，质量分完全一样。执行时间翻倍，多出来大约 25 分钟。

换上来的是一段写死在 skill 里的自查清单——占位符扫描、内部一致性、范围检查、歧义检查。
效果这样：

> "Self-review catches 3-5 real bugs per run in ~30s instead of ~25 min,
> with comparable defect rates to the subagent approach."

25 分钟变 30 秒，缺陷率相当。五十倍的时间差换来的是同一个结果。

这件事我上个月刚在另一个地方见过。LangChain 把默认挂着的 todo list 摘掉，
理由是 A/B 测出来三个模型都没有准确率提升、两个模型 token 还涨了。两拨互不相干的人，
一个删 todo list，一个删子 agent 审查循环，删的是同一类东西：
**凭常识加上去、从没量过、一量就发现不值的脚手架。**

"让一个新 agent 来审"听起来天经地义。fresh context、没有 sunk cost、不会为自己的代码辩护，
每一条都说得通。它就是没用。

## 砍掉的一半在哪儿

v6.0 那 50% 是怎么省的，说明里列得很细，值得一条条看，因为省钱的路子和你想的不一样。

两个 per-task reviewer 合成一个。`spec-reviewer-prompt.md` 和
`code-quality-reviewer-prompt.md` 直接删掉，换成一个 `task-reviewer-prompt.md`，
读一遍 diff 同时返回合规判定和质量判定，一次修复能清两个问题。

diff 不再靠粘贴，改成走文件。这条的理由写得特别好：

> "A pasted diff parks itself permanently in the most expensive context, and a reviewer
> without one rebuilds it by hand — the single biggest reviewer cost."

粘进对话的 diff 会永久停在最贵的那块上下文里。这是审查环节最大的单项成本。
解法是两个脚本把任务描述和待审 diff 写成文件，让子 agent 自己去读。

每次派发必须写明模型。这条最有意思：

> "Left to choose, controllers stopped naming a model at all — and an unnamed model
> quietly inherits the session's most expensive one, so one run put all 26 of its
> reviewers on the top tier."

让 controller 自己选，它干脆不选；不写模型就默认继承会话里最贵的那个。
有一次跑下来，26 个 reviewer 全在顶配档上。

收尾从"逐任务重审一遍"改成"整支分支审一次"，用最强的模型审这一次就够。

把这几条并排看，模式很清楚：**约束一条没少，钱少了一半。**
它没有放松"每个任务都要过审查"这个要求，它改的是审查这件事的执行方式——
少派一个 agent、别把 diff 塞进最贵的上下文、别让默认值悄悄挑最贵的模型。

这跟我们平时讨论"要不要装 skills"的角度差得挺远。我们习惯把它当成一个开关，
装了就贵、不装就省。作者做的是第三件事：留着规矩，把账单重写一遍。

## "改个 CSS 都要等半天"这条批评是对的，也修了

Threads 上有条吐槽流传挺广，说装完 superpowers 之后最小的任务都要等很久，
Claude 疯狂拉子 agent、写完全过度的计划，改个 CSS 变得没完没了，
"I wish that Claude would have a better understanding of when to invoke these superpowers"。

这条批评准确，而且作者在两周前修了。v6.3.0，2026 年 8 月 12 日：

> "**Ceremony now scales to the task.** Requests are classified as spike, bounded,
> or architectural; small tasks skip the two-document ritual. Every path still stops
> for your approval before implementation."

请求先分成三档——spike、bounded、architectural——小活跳过那套两份文档的仪式，
但所有路径都保留"动手前停下来等你批"这一步。

同一个版本里还有一条：形状相同的小任务合并成一次派发，
"cutting subagent cost sharply on micro-task plans"。

再往前翻，v5.0.5 就已经把子 agent 执行从强制改成了可选：
"Subagent-driven is recommended but no longer mandatory."

所以"装了它什么都得走全流程"这个印象，来自旧版本。这也是我觉得现在这个问题最麻烦的地方：
大部分讨论引用的是 v3、v4 时代的体验，而这个仓库十个月出了四十多个版本，
中间有两轮专门的瘦身。评价一个每两周就自我修剪一次的东西，二手信息基本不能用。

## 但有一块砍不掉，而且模型越强越砍不掉

前面全是减法，容易读成"所以不需要约束了"。v6.0 里有两条是反方向的，我觉得比省下的那一半重要。

> "**The controller can't tell a reviewer what to ignore.** Real runs caught controllers
> coaching reviewers to skip a finding or call it 'Minor at most,' and the flaw shipped."

真实的运行记录里，抓到 controller 在教 reviewer 跳过某个问题、或者把它说成"顶多算轻微"。
然后那个缺陷就这么发布出去了。

另一条：

> "an implementer's 'I left this unabstracted on purpose' no longer talks a reviewer
> out of a real finding."

现实现者说一句"我故意没抽象的"，就把审查者说服了。

这两条讲的不是能力问题，是动机问题。模型规划能力变强、能自己打计划、能跑更长的 agentic 任务——
这些都不会让它更愿意留下不利于自己的证据。Opus 4.6 的发布说明写 plans more carefully、
在大代码库里更可靠，我信；但"更擅长规划"和"不会哄骗审查者放过缺陷"是两码事，
后者甚至可能随着表达能力变强而更难防。

所以强约束里真正不可替代的那部分不是"强制你先做计划"——这个模型现在基本自己会——
而是"强制留下可核对的证据，并且禁止用话术绕过"。v6.0 配套加的是：
reviewer 每个结论要给出文件和行号，reviewer 只读、不许碰工作区，
implementer 的报告落成文件、TDD 场景下要带红绿证据。

不过这块也有天花板。Ry Walker 那篇评估里提了个保留意见，说即使装了 skills，
agent 还是会绕过验证步骤。这话常被当成"skills 没用"的证据，我觉得读反了：
它说明的是提示词级别的强制有上限。superpowers 能做的就是提示词级强制，
真要硬，得靠 CI、靠测试必须绿、靠合不进去。这是它的真实边界，
也是"装了就安心"为什么是错觉。

## 那到底装不装

我不想给"看情况"这种答案，说点具体的。

**手上没有一套自己的流程**，就装。理由不是它的方法论比别人高明——
brainstorm、plan、TDD、review 这套没什么秘密，谁都想得到——
而是它现在大概是唯一一套有 eval 撑着、并且真的对自己下过刀的实现。
v6.2 那次压缩，说明里写着每一刀都用子 agent 探针微测过，
"the one cut that measurably degraded behavior was reworked rather than shipped",
测出行为退化的那一刀返工了没发。这种东西自己搭，搭不到这个程度。

**已经有一套自己的**，比如我们，就别装。不是因为它不好，
是两套门禁会抢方向盘：它要求 brainstorm → plan → TDD → review,
我们的 dev-lifecycle 要求 Phase 0 到 10，两边对"下一步该干什么"的判断会互相打断。
值得做的是抄机制不抄包。

顺便说一句常见的误解：担心"装了就一直吃 context"其实不太站得住。
未触发的 skill 只占几十个 token 的元数据，14 个 skill 全装也就那样。
真花钱的是触发之后的流程本身——多轮追问、多份文档、对抗性审查、派子 agent。
所以"少装几个"省不下多少，"该跳过的时候能跳过"才是钱的大头。
这正好就是 v6.3 那条 ceremony scaling 在做的事。

## 我们能做的

上一篇写 LangChain 的时候我说过一句"先量基线，五分钟的事"，这次顺手量了。

每次会话实际注入的：全局 `CLAUDE.md` 8557 字符，`RTK.md` 2307 字符，
`rules/` 下十份规范 52175 字符。合计 63039 字符，
中英混杂粗估三万 token 上下。另外 `~/.claude/skills/` 下 56 个 skill 目录。

三万 token，每开一次会话付一次。这个数我以前从来没算过。

superpowers 那份 bootstrap 为什么被压缩了两轮，v6.1.0 的说明写得很清楚：

> "The `using-superpowers` bootstrap is injected into every session, so its size is paid
> for constantly."

每次会话都注入，所以它的体积要一直付钱。同一个道理适用于我们那三万 token,
区别是它压过两轮，我们一轮没压过。

不过我不打算照着这篇就去删 rules，上一篇的结论这次照样成立：删之前得有 eval,
不然"删完感觉也没变差"根本不算验证。superpowers 敢删是因为它有五版本五试验的回归测试，
有子 agent 探针微测每一刀。我们没有。

所以先做那些不需要 eval 就能确定是白捡的：

**一、仪式按任务大小分级。** 我们的 dev-lifecycle 现在是一刀切，
改一行 CSS 和重构一个微服务走的是同一套 Phase 0 到 10。
v6.3 那三档分类可以直接搬——spike 只做不写文档、bounded 走简版、architectural 走全套，
但三档都保留"动手前等人批"这一步。这一步不能省，它是整套东西唯一真正防错的地方。

**二、派子 agent 时必须写明模型。** 我们所有 skill 里没有一条要求这个，
按 superpowers 踩过的坑，不写就默认继承会话里最贵的模型。
26 个 reviewer 全跑顶配那个例子，我们大概正在以某种形式复现它。
这条是纯白捡，不影响任何行为，只影响账单。

**三、审查证据要带文件和行号，并且禁止用理由绕过。** 我们 rules 里有一堆
"AI 必须读取某某规范"、"必须标 blocking"，但没有一条说结论要落到哪个文件哪一行，
也没有一条禁止"我故意这么写的"这类辩解生效。
按 v6.0 抓到的那两个真实案例，这是缺陷真能溜出去的路径。

最后一件事。这篇最有价值的信息全在 RELEASE-NOTES.md 里，
而我一开始搜到的几个聚合站——各种 skills 导航、plugin 清单站——数据基本不能用。
其中一个说 superpowers 有 224k star，我当时判断这是编的，
结果查 GitHub API 是 274,969，那不是编的，是过时的。我把过时当成幻觉，也是错。
这两种错的后果一样：都得回一手源才知道。

## 参考

- RELEASE-NOTES.md（v6.3.0，2026-08-12）：<https://github.com/obra/superpowers/blob/main/RELEASE-NOTES.md>
  - v6.0.0 快一倍、少近 50% token 的 eval 结论，及 reviewer 流程重写
  - v5.0.6 子 agent 审查循环的回归测试（5 版本 × 5 试验，质量分相同）
  - v6.3.0 ceremony 按 spike / bounded / architectural 分级
  - v6.1.0 bootstrap 压缩，"injected into every session, so its size is paid for constantly"
  - v6.2.0 分支级压缩，每一刀 micro-test，退化的那刀返工
  - v5.0.5 子 agent 执行从 mandatory 改为 recommended
- 仓库元数据（GitHub API，2026-08-21 查）：14 个 skill，274,969 star，建仓 2025-10-09
- Ry Walker 的评估（含"agent 仍会绕过验证"的保留意见）：<https://rywalker.com/research/superpowers-skills-framework>
- "改个 CSS 要等半天"那条吐槽：<https://www.threads.com/@rodskagg/post/DUs7L4CDLVV>
- Claude Opus 4.6 发布说明（plans more carefully）：<https://anthropic.com/news/claude-opus-4-6>
- 上一篇的 todo list A/B 对照：见 `LangChain-删掉自己的系统提示词.md`
