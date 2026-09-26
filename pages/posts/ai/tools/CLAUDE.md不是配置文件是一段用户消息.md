---
title: CLAUDE不是配置文件是一段用户消息.md
date: 2026-08-24
updated: 2026-08-24
categories:
  - AI
  - 工具与框架
tags:
  - Claude Code
  - 提示词
---
# 你的 CLAUDE.md 不是配置文件，是一段用户消息

我用 Claude Code 大半年，一直觉得它的记忆系统很简陋：靠一堆 markdown 文件维护，而且我不知道那些文件到底有没有被用上。同一条偏好说过很多次，换个会话又回到原点。

带着这个不满，我把市面上能找到的 agent 记忆方案挖了一遍——官方五家（Anthropic、OpenAI、Cursor、GitHub Copilot、Windsurf）、插件生态十几个、框架三家（mem0、Zep/Graphiti、Letta），加上评测基准。同时在自己机器上把 Claude Code 的记忆目录和 claude-mem 的数据库翻了一遍。

结论和我出发时的假设不一样。它记了，也读了，问题出在最后一步：**CLAUDE.md 和 auto memory 的内容，是作为系统提示词之后的「用户消息」注入的，不是系统提示词本身。** 官方文档白纸黑字写着这一点，并且明确指路：想要不可绕过的拦截，请用 hook，不要指望记忆。

也就是说，你写进去的每一条规则，在架构上就只是建议。而整个行业——包括那些记忆插件自己——都在假装它是约束。

以下事实查证时间统一为 2026-08-24，本机部分为实测，版本随文标注。

---

## 一、"记不住"其实是三件事

"它记不住我的习惯"这句话混了三关：没记下来、记了没召回、召回了不照做。三关的责任方完全不同，混着说就没法追。一件件量。

先说机制。官方文档写着两套并行：CLAUDE.md 是人写的规则，Auto memory 是 AI 自己写的经验。后者存在 `~/.claude/projects/<项目>/memory/` 下，按 git 仓库聚合；目录里一个 `MEMORY.md` 做索引，若干主题文件放内容；启动时只加载 `MEMORY.md` 的前 200 行或 25KB，主题文件按需读取。默认开启，`autoMemoryEnabled: false` 或 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 可关。

它只记四类：你是谁（user）、你给过的纠正（feedback）、代码和 git 历史里推不出来的项目背景（project）、外部信息去哪找（reference）。能从代码里读出来的架构和路径不记，CLAUDE.md 已写过的不记。这是刻意收窄，防止记忆膨胀反过来污染上下文。

### 第一关，写入：81 个会话产出 11 条

这台机器上 `~/.claude/projects/` 有 28 个项目目录、436 个会话 jsonl。auto memory 建了 15 个 `memory/` 目录，其中**只有 5 个非空，共 11 个主题文件**。这 5 个项目自己合计 81 个会话。

| 项目 | 主题文件 | 该项目会话数 |
| --- | --- | --- |
| outdoor-saas | 4 | 60 |
| Developer（父目录） | 3 | 11 |
| outdoor-guard-antimixup | 2 | 3 |
| ToContext | 1 | 6 |
| study-java | 1 | 1 |

（两个分母要分清：81 是"产生过记忆的项目"的会话数，436 是全部项目的。用 436 当分母会把稀疏程度夸大 5 倍。）

写入极度克制，和"只记四类"的设计一致，不算 bug。但几个月下来 11 条，说它简陋不冤枉。**这一关基本正常，不是痛点所在。**

### 第二关，召回：默认看不见，但它其实一直在数

我想量一下这 11 个文件有没有被用上。文档说主题文件"按需读取"，那就去 transcript 里找记录。

**第一条路，数 Read 工具调用。** 全库扫：Write/创建 8 次，**Read 只有 2 次且是同一个文件**，另有 10 次 Bash——那是我自己 `cat` 去看的，不算召回。

**第二条路，用内容特征串反查。** 万一它不走工具、被直接注入呢？我把每个记忆文件的 `description` 抽出来当特征串全库反查，排除掉 frontmatter 里 `originSessionId` 标的来源会话。只命中一条：某文件在 `2026-08-13T03:27:58` 出现在非来源会话里。顺着时间戳往前三秒，是 `03:27:55` 我自己敲的一条 `rtk read`。**唯一一次疑似召回，是我手动看的。**

**但这里得停一下**——反查为空不等于没召回，先得证明"注入会落进 transcript"。做个对照：CLAUDE.md 每个会话都注入，如果注入可见，它该出现在绝大多数 transcript 里。实际是 **436 个会话里只有 1 个含 CLAUDE.md 注入正文**，含 `system-reminder` 块的只有 34 个。

**transcript 根本不记录注入层。** 前两条路作废。

**第三条路，文件系统 atime。** 我用一段 python 把 11 个文件全读一遍再 `stat`——只有 3 个 atime 更新了。卷上有 `noatime`。这条也废。

到这一步我差点写下"没有任何东西能告诉你一条记忆有没有被召回过"。**幸好去翻了二进制，这句话是错的。**

`~/.local/share/claude/versions/2.1.241` 里 `strings` 一把，memory 相关的遥测事件有 **78 个**。其中三个直接相关：

- `tengu_memdir_file_read` / `tengu_memdir_accessed`——从 PostToolUse 路径触发，字段带 `file_class` 和 **`prior_access`**。**系统一直在记录某个记忆文件此前是否被访问过。**
- `tengu_memdir_pinned_injected`——注入被埋点，带注入条数和字符数。
- `tengu_memory_rating_writeback` / `tengu_session_memory_rated`——记忆评分回写。

而且 `~/.claude/debug/` 目录在我机器上就有文件，`CLAUDE_CODE_ENABLE_TELEMETRY` 加完整 OTEL 导出链（`OTEL_EXPORTER_OTLP_ENDPOINT` / `OTEL_LOGS_EXPORTER` / `OTEL_METRICS_EXPORTER`）都在。

所以准确的说法是：**数据存在、厂商在收、默认不给你看，但你可以自己打开。** 这跟"不可观测"差一个量级。我之所以三条路全撞墙，是因为我在做事后取证，而没去开产品自带的仪表——这是我这次调查最大的方法论失误，写在这里当个教训。

顺带一个对照，说明这事有多难得：claude-mem 的 SQLite 表里**建了 `relevance_count` 这一列**，正是用来计读取次数的，但全库 5138 条**全是 0**，grep 全量代码，这个列名只出现在建表 DDL 和列存在性检查里，**从无 UPDATE**。字段建了，没接上。

一家埋了 78 个点但默认不给你看，一家有地方做但没做。区别是前者可以打开。

**这一关也不是主要痛点。** 有点麻烦，但有解。

### 第三关，照做：这一关是官方自己承认的

前两关都过了，卡在这里。

CLAUDE.md 的内容是作为**系统提示词之后的用户消息**注入的，不是系统提示词本身。它是给模型看的建议，不是硬约束。这不是我的推测，是官方文档自己写的，而且顺手给了解法：**想要不可绕过的拦截，用 PreToolUse hook。**

GitHub 上有一串 issue 精确描述了这个体感。#18660 说指令确实加载进上下文了、模型能承认规则存在、能复述，但干活时会漂移，"完成任务"压过了"遵循流程"。#46724 说项目级和用户级 CLAUDE.md 都被持续忽略，尤其是流程类规则，跨会话反复出现。#41830 最有意思：那位用户攒了 74 个 feedback 记忆文件，**每一个都对应模型被纠正过的一次独立事件——文件数量本身就是这套机制失效次数的计数器。**

三关走完，结论很清楚：**它记了，也读得到，但记忆在架构上就没有强制力。**

你在 CLAUDE.md 里写「提交前必须问我」，它又直接 commit 了。此刻大多数人的反应是三选一：是不是我写得不够清楚（去重写措辞、加粗、加感叹号）／是不是放错层级了（折腾目录结构）／这玩意就是不行（放弃）。**这三条归因大概率都是错的。** 问题不在你的措辞，在于你把一条需要强制执行的规则，放进了一个设计上不提供强制力的地方。

---

## 二、五家官方都在往同一个方向退

如果只有 Claude Code 这样，那是产品成熟度问题。但五家的动作是一致的。

| | 静态规则 | 自动记忆 | 谁裁决 | 用户可见 | 值得注意的动作 |
| --- | --- | --- | --- | --- | --- |
| Claude Code | CLAUDE.md 四级 | 有，限四类 | 模型自己 | 是（明文 markdown） | 官方指路用 hook 做硬约束 |
| Codex CLI | AGENTS.md，32KiB 截断 | CLI 无，桌面 app 有 | 模型 | app 内可见 | — |
| Cursor | `.cursor/rules/*.mdc` | 有，Beta | **人工 approve** | 是（黑盒条目） | 加了人工审批环节 |
| Copilot | `copilot-instructions.md` | 有，preview | 模型 + 分支核验 | 是，含企业级管理 | **用前先与当前分支核验** |
| Windsurf | `.windsurfrules` | legacy，正在废弃 | 模型 | 是 | **转向 skills 替代 memories** |

后三列的动作方向是同一个：**别只依赖模型自觉。**

Cursor 承认自动提炼会出错，加了 approve 环节把裁决权还给人——但通过之后就是个黑盒条目，没有 diff、没有 blame、没有 rollback，也不进 git、不跨团队，新同事拿不到任何积累。（它的后台提炼机制细节来自社区二次来源，官方文档没细说，这里标个不确定。）

Copilot 走得最远，是唯一把治理当功能做的：用户可自助删除、仓库 owner 可管理仓库级事实、企业管理员可批量导出删除、闲置 28 天自动过期，而且**repo 级事实在使用前会先与当前分支核验一遍**——它不信任自己的记忆，要二次校验。

Windsurf 最直接。被 Cognition 收购后，Cascade Memories 的文档已挪到 devin.ai 下，明确标注仅适用于 legacy Cascade agent；默认的 Devin Local agent **不持久化记忆，建议迁移到 skills**。一个做了自动记忆的产品，换了东家之后选择用可执行的工作流定义，替代自动提炼的事实。

### 顺带几条 Claude Code 的实用细节

既然讲到这，几条容易踩的：

层级是四级——企业管控 → 用户级 `~/.claude/CLAUDE.md` → 项目级 → `CLAUDE.local.md`。工作目录及所有上级目录的文件**启动时全部加载**，从文件系统根向工作目录拼接，越近的排越后。**子目录里的 CLAUDE.md 不在启动时加载**，要等 Claude 读到该目录下的文件才按需加载——这是很多人"子目录规则不生效"的答案。

`@path` import 递归深度上限 4 层，相对路径相对**被 import 的文件**解析，不是工作目录。import 进来的内容照样全量进上下文，不省 token。单文件建议 200 行内，硬上限 4MiB、超了直接跳过。

**`/compact` 之后项目根 CLAUDE.md 会重新从磁盘读一遍注入，但子目录 CLAUDE.md 要等再次读到匹配文件才重载。**「压缩完它就忘了我的规则」多半是这个原因。

API 侧是另一套，别和 CLI 混：memory tool 类型 `memory_20250818`，六个 command（`view`/`create`/`str_replace`/`insert`/`delete`/`rename`），限定在 `/memories` 前缀下，**不需要 beta header**。文件系统由客户端实现，连路径穿越防护都写明是开发者责任。旁边还有两个容易混的：

| 机制 | beta header | 触发 | 做什么 |
| --- | --- | --- | --- |
| memory tool | 不需要 | 模型自己决定 | 跨会话持久化 |
| context editing | `context-management-2025-06-27` | 默认 100k input tokens | 清除旧 tool result，留最近 3 次 |
| compaction | `compact-2026-01-12` | 默认 150k input tokens | 服务端把早期上下文摘要成一个 block |

一个"删"、一个"总结"、一个"存到外面"。官方称 context editing 单独用性能提升 29%、100 轮长任务省 84% token，与 memory tool 组合提升 39%——这组数字只有发布博客一个出处，没有方法论披露，当参考值看。compaction 有个坑：必须把 `response.content` 整体原样附回下一轮，只取文本会静默丢失压缩状态。

---

## 三、记忆系统自己也栽在同一件事上

这是整件事最讽刺的地方：那些用来解决"模型记不住"的插件，自己也在用提示词约束模型，然后同样约束不住。

**claude-mem**（91,627 ★，我这台机器上装的是 13.15.3）的总结 prompt 在 `modes/code.json` 里，`type_guidance` 写死了 "MUST be EXACTLY one of these 9 options"，列了 bugfix / feature / refactor / change / discovery / decision / security_alert / security_note / sensitive 九个值。

实测数据库里出现了 **150 多种自由文本 type**，`critical-bug-fix`、`documentation-network-analysis` 这种。上游 issue #3695《unenforced concepts vocabulary, dead FTS column》独立印证了这类问题。

一个记忆系统，用全大写的 MUST 去约束 haiku 输出九选一，拿到 150 多种。**把规则写进提示词，得到的是倾向，不是保证**——这条规律对用户的 CLAUDE.md 成立，对插件作者的 system prompt 一样成立。

同样的模式在别处：

- **mem0** 把"这是不是同一件事的更新"这个语义判断，降级成了 **MD5 字面哈希比对**（下一节展开）。语义问题被挤成字符串问题。
- **官方 memory MCP**（modelcontextprotocol/servers 里那个知识图谱参考实现）的 `search_nodes`，实现就是 `toLowerCase().includes()`——纯子串匹配，没有任何语义检索。作为参考实现简单是优点，但很多人拿它当"MCP 也能做记忆"的证据时，未必知道检索层是这个水平。

### claude-mem 的其余实测

既然翻了数据库，几个数字一并放这：

**成本。** 14 天（08-10 ~ 08-24）产生 106 个会话、5138 条 observation，`sum(discovery_tokens) = 22,355,061`。日均约 367 条 × 4351 tokens ≈ **每天 160 万输入 token 流经 haiku-4.5**。走订阅额度（`CLAUDE_MEM_CLAUDE_AUTH_METHOD=subscription`），不单独出账，但会挤占额度。

**向量碎片化。** 每条 observation 的每个 fact 都单独 embed。实测 fact 类 31754 条 + narrative 5129 条 = 36883 个向量，对应源记录只有 5138 条，7 倍膨胀，库 144MB。后果是检索 top-K 容易被同一条观察拆出的多个碎片挤占——你要三条不同的相关记忆，返回的可能是同一条的三个片段。

**没有衰减，只有一个 90 天悬崖。** 排序里没有时间项，要么纯 BM25 要么纯时间，不存在 `score = relevance × decay(age)`。语义检索路径上有个 `RECENCY_WINDOW_MS = 7776e6`（90 天）的**硬过滤**，直接丢弃不是降权，且没有兜底回落。表现完全静默：91 天前的记忆不报错、不提示，就是搜不到。

**项目串味是结构性的。** 24 个项目（私人笔记、推文目录、公司代码仓）全在同一个 `cm__claude-mem` collection 里，隔离完全靠查询时加 metadata filter，漏加一次就串。对比 mem0 的 `search()` 强制要求 filters 至少含 `user_id`/`agent_id`/`run_id` 之一、否则直接 `raise ValueError`——那是硬约束，这是软过滤。

**敏感信息明文落盘。** 它自己定义了 `sensitive`/`security_alert`/`security_note` 三种类型（本机已产生 10/11/6 条），说明设计上预期会捕获敏感内容，但都以明文存在本地 SQLite 和 Chroma 里，没有字段级加密。

### 另一个极端：Cline Memory Bank

值得对照的是 Cline 的做法——它压根不假装记忆是自动的。官方文档明写**这不是内置功能**，是一段要你手动复制进 `.clinerules/` 的自定义指令，规定六个固定命名的文件（`projectbrief` / `productContext` / `activeContext` / `systemPatterns` / `techContext` / `progress`），外加一条全大写的强制语气：

> Cline MUST read ALL memory bank files at the start of EVERY task - this is not optional.

每次任务全读六个文件，token 爆炸是明摆着的代价。但它换来一样别人都没有的东西：**记忆就是仓库里的 markdown，能 diff、能 blame、能 code review、能跟着 PR 一起审、能回滚。** 不是 AI 背着你长出来的黑盒。

（顺带，它这条 MUST 同样管不住——GitHub 上有 issue 报告 Cline 声称已更新 memory bank 但实际没落盘。规律再次成立。）

---

## 四、三家框架在争谁有决定权，但都默认模型会照做

开源框架这一层把"谁来决定记什么、忘什么"吵成了三条路。

**mem0**（63,902 ★）的经典叙事是两阶段：抽取候选事实，再让 LLM 比对已有记忆输出 ADD/UPDATE/DELETE/NOOP。**这套在当前 main 分支已经不跑了。** `prompts.py` 里那两个 prompt 还躺着，但 `main.py` 里搜 `get_update_memory_messages` 零调用方，是死代码。

现在跑的是单次 LLM 调用只抽取新事实，判重降级成 MD5 字面哈希。官方迁移文档写得毫不含糊：**彻底取消了 UPDATE 和 DELETE 操作**，并称此举让 LOCOMO 从 71.4 涨到 91.6、延迟减半。

这个数字要打个折看。它是在 LOCOMO 上测的，而那个基准的 judge 有 63% 的假阳性率（下一节说）；ADD-only 会让库里堆更多条目、召回更多文本，而"说得多"在宽松 judge 面前本身就是涨分策略。v3 还同时改了三件事（单次调用、ADD-only、批处理），并新增了真实日期锚点——日期锚点本身就增强时序能力，而时序是 LOCOMO 的重头。**厂商没做消融，把 20 分涨幅归因给某一项都不成立。** 更中性的读法是：延迟减半是确定的收益，质量有没有损失没人测得出来，于是按成本决策。

它的失败模式很具体：

> 三个月前你说"我喜欢吃辣"，今天说"我不吃辣了"。文本不同、MD5 不同，不触发任何更新。两条矛盾记忆并存，检索时全凭向量相似度排序，召回哪条看运气。

把"吃辣"换成"这个项目用 pnpm 不用 npm""这个接口废弃了改用新的"，就是 coding agent 每天在发生的事。

**Graphiti**（Zep 的开源核心，30,231 ★）走了完全相反的路，而且是这批方案里唯一把"改口"做对的。它给图上每条边挂两套时间戳：一套是"这件事在世界里何时为真"，一套是"系统何时知道/纠正了它"。新信息与旧事实矛盾时，**它不删旧边，只给旧边打上失效时间戳**——旧事实变成"曾经为真、现在失效"，历史永远可查。

这个设计解决的正是一类你天天问但答不上来的问题："我上次为什么否决了 X 方案"。纯向量检索答不了这类问题，因为"否决了 X"和"选择了 X"在 embedding 空间里挨得很近——语义相似，方向相反。除非系统显式建模了"取代关系"，否则相似度排序分不出哪条是最新有效的。

代价是构建成本高一个量级（有第三方测算单次对话的图谱构建可能到 60 万 token 量级，我没独立复现，谨慎引用）。

**Letta**（前身 MemGPT，24,380 ★）赌的是权限边界：core memory 常驻上下文、archival 按需检索、recall 存完整历史。有一句流传很广的说法要纠偏——**Letta 的 agent 并不能编辑自己的 system prompt**，文档明确把系统指令设为只读，agent 能读写的只是 persona / human 这类记忆块。这是有意划的安全边界。

| | 谁决定记什么/忘什么 | 赌的是 | 失败方式 |
| --- | --- | --- | --- |
| mem0 | 没人（只加不改） | 抽取一次到位 | 矛盾记忆并存，召回看运气 |
| Graphiti | 结构自动裁决 | 时序留痕 | 图膨胀、构建成本高 |
| Letta | agent 自己，但关在沙箱里 | 权限边界 | 并发覆盖写 |

三家吵的是决定权归谁，**但三家都默认了一件事：决定做出之后，模型会照着执行。** 而这正是第一节里被官方文档否掉的假设。

### 关于"过时的记忆该退场"

顺着上面的逻辑，很容易推出"退场机制没人做是大问题"。我一开始也是这么想的，后来发现证据没那么硬，把正反两面都摆在这：

支持的一面：LongMemEval 把 knowledge update 单列为五类能力之一，PersonaMem 专测偏好随时间漂移——两个独立团队在互不相干的基准设计里，各自判定"旧信息被新信息取代"值得单独成为一个测试维度。加上 mem0 那个 MD5 判重的机制级证据，失效路径是畅通的。

反对的一面：mem0 删掉整套退场机制后自报指标上涨；LOCOMO 上"全量上下文不做记忆"的 baseline 打赢了专门系统；而我自己的实测是 11 条记忆——**n=11 的时候根本不需要淘汰策略**。

诚实的表述是：**机制上必然发生，频率上无人测量**，而且它只在"记忆量大 + 内容是会变的偏好和决策 + 使用跨度到月级"三个条件同时满足时才是真问题。claude-mem 的 5138 条在这个区间内，Claude Code 的 11 条不在。

---

## 五、没人能证明谁做得对

各家都有 benchmark 数字。这些数字基本不能横向比。

LOCOMO 是被引用最多的长对话记忆基准。Penfield Labs 做过一次审计，结论相当难堪：1540 个问题里 **6.4% 的答案标注本身是错的**。有一道题标准答案要求"法拉利 488 GTB"，但原文只写了 "this beauty"，图片说明也只写"一辆红色跑车"——车型信息只存在于标注者搜图时用的内部字段里，**任何记忆系统都不可能"记住"一个从未出现在对话里的事实**。同一份审计还发现 LLM judge 对故意构造的错误答案接受率高达 63%。

更尴尬的是：**把全量上下文直接喂给 LLM、不做任何记忆检索的 baseline 拿 73%，超过 mem0 自己报告的最佳成绩（约 68%）。** 一个专门设计的记忆系统，打不过"全塞进去"。

而 mem0 和 Zep 围绕彼此的分数来回纠错了三轮，三家头部（mem0 / Zep / Letta）在同一基准上报出的数字各自跑自己的 pipeline、prompt 和 judge。**没有哪一方的数字是干净的。**

需要补两条背景，否则容易得出"那不如全塞进上下文"的错误结论：Chroma 的 Context Rot 报告测了 18 个 SOTA 模型，发现可靠性随输入长度持续下降，**每一个长度档位上都能观测到退化**，不是逼近上限才掉；NoLiMa 排除了字面词重叠这个作弊通道后，12 个号称支持 128K+ 的模型里 **10 个在 32K 处掉到短上下文基线的 50% 以下，GPT-4o 从 99.3% 掉到 69.7%**。全塞进去能赢，只是因为 LOCOMO 的对话还不够长。

最后一个空白：编码场景的记忆基准基本没有。少数例外是 SWE-Bench-CL，把 SWE-Bench-Verified 的 issue 按仓库和时间重组成任务流，衡量"修了 A 仓库的 bug 之后这个经验对修 B 是帮助还是干扰"。它的可贵之处是有真 ground truth（patch 过不过测试），不靠 LLM judge 打分。

---

## 六、那到底该怎么用：按"能不能强制"分三层

如果记忆在架构上就是建议，那正确的用法不是把它写得更用力，而是**先判断这条规则需不需要强制执行，再决定它该放哪**。

**第一层，不可违反的 → hook。** 提交前必须确认、禁止碰生产配置、禁止 `push --force` 这类。写成 PreToolUse hook，由 harness 执行，模型绕不过去。额外的好处是**它天然可观测**——拦截失败会报错，是个二值信号，而"记忆有没有被加载"不是。

**第二层，流程性的 → skills / 可执行工作流。** 「做这类任务时按 1234 步走」这种，写成 skill 比写成记忆更靠谱，因为它是被显式调用的，不依赖模型主动想起来。Windsurf 从 memories 转向 skills 走的就是这条路。

**第三层，背景信息 → 记忆。** 这个项目的业务背景、我偏好的表达风格、某个坑的来龙去脉——这类东西本来就不需要强制力，模型知道就行，偶尔漏掉也不致命。**这才是记忆真正适合承载的东西。**

把三层混在一起，是大部分挫败感的来源：你把第一层的东西写进了第三层的容器。

### 检查清单

如果要评估一个记忆方案（或自己做一个），我会按这几条打分：

1. **它承认自己是建议还是假装是约束？** 文档有没有说清强制力边界，有没有给出真正的强制手段。
2. **写入可见吗？** 每条记下的东西能否追溯到哪次对话、哪个操作触发。
3. **召回可数吗？** 能不能查到某条被召回过几次、最近一次什么时候。有没有官方的观测入口（遥测、debug 日志），还是只能事后刨数据。
4. **矛盾怎么裁决？** 新旧冲突时是显式建模取代关系，还是任由检索随机返回一条。
5. **能回答否定式和时序式查询吗？**「我上次为什么没选 X」「最新的配置是什么」——纯相似度检索大概率失手。
6. **隔离是硬约束还是软过滤？** 多项目混用时漏加一次 filter 会不会串味。
7. **扛得住污染吗？** README / issue / 代码注释这些不可信输入能否被写进长期记忆。（SpAIware 是有厂商响应的公开案例：注入内容写进 ChatGPT 长期记忆后，后续所有新会话都携带该指令。coding agent 每天都在读这些文件。）
8. **性能数字的复现条件透明吗？** 有没有和"不做记忆、直接全量上下文"这个笨办法比过。

---

## 我们能做的

**别再改 CLAUDE.md 的措辞了。** 如果一条规则反复不被遵守，问题大概率不在你怎么写，在于你把需要强制执行的东西放进了一个不提供强制力的地方。加粗、全大写、加感叹号都不会改变它是一段用户消息这个事实——插件作者用 "MUST be EXACTLY one of these 9 options" 试过了，拿到 150 多种。

**按三层分流你的规则。** 花十分钟把现有 CLAUDE.md 过一遍，标出哪几条是"违反了会出事"的。那几条搬去 hook，剩下的留在记忆里，心态也就顺了——你不再期待它百分百遵守，因为它本来就不保证。

**想观测就去开仪表，别自己刨数据。** 我绕了三条弯路才发现 Claude Code 埋了 78 个 memory 遥测事件、还记 `prior_access`。`--debug`、`~/.claude/debug/`、`CLAUDE_CODE_ENABLE_TELEMETRY` 加 OTEL 导出都是现成的。真想知道哪条规则在起作用，先开这些，比 grep transcript 靠谱。

**定期清 memory 目录。** auto memory 是明文 markdown，这是它最大的优点——你能打开看、能删。定期扫一遍 `~/.claude/projects/*/memory/`，把不成立的删掉。别等长到 74 个文件才发现问题。

**多项目混用先看隔离方式。** 同一台机器既处理公司代码又写个人笔记的话，装记忆插件前确认它的隔离是硬约束还是软过滤。claude-mem 是后者，24 个项目共用一个 collection。

**成本心里有数。** 我这里 14 天 2235 万 token 走 haiku，走订阅额度，不出账但挤额度。

**看 benchmark 数字先问三件事：** 谁测的、backbone 是什么、有没有和全量上下文的 baseline 比过。一个连"全塞进去"都打不过的记忆系统，数字再好看也没意义。

---

## 参考

**官方文档**
- [How Claude remembers your project — Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Memory tool — Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Managing context on the Claude Developer Platform](https://claude.com/blog/context-management)（2025-09-29，29%/39%/84% 的唯一出处）
- [Effective context engineering for AI agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [AGENTS.md 规范](https://agents.md/)
- [About GitHub Copilot Memory — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Rules — Cursor Docs](https://cursor.com/docs/context/rules)
- [Cascade Memories — docs.devin.ai](https://docs.devin.ai/desktop/cascade/memories)（已标记 legacy）
- [Memory Bank — Cline Docs](https://docs.cline.bot/best-practices/memory-bank)

**源码与 issue**
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)（91,627 ★；issue #3695 unenforced concepts vocabulary）
- [mem0ai/mem0](https://github.com/mem0ai/mem0)（63,902 ★；`memory/main.py`、`configs/prompts.py`、`docs/migration/oss-v2-to-v3.mdx`）
- [getzep/graphiti](https://github.com/getzep/graphiti)（30,231 ★）
- [letta-ai/letta](https://github.com/letta-ai/letta)（24,380 ★）
- [modelcontextprotocol/servers — memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)（`search_nodes` 子串匹配）
- anthropics/claude-code issues [#18660](https://github.com/anthropics/claude-code/issues/18660)、[#46724](https://github.com/anthropics/claude-code/issues/46724)、[#41830](https://github.com/anthropics/claude-code/issues/41830)

**评测**
- [LOCOMO (arXiv:2402.17753)](https://arxiv.org/abs/2402.17753) 与其审计 [We audited LOCOMO](https://dev.to/penfieldlabs/we-audited-locomo-64-of-the-answer-key-is-wrong-and-the-judge-accepts-up-to-63-of-intentionally-33lg)
- [LongMemEval (arXiv:2410.10813)](https://arxiv.org/abs/2410.10813)
- [NoLiMa (arXiv:2502.05167)](https://arxiv.org/abs/2502.05167)
- [Context Rot — Chroma Research](https://www.trychroma.com/research/context-rot)
- [Is Mem0 Really SOTA in Agent Memory? — Zep](https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/)
- [SpAIware — Embrace The Red](https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/)

**本机实测（2026-08-24）**
- `~/.claude/projects/*/memory/`（目录结构、frontmatter、11 个主题文件的读写事件统计）
- `~/.local/share/claude/versions/2.1.241`（`strings` 提取 78 个 memory 遥测事件名）
- `~/.claude-mem/claude-mem.db`、`~/.claude-mem/chroma/`（13.15.3 表结构与统计）
- `~/.claude/plugins/cache/thedotmack/claude-mem/13.15.3/`（hooks.json、modes/code.json、worker-service.cjs）
