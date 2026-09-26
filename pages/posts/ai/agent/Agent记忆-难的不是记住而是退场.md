---
title: Agent记忆-难的不是记住而是退场
date: 2026-08-24
updated: 2026-08-24
categories:
  - AI
  - Agent
tags:
  - Agent
  - 记忆
---
# Agent 记忆的难点不是记住，是让过时的记忆退场

这篇的起因是三个具体的不满。我知道 Claude Code 有记忆系统，用了大半年——但它看着很简陋，靠一堆 markdown 文件维护，而且我始终不知道那些文件到底有没有被用上。同一条偏好说过很多次，换个会话又回到原点，可我说不清是它没记、记了没读、还是读了不照做。

带着这三点，我把市面上能找到的 agent 记忆方案挖了一遍——官方五家（Anthropic、OpenAI、Cursor、GitHub Copilot、Windsurf）、插件生态十几个、框架三家（mem0、Zep/Graphiti、Letta），加上学术侧的方法论和评测基准。同时在自己机器上把 Claude Code 的记忆目录和 claude-mem 的数据库翻了一遍——这两个是我真正在用、有运行数据的。

结论比我预期的更糟，而且糟在同一个地方：**几乎所有方案都在卷"怎么把东西记下来"和"怎么把它捞回来"，而写入之后的两件事——新旧矛盾了听谁的、过时的什么时候退场——做的人极少。更麻烦的是，第三件事根本没人做：没有任何一个方案能告诉你，一条记忆到底有没有被召回过。**

第三点是我这次实测出来的，也是最让我意外的：我想量一下 Claude Code 记忆的命中率，试了三条路，一条都走不通——不是命中率低，是**这个数字压根不存在**。而没有这个数字，"该忘掉什么"就无从判断，因为你连"哪条在被用"都不知道。

以下事实与数据的查证时间统一为 2026-08-24，涉及本机的部分为实测，版本会随文标注。

---

## 一、先把「记不住我的习惯」这句话拆开

"记不住"其实混了三件事：没记下来、记了没召回、召回了不照做。这三件事的责任方完全不同，混着说就没法追。先把机制摆清楚，再一件件量。

官方文档明确写着两套并行的机制：CLAUDE.md 是人写的规则，Auto memory 是 AI 自己写的经验。Auto memory 存在 `~/.claude/projects/<项目>/memory/` 下，按 git 仓库聚合，同仓库的所有 worktree 共享；目录里一个 `MEMORY.md` 做索引，若干主题文件放内容；启动时只加载 `MEMORY.md` 的前 200 行或 25KB，主题文件按需读取。默认开启，`settings.json` 里 `autoMemoryEnabled: false` 或环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 可关。

我在本机确认了它确实在跑：`outdoor-saas`、`outdoor-guard-antimixup` 这些项目目录下都有 `memory/MEMORY.md` 和独立主题文件，比如一个叫 `ask-before-any-git-commit-or-push.md` 的——顾名思义，是我某次纠正它之后它自己记下来的。主题文件的 frontmatter 是 `name` / `description` / `metadata.node_type` / `metadata.type`，`type` 取 `feedback`、`project` 这类值。

官方给这套设计划的边界很清楚：auto memory 只记四类东西——你是谁（user）、你给过的纠正（feedback）、代码和 git 历史里推不出来的项目背景（project）、外部信息去哪找（reference）。能从代码里读出来的架构和路径不记，CLAUDE.md 里已经写过的不记。这是一个刻意收窄的设计，目的是防止记忆无限膨胀反过来污染上下文。

### 先量写入：436 个会话，11 个记忆文件

这台机器上 `~/.claude/projects/` 有 436 个会话 jsonl、28 个项目目录。auto memory 建了 15 个 `memory/` 目录，其中**只有 5 个非空，一共 11 个主题文件**。

| 项目 | 主题文件 | 会话数 |
| --- | --- | --- |
| outdoor-saas | 4 | 60 |
| Developer（父目录） | 3 | 11 |
| outdoor-guard-antimixup | 2 | 3 |
| ToContext | 1 | 6 |
| study-java | 1 | 1 |

写入是极度克制的。这跟"只记四类、能从代码推出来的不记"的设计一致，不算 bug。但 11 条记忆分摊到几个月、几十万 token 的会话量上，说它简陋不算冤枉。

### 再量召回：三条路，一条都走不通

真正想知道的是这 11 个文件有没有被用上。官方文档说主题文件"按需读取"——那我就去 transcript 里找读取记录。

**第一条路：数 Read 工具调用。** 主题文件如果由模型按需读取，会留下 tool_use 记录。全库扫下来：Write/创建 8 次，**Read 只有 2 次，而且是同一个文件**（`scope-cleanup-by-git-blame-not-style.md`），另有 10 次 Bash——那 10 次是我自己在会话里 `cat`/`rtk read` 去看的，不算召回。

**第二条路：用内容特征串反查。** 万一它不走 Read 工具，而是被 harness 直接注入呢？那注入的正文应该出现在 transcript 里。我把每个记忆文件的 `description` 抽出来当特征串，全库反查，排除掉 frontmatter 里 `originSessionId` 标记的来源会话。结果只有一条疑似跨会话命中：`no-app-level-timeout-budget-in-precheck.md` 在 `2026-08-13T03:27:58` 出现在一个非来源会话里。

顺着时间戳往前三秒，找到了 `2026-08-13T03:27:55` 的一条 RTK hook 改写记录——那是我自己敲的 `rtk read` 读了这个文件。**唯一一次疑似召回，是我手动看的。**

**但这里必须停一下**：反查为空不等于没召回，得先证明"注入会落进 transcript"。于是做了个对照——CLAUDE.md 是每个会话都注入的，如果注入可见，它应该出现在 436 个 transcript 的绝大多数里。实际结果：**436 个会话里只有 1 个含 CLAUDE.md 的注入正文，含 `system-reminder` 块的只有 34 个。**

结论很明确：**transcript 根本不记录注入层。** 所以前两条路都是无效的，我测不出召回，也不能反过来断言"从没召回过"。

**第三条路：文件系统的 atime。** 读文件会更新访问时间，这是最后的希望。我先用一段 python 把 11 个文件全读了一遍，然后 `stat` 看 atime——**只有 3 个更新了**。查挂载参数，卷上有 `noatime`。而且就算 atime 可用，它也早就被我这次调查本身污染了。

三条路走完，结论不是"命中率低"，是：

> **没有任何本地产物能告诉你一条记忆有没有被召回过。** 不在 transcript 里，不在数据库里，不在文件系统元数据里。这个数字不存在。

### 这不是 Claude Code 一家的问题，是选了 markdown 的代价

markdown 载体我在文章里会夸好几次——可读、可 diff、可 blame、可 review、可回滚，出了问题你能打开看。这些优点是真的。

但它有一个结构性代价：**markdown 文件没有地方记录"我被读过"。** 一条 SQLite 记录可以加一列 `usage_count`，一个 markdown 文件加不了——你总不能每次读它就改一次文件，那 mtime 和 git diff 就全乱了。选了可审计的载体，就等于放弃了可观测。

而这一节的发现，跟后面一个数据点是同一件事的两种形态：

- **Claude Code**：markdown 载体，连记录读取的地方都没有——这不是疏忽，是载体本身的限制。
- **claude-mem**：SQLite 载体，本来有地方做。表里**建了 `relevance_count` 这一列**——这正是用来计读取次数的字段——但全库 5138 条**全是 0**，grep 全量代码，这个列名只出现在建表 DDL 和列存在性检查里，**从无 UPDATE**。字段建了，没接上。

一家没地方做，一家有地方没做。两条路径不同，结果一样：你查不到任何一条记忆被用过几次。

**为什么这件事重要**：退场机制的前提是知道哪条在被用。"长期零召回就降权"是最自然的淘汰规则，但它需要召回计数。没有这个数字，你能做的就只剩定时过期（Copilot 的 28 天）或者硬截断（claude-mem 的 90 天）——用时间这个粗糙的代理变量，去猜一条记忆还有没有价值。

所以"命中率不知道高不高"不是使用者的信息缺失，是**系统的能力缺失**。

### 最后一件事：召回了也不一定照做

假设前面两关都过了——记下来了，也召回了——还有第三关，而这一关是官方自己写明的：CLAUDE.md 的内容是作为**系统提示词之后的用户消息**注入的，不是系统提示词本身。换句话说，它是给模型看的建议，不是硬约束。官方文档自己承认这一点，并且明确指路：想要不可绕过的拦截，请用 PreToolUse hook，不要指望记忆。

GitHub 上有一串 issue 精确地描述了这个体感。#18660 说指令被加载进上下文了、模型能承认规则存在、能复述出来，但干活时会漂移，"完成任务"的优先级压过了"遵循流程"。#46724 说项目级和用户级 CLAUDE.md 都被持续忽略，尤其是流程类规则，跨会话反复出现，不是偶发。#41830 最有意思：那位用户攒了 74 个 feedback 记忆文件，每一个都对应模型被纠正过的一次独立事件——**记忆文件的数量本身，就是这套机制失效次数的计数器。**

这才是真实的痛点。不是"记不住"，是"记住了也不一定照做"，以及"记住的东西越堆越多、互相矛盾、没人清理"。

带着这个更准确的问题，再去看别人怎么做，就有参照系了。

---

## 二、官方派：五家的做法与分歧

### Anthropic：两层，且把存储责任推给你

CLI 侧就是上一节讲的 CLAUDE.md + auto memory。补充几个容易踩的细节：

层级是四级——企业管控（macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`）→ 用户级 `~/.claude/CLAUDE.md` → 项目级 → `CLAUDE.local.md`。工作目录及所有上级目录的文件在**启动时全部加载**，按"从文件系统根到工作目录"顺序拼接，越靠近工作目录的排在越后面。子目录里的 CLAUDE.md 不在启动时加载，要等 Claude 读到该目录下的文件才按需加载——这条是很多人"为什么我的子目录规则不生效"的答案。

`@path` import 递归深度上限 4 层，相对路径相对**被 import 的文件**解析而不是工作目录。import 进来的内容照样全量进上下文，不省 token。单文件建议 200 行以内，超过会降低指令遵循度，硬上限 4MiB、超了直接跳过不加载。

还有一条实用的：`/compact` 之后项目根 CLAUDE.md 会重新从磁盘读一遍注入，但子目录 CLAUDE.md 要等 Claude 再次读到匹配文件才会重载。"压缩完之后它就忘了我的规则"多半是这个原因。

API 侧是另一套东西，别和 CLI 混为一谈。Anthropic 的 memory tool 类型是 `memory_20250818`，声明极简，不需要 beta header。六个 command：`view` / `create` / `str_replace` / `insert` / `delete` / `rename`，所有操作限定在 `/memories` 路径前缀下。

这里的设计取向值得说：Anthropic 只定义协议和模型行为，**文件系统由客户端实现**。官方原话是 "Claude requests file operations, and your application executes them. You control where and how the data is stored through your own infrastructure"。连路径穿越防护（`../`、URL 编码穿越）都明确写着是开发者自己的责任。

配套的 system prompt 是自动注入的，里面有一句我觉得设计得很妙：

> ASSUME INTERRUPTION: Your context window might be reset at any moment, so you risk losing any progress that is not recorded in your memory directory.

把"随时可能被清空"写成默认假设，逼模型养成主动落盘的习惯。本质上是把记忆当崩溃恢复机制用，而不是当知识库用。

相邻还有两个容易混的机制，它们是三件不同的事：

| 机制 | beta header | 触发 | 做什么 |
| --- | --- | --- | --- |
| memory tool | 不需要 | 模型自己决定 | 跨会话持久化 |
| context editing | `context-management-2025-06-27` | 默认 100k input tokens | 清除旧 tool result，保留最近 3 次 |
| compaction | `compact-2026-01-12` | 默认 150k input tokens | 服务端把早期上下文摘要成一个 block |

一个是"删"，一个是"总结"，一个是"存到外面"。官方给的效果数字：context editing 单独用性能提升 29%，100 轮 web search 类长任务 token 消耗降 84%；memory tool + context editing 组合提升 39%。这组数字只有一个出处（2025-09-29 的发布博客），没见到更细的方法论披露。

compaction 有个坑要记：必须把 `response.content` 整体原样附回下一轮请求，只取文本字符串会静默丢失压缩状态。

### OpenAI：静态文件 + 服务端托管，外加今年新长出来的两条腿

Codex CLI 的 AGENTS.md 是纯静态的，人工维护，模型不会往里写。加载逻辑是三层：全局 `~/.codex/AGENTS.override.md` 优先于 `~/.codex/AGENTS.md`；项目层从 git 根往下走到 cwd，每级依次查 `AGENTS.override.md` → `AGENTS.md` → config 里配的回退文件名；拼接顺序从根向下，越近 cwd 的排越后。

和 CLAUDE.md 的实质差异有两个：**没有 import 语法**（只能靠目录层级物理堆叠 + 回退文件名），以及有一个 `project_doc_max_bytes` 上限（默认 32 KiB，可调到 64 KiB），**超限直接截断**——意味着离 cwd 远的全局指令可能被挤掉，而且是静默的。

API 侧走的是和 Anthropic 完全相反的路线。Responses API 用 `previous_response_id` 把对话状态**存在服务端**，客户端每轮只传新增消息，服务器负责拼回完整链条。这是"平台托管状态"，对开发者半透明；Anthropic 那边是"客户端实现存储"，全部责任下放。两种架构假设的分岔。

然后是今年的变化——**"Codex 没有自动记忆"这个判断在 2026 年 4 月已经过期了**：

- 4 月上旬，Codex app（桌面产品，不是终端 CLI）上线 memories 预览：项目级持久记忆，记你纠正过的错误、代码库架构、团队约定、个人偏好，跨会话生效。
- 4 月 20 日前后推出 Chronicle：后台代理捕获用户近期屏幕内容、提取上下文、构建持久记忆。ChatGPT Pro 专属、macOS、opt-in 研究预览，需要屏幕录制和辅助功能权限，暂不支持欧盟/英国/瑞士，截图 6 小时后自动删除。

社区对此的批评集中在生态锁定：项目级隔离、云端专属，换个项目清零，Codex 和 ChatGPT 之间也不共享。

### 顺带一提：Codex 的出厂 schema

一个小发现。我原以为这台机器没装 Codex（`which codex` 查不到），后来发现 ChatGPT 的 VS Code 扩展捆了一个官方 codex 二进制常驻跑 `app-server`，`~/.codex/` 下那堆 sqlx 数据库是它写的。

它的 `memories_1.sqlite` 有张 `stage1_outputs` 表，字段里有 `usage_count`、`last_usage`，以及 `selected_for_phase2` 和 `selected_for_phase2_source_updated_at`——分别对应访问频次强化、两阶段筛选、以及源会话变更后的记忆失效检测。这是我在所有官方方案里见到的唯一一个把这三件事写进存储层的。

**但这只是出厂 schema，没有任何参考价值可言。** 我这个 Codex 一次会话都没跑过（threads=0、projects=0、`sessions/` 下零个 rollout 文件），表是空的。任何人新装一遍都能看到同样的字段，它证明不了 Codex 运行时真的在写这些值。放在这里仅作为"有人在设计层面想过这个问题"的旁证，不构成任何实现结论。


### Cursor：待批准的自动记忆

Cursor Memories 从 v0.51（2025-05-30）开始有，至今仍标 Beta。机制是一个后台进程持续观察对话，提炼它认为持久有用的事实，生成**待批准**的条目，用户要在 Settings → Rules & Memories 里主动 approve 才落盘。

这个"待批准"的设计我认为方向是对的——它承认了自动提炼会出错，把裁决权还给人。但它止步于此：审批通过之后就是一个黑盒条目，**没有 diff、没有 blame、没有 rollback**，也不进 git、不跨团队同步。新加入项目的同事拿不到任何积累，团队成员之间的隐性认知会不可见地分叉。

论坛上 2026 年的反馈显示可靠性仍是主要痛点：reload window 后记忆消失、记忆被生成却被 agent 直接忽略、memories 面板不显示历史。首发时还要求关闭隐私模式才能用，被质疑过"暗模式"。

### GitHub Copilot：唯一把治理当功能做的

Copilot Memory 目前是 public preview，user-level 偏好 2026-05-15 面向 Pro/Pro+ 早期访问。它的静态部分是 `.github/copilot-instructions.md` 加上 `.github/instructions/*.instructions.md`（带 `applyTo` glob frontmatter 做路径级匹配）。

真正让它和别家拉开距离的是治理这一块：

- 用户可以查看和删除自己的偏好
- 仓库 owner 可以管理仓库级事实
- Business/Enterprise 管理员可以批量导出和删除
- **闲置 28 天自动过期**
- repo 级事实在使用前会先与当前分支核验

最后两条尤其少见。"退场机制"在别家还停留在学术论文里的时候，Copilot 已经把它做成产品行为了——虽然 28 天定额过期是个很粗糙的实现（下文会说为什么粗糙），但至少这件事有人做。

### Windsurf：这套机制正在被放弃

Cascade Memories 曾经是自动生成 + 用户可编辑，存在本地 `~/.codeium/windsurf/memories/`。但被 Cognition 收购之后，这部分文档已经挪到 docs.devin.ai 下，并且明确写着：仅适用于 legacy Cascade agent，默认的 Devin Local agent **不持久化记忆**，建议迁移到 skills。

一个做了自动记忆的产品，在换了东家之后选择用 skills（可复用的工作流定义）替代 memories（自动提炼的事实）。这个转向本身就是一条信息。

### 五家横向

| | 静态规则 | 自动记忆 | 谁裁决 | 用户可见 | 退场机制 |
| --- | --- | --- | --- | --- | --- |
| Claude Code | CLAUDE.md 四级 | 有，限四类 | 模型自己 | 是（markdown 文件） | 无 |
| Codex CLI | AGENTS.md，32KiB 截断 | CLI 无；app 有 | 模型 + 阶段筛选 | app 内可见 | schema 有失效检测字段 |
| Cursor | `.cursor/rules/*.mdc` | 有，Beta | **人工 approve** | 是（黑盒条目） | 无 |
| Copilot | `copilot-instructions.md` | 有，preview | 模型 + 分支核验 | 是，含企业级管理 | **28 天闲置过期** |
| Windsurf | `.windsurfrules` | legacy，正在废弃 | 模型 | 是 | — |

---

## 三、插件派：从 markdown 文件到知识图谱

Claude Code 生态里的记忆插件已经有十几个，形态差异很大。先看谱系：

| 项目 | 载体 | 写入方式 | 召回 | 冲突处理 | ★（08-24） |
| --- | --- | --- | --- | --- | --- |
| claude-mem | SQLite + Chroma 向量库 | hook 自动，haiku 总结 | 语义检索（90 天硬截断） | 无 | 91,627 |
| basic-memory | Markdown（wikilink）+ SQLite 索引 | 模型调 MCP 工具主动写 | 语义 + 全文 + 链接遍历 | 文件级，非 LLM 仲裁 | 3,732 |
| 官方 memory MCP | 纯 JSONL 三元组 | 模型显式调 9 个工具 | **子串匹配** | 同名实体直接忽略 | （servers 仓库） |
| memsearch | Markdown 为主 + Milvus 影子索引 | 五平台 hook 自动捕获 | dense + BM25 + RRF | SHA-256 去重 | 2,493 |
| agentmemory | SQLite 内置引擎 | MCP 54 工具 + 12 hook | BM25 + 向量 + 图 RRF | **矛盾检测 + 版本链** | 27,325 |
| memory-bank-mcp | 纯 Markdown | 模型直写文件 | 纯文件读取 | 无（last-write-wins） | 918 |
| context-portal | 每工作区一 SQLite + FTS5 | MCP 记 decision/pattern | 过滤 + 全文 + 关系遍历 | 未见数据级仲裁 | 766 |

有两个发现值得单拎出来。

**第一，官方 memory MCP 的检索是字符串包含。** modelcontextprotocol/servers 里那个 memory server，一直被当作"知识图谱记忆"的参考实现引用，实体-关系-观察三元组存 JSONL。但读它的源码会发现 `search_nodes` 的实现就是 `toLowerCase().includes()`——纯子串匹配，没有任何语义检索。这不是说它做错了（作为参考实现，简单是优点），而是说：很多人拿它当"MCP 也能做记忆"的证据时，可能没意识到检索层是这个水平。

**第二，`agentmemory` 是少数把"退场"真做了的。** 它有矛盾检测和版本链：新记忆覆盖旧记忆的语义时，旧版本被标记为 superseded，排除出召回但保留历史可追溯；还实现了 Ebbinghaus 遗忘曲线做时间衰减，加上访问频次强化。这套组合在插件里非常罕见，下文会看到连商业框架都在往回退。

### claude-mem 拆解：一个 9 万星插件的真实样子

我这台机器上装的是 claude-mem 13.15.3，所以能读真代码 + 查真数据库。它是这个生态里星数最高的（91,627 ★ / 8,028 fork / 279 open issues，2025-08-31 建库，几乎每天有提交），值得细看。

**写入侧。** hooks 挂了六处：`SessionStart` 拉起后台 worker 并注入记忆，`UserPromptSubmit` 做 session-init，`PostToolUse`（匹配 `*`）异步跑 observation，`PreToolUse`（仅 Read）跑 file-context，`Stop` 跑 summarize。注意**没有 SessionEnd**，而 `Stop` 在每次 Claude 停止生成时都触发——所以"总结"是贯穿会话的多次检查点，本机实测 581 条 session_summaries / 106 个会话 ≈ 每会话 5.5 次。

**成本。** 数据库里 14 天（08-10 ~ 08-24）产生了 106 个会话、5138 条 observation，`sum(discovery_tokens) = 22,355,061`。日均约 367 条 observation × 4351 tokens 输入 ≈ **每天 160 万输入 token 流经 haiku-4.5**。因为配置走的是订阅额度（`CLAUDE_MEM_CLAUDE_AUTH_METHOD=subscription`），这笔钱不单独出账，但量级放在那。

**存储。** SQLite 主库加一个独立的 Chroma 向量库（`~/.claude-mem/chroma/chroma.sqlite3`，本机 144MB），collection metadata 记录维度 384、`embedding_function: {type:"known", name:"default"}`——384 维是 Chroma 默认 embedding function 的签名，即本地 ONNX 跑的 all-MiniLM-L6-v2，不调外部 API。隐私上是加分项，检索质量上是减分项。

然后是几个我认为设计上站不住的地方：

**约束写在 prompt 里就等于没约束。** 总结用的 system prompt 在 `modes/code.json` 里，`type_guidance` 写死了 "MUST be EXACTLY one of these 9 options"，列了 bugfix / feature / refactor / change / discovery / decision / security_alert / security_note / sensitive 九个值。实测数据库里出现了 **150 多种自由文本 type**，`critical-bug-fix`、`documentation-network-analysis` 这种。haiku 并不严格遵守枚举。上游 issue #3695《unenforced concepts vocabulary, dead FTS column》独立印证了这类问题。

这一条其实和第一节的主题是同一件事：**把规则写进提示词，得到的是倾向，不是保证。** 记忆系统自己也栽在这上面。

**向量粒度过细。** 每条 observation 的每个 fact 都单独 embed 成一个 384 维向量。实测 fact 类 embedding 31754 条 + narrative 5129 条 = 36883 个向量，对应源记录只有 5138 条。144MB 的库、7 倍膨胀，直接后果是检索 top-K 容易被同一条观察拆出来的多个碎片挤占——你要三条不同的相关记忆，返回的可能是同一条记忆的三个片段。

**没有衰减，只有一个 90 天悬崖。** 排序逻辑里根本没有时间项：`buildOrderClause` 要么 `ORDER BY rank ASC`（纯 BM25），要么 `ORDER BY created_at_epoch DESC`（纯时间），不存在 `score = relevance × decay(age)` 这种组合打分。语义检索路径上有个 `RECENCY_WINDOW_MS = 7776e6`（90 天）的**硬过滤**，`.filter(E => E.isRecent)` 直接丢弃，不是降权，而且**没有兜底回落**——过滤后为空就是空，不会退回 SQLite。表现是完全静默的：91 天前的记忆不报错、不提示，就是搜不到。

**`relevance_count` 是死字段。** 前面量命中率那节已经说过：这一列是给访问强化预留的，全库 5138 条全是 0，代码里从无 UPDATE。放在这里再提一次，是因为它和下面这条是同一个病根——写入侧极其勤奋，写完之后就不管了。

**项目串味的风险是结构性的。** 24 个不同项目（我的私人笔记目录、推文目录、公司代码仓）全部混在同一个 `cm__claude-mem` collection 里，隔离完全依赖查询时加 metadata filter。一旦某次 `build_corpus` 漏加 project 过滤，私人内容和公司代码记忆就串了。

**敏感信息明文落盘。** 它自己定义了 `sensitive` / `security_alert` / `security_note` 三种类型（本机已产生 10 / 11 / 6 条），说明设计上预期会捕获敏感内容，但这些内容以明文存在本地 SQLite 和 Chroma 文档里，没看到任何字段级加密。

把这些放在一起看：一个 9 万星、每天都在更新的项目，在"记什么"上做得很勤（每天 160 万 token），在"矛盾了听谁的""什么时候该忘"上是空白。**它把全部工程投入放在了写入侧。**

### Cline Memory Bank：用提示词纪律换连续性

另一个极端。Cline 的 Memory Bank 官方文档写得很清楚：**这不是内置功能**，是一段需要你手动复制进 `.clinerules/` 的自定义指令。

它规定六个固定命名的文件，职责分工明确：`projectbrief.md`（基础需求与目标，其他文件的源头）、`productContext.md`（为什么做、解决什么问题）、`activeContext.md`（当前焦点与近期变更，更新最频繁）、`systemPatterns.md`（架构与设计模式）、`techContext.md`（技术栈、约束、依赖）、`progress.md`（已完成、待完成、已知问题）。

最硬的一条规则是原文的强制语气：

> Cline MUST read ALL memory bank files at the start of EVERY task - this is not optional.

每次任务全读六个文件。token 爆炸是明摆着的代价，文档自己也承认受限于上下文窗口，建议开新对话前先跑一次 "update memory bank" 把知识固化再释放上下文。

但这套方案有一个别人都没有的优点：**记忆就是仓库里的 markdown 文件，可以 diff、可以 git blame、可以 code review、可以 rollback、可以跟着 PR 一起审。** 它不是 AI 背着你长出来的黑盒，是人和 AI 共同维护的外部文档。

Roo Code 继承了这套模式（最初是社区项目 GreatScottyMac/roo-code-memory-bank），Kilo Code 把它收编成官方内置能力（`.kilocode/rules/memory-bank/`，文件简化为 `brief.md` / `context.md` / `history.md`）。

---

## 四、框架派：三种赌注，其中一个刚刚认输

### mem0：赌抽取，然后砍掉了自己的招牌

mem0 是开源记忆层里最流行的（63,902 ★，2023-06-20 建库）。它的经典叙事是两阶段流水线：先从对话抽取候选事实，再让 LLM 把候选和已有记忆比对，输出 ADD / UPDATE / DELETE / NOOP 四类决策。这套架构写在论文里，也是它区别于"无脑追加"的核心卖点。

**这个架构在当前 main 分支已经不跑了。**

`mem0/configs/prompts.py` 里 `FACT_RETRIEVAL_PROMPT` 和 `DEFAULT_UPDATE_MEMORY_PROMPT`（那个带完整 few-shot 的四分类 prompt）还躺着，但在 `mem0/memory/main.py`（3868 行）里全文搜索 `get_update_memory_messages`，**零调用方**。是死代码。

现在跑的是 V3 phased batch pipeline，一条消息进来的实际路径：

```
add(user_id, messages)
 ├─ 取该 session 最近 10 条历史
 ├─ 用新消息做向量检索，捞出 top_k=10 条可能相关的旧记忆
 ├─ 唯一一次 LLM 调用：ADDITIVE_EXTRACTION_PROMPT
 │   输入 = 新消息 + 旧记忆（仅供去重参照）+ 最近 20 条历史（消解代词）+ 真实日期
 │   输出 = 一组新事实，只有 ADD
 ├─ 批量 embedding
 ├─ MD5(text) 与已有记忆做字面哈希比对去重   ← 不是语义判重
 └─ 写向量库 + 写 SQLite history 表（event 固定为 "ADD"）
```

官方迁移文档 `docs/migration/oss-v2-to-v3.mdx` 写得毫不含糊：之前是两阶段 LLM 调用分别负责抽取和决定 ADD/UPDATE/DELETE/skip，新版本收敛成单次调用只抽取新事实，**彻底取消了 UPDATE 和 DELETE 操作**。声称此举让 LOCOMO 分数从 71.4 涨到 91.6，抽取延迟大约减半。

顺带一提，**图记忆已经从开源版彻底移除**。仓库树里搜不到 `mem0/graphs/*.py` 或 `graph_memory.py`，迁移文档原话："graph memory is removed from the open-source SDK. It is not being replaced by an OSS equivalent: graph memory is a Mem0 Platform feature."

其他实现细节：默认向量库 Qdrant，默认 LLM `gpt-5-mini`，默认 embedding `text-embedding-3-small`。`search()` 强制要求 filters 至少含 `user_id`/`agent_id`/`run_id` 之一，否则直接 `raise ValueError`——三级隔离是硬约束，这点比 claude-mem 的软过滤靠谱。**rerank 默认关闭**，阈值 0.1，top_k 20。没有内置的时间或重要性加权，时间信息只在抽取时被写进事实文本本身（把相对时间转成绝对日期），不是检索时的加权因子。

现在说它的赌注。mem0 现在赌的是：**一次 LLM 调用就能把值得记的东西完整抽出来，而"是不是已经记过"这个问题，退化成一次 MD5 哈希比对就够用。**

它把语义级的"这是不是同一件事的更新"降级成了字面精确匹配。失败模式非常直接：

> 你三个月前说"我喜欢吃辣"，今天说"我不吃辣了"。文本不同，MD5 不同，不触发任何更新。两条互相矛盾的记忆并存在库里，检索时全凭向量相似度排序，召回哪条看运气。

把"吃辣"换成"这个项目用 pnpm 不用 npm""这个接口已经废弃了改用新的"，就是 coding agent 每天都在发生的事。

### Graphiti：赌结构留痕，不删只标失效

Zep 的开源核心 Graphiti（30,231 ★）走的是完全不同的路。

它给图上每条边挂两套时间戳：`valid_at` / `invalid_at` 是"这件事在世界里什么时候为真"，`created_at` / `expired_at` 是"系统什么时候知道/纠正了这件事"。双时间轴分开，才能同时支持"用户搬家前的地址是什么"这类历史回溯，和"系统何时学到这个事实"这类审计。

冲突处理是这套架构的核心分歧点：**新信息与旧事实矛盾时，Graphiti 不删旧边，而是给它的 `invalid_at` 打上时间戳。** 旧事实变成"曾经为真、现在失效"，新边照常写入，历史永远可查。

对比一下就很清楚：mem0 是让 LLM 决定"这条要不要被替换掉"（现在连这个都不做了），Graphiti 是在结构层保证"旧的永远留痕、新的永远追加"，模型甚至不需要显式做"要不要忘记"的决策——冲突处理是图更新逻辑自动完成的。

三层结构：episode（原始摄入，每条推导出的事实都能追溯回去）→ entities & relationships（带时间窗）→ community（社区检测聚合层）。社区检测用 label propagation 而不是 GraphRAG 的 Leiden，理由是前者支持增量更新——新数据进来只做局部单步递归，不必全图重聚类。

检索是语义向量 + BM25 + 图遍历三路并行，**检索阶段完全不调 LLM**，Zep 官方给的 P95 约 300ms。

代价是构建成本。有第三方测算 Zep 单次对话的图谱构建可能吃到 60 万 token 量级（对比 mem0 的千级），这个数字来自第三方评测、我没有独立复现，引用需谨慎。但方向上是成立的：结构性留痕不是免费的。

### Letta：赌权限边界

Letta（前身 MemGPT，24,380 ★）的隐喻是操作系统：context window 是 RAM，外部存储是 disk，靠 LLM 自己发起的 function call 在两者间换页。触发换页的是"内存压力"——prompt token 超过窗口某个阈值（论文举例 70%）时，queue manager 插一条系统消息警告即将驱逐，模型据此决定搬什么进 working context、什么写入 archival。

现在的实现分三块：core memory 是常驻上下文的记忆块（persona / human 等 block，不检索、直接拼进 prompt）、archival memory 是按需检索的向量库、recall memory 保存完整交互历史供检索。还有个 sleep-time agent：后台跑的独立 agent，共享主 agent 的记忆块，在空闲期做去重、合并碎片、识别跨对话模式，异步整理不占主 agent 延迟。

有一句流传很广的说法需要纠偏：**Letta 的 agent 并不能编辑自己的 system prompt。** 文档明确把系统指令设为只读，agent 能读写的只是 persona / human 这类记忆块。这两者被有意分开——系统指令保证行为稳定，记忆块承载会演化的状态。这是一条设计出来的安全边界，不是能力欠缺。

它的翻车方式主要是并发写：文档直接写明多个进程同时改同一个 block 时后写覆盖先写，缓解办法是把 block 设只读或收窄写入路径。

### 三种赌注，三种失败模式

| | 谁决定记什么/忘什么 | 赌的是 | 失败方式 |
| --- | --- | --- | --- |
| mem0 | 没人（只加不改） | 抽取一次到位 | 矛盾记忆并存，召回看运气 |
| Graphiti | 结构自动裁决 | 时序留痕 | 图膨胀、构建成本高 |
| Letta | agent 自己，但关在沙箱里 | 权限边界 | 并发覆盖写、人格漂移 |

mem0 赌模型判断力，然后主动放弃了这个赌注；Graphiti 赌结构；Letta 赌边界。

---

## 五、这些数字为什么不能信

写到这里，一个自然的问题是：那到底谁效果好？各家都有 benchmark 数字。

**这些数字基本不能横向比，而且基准本身就有问题。**

LOCOMO 是被引用最多的长对话记忆基准（10 组多会话对话，平均每组 27.2 个 session、588.2 轮、约 1.7 万 token）。Penfield Labs 做了一次审计，结论相当难堪：1540 个问题里 **6.4%（99 个）的答案标注本身是错的**。举例：标准答案要求"法拉利 488 GTB"，但原文只写了 "this beauty"，图片说明也只写"一辆红色跑车"——车型信息只存在于标注者搜图时用的内部检索字段里，**任何记忆系统都不可能"记住"一个从未出现在对话里的事实**。同一份审计还发现 LLM judge 对故意构造的错误答案的接受率高达 63%。

更尴尬的是 Zep 团队指出的另一件事：**把全量上下文直接喂给 LLM、不做任何记忆检索的 baseline，J score 约 73%，反而超过 mem0 自己报告的最佳成绩（约 68%）。** 一个专门设计的记忆系统，打不过"全塞进去"这个笨办法。

然后是双方互相纠错的拉锯战。mem0 论文里给 Zep 的分数是 65.99%；Zep 反驳称对方的评测实现有三处缺陷——把对话双方都设成同一个 user 角色、时间戳被拼进消息正文而不是用专门字段、串行而非并行检索人为拉高延迟——修正后 Zep 是 75.14%±0.17。而在 `getzep/zep-papers` issue #5 里，mem0 又反过来指出 Zep 的计算混入了本应排除的对抗性问题类目，再修正后 Zep 为 58.44%。

三家头部（mem0 / Zep / Letta）在同一个 LOCOMO 上分别报出约 68% / 75-84% / 74%，各自跑自己的 pipeline、自己的 prompt、自己的 judge。**没有哪一方的数字是干净的，横向对比根本不成立。**

顺带，mem0 自己的数字口径也不统一：论文里是"相对 OpenAI 方案 LLM-as-Judge 提升 26%、token 成本降 90%+、p95 延迟降 91%（1.44s vs 17.12s）"，迁移文档里是"LOCOMO 从 71.4 → 91.6"。68 / 71.4 / 91.6 这几个数不能混着当"mem0 的 LOCOMO 分数"引用。

相对靠谱一点的是 LongMemEval（500 个精标问题，五类能力：信息抽取、多会话推理、时序推理、知识更新、拒答）。它的核心发现是商业聊天助手和长上下文模型在这个基准上出现约 **30% 的准确率下降**，并拆出了优化方向：session 级分解索引、事实增强的 key 扩展、时间感知的查询扩展——也就是说"索引怎么切"和"query 怎么改写"比"用什么向量库"更决定效果。

它把"拒答"单列为一类能力这件事，我觉得比分数本身更有价值：**该说"我不知道"的时候敢不敢说，是记忆系统的必测项。**

还有两条背景事实需要放进来，否则容易得出"那不如全塞进上下文"的错误结论：

Chroma 的 Context Rot 报告测了 18 个 SOTA 模型，发现模型不是均匀使用上下文——即便是简单检索和文本复现任务，可靠性也随输入长度持续下降，**在每一个测试的长度档位上都能观测到退化**，不是逼近上限才掉。号称 1M 窗口的模型，5 万 token 处就已经开始腐坏。

NoLiMa 更狠，它排除了"字面词重叠"这个作弊通道：当 needle 和问题之间只有语义关联、没有重复词时，12 个号称支持 128K+ 的模型里 **10 个在 32K token 处掉到短上下文基线的 50% 以下，GPT-4o 从 99.3% 掉到 69.7%**。

把这两条和"全量上下文打赢 mem0"放在一起看，结论是：**全塞进去之所以能赢，是因为 LOCOMO 的对话还不够长、干扰项还不够少。** 那是基准太简单，不是记忆系统没必要。

最后一个空白点：我专门找了编码场景的记忆基准，基本没有。少数例外是 SWE-Bench-CL——把 SWE-Bench-Verified 的 issue 按仓库和时间重组成任务流，引入持续学习里的遗忘 / 正向迁移 / 负向迁移指标，衡量"修了 A 仓库的 bug 之后，这个经验对修 B 任务是帮助还是干扰"。它的可贵之处是有真 ground truth（patch 过不过测试），不靠 LLM judge 打分。

---

## 六、把所有方案摆在一起，缺的是同一块

现在把十几个方案摆开，按"记忆的四个动作"来对：

**写入。** 卷得最狠。hook 自动捕获、LLM 抽取、两阶段筛选、后台异步作业、屏幕录制（Chronicle）。claude-mem 每天烧 160 万 token 在这上面。

**检索。** 也很卷。向量 + BM25 + RRF 融合、图遍历、rerank、两步走的先搜再展开。

**矛盾裁决。** 做的人很少。Graphiti 用双时间轴在结构层解决；agentmemory 有矛盾检测 + 版本链；Copilot 会拿 repo 级事实和当前分支核验一下。剩下的：mem0 主动砍掉了（MD5 字面去重）、claude-mem 没有、官方 memory MCP 是同名实体直接忽略、memory-bank-mcp 是 last-write-wins、Cursor 审批通过后就不管了。

**退场。** 做的人更少。Copilot 的 28 天闲置过期、agentmemory 的 Ebbinghaus 衰减 + superseded 标记、Graphiti 的 `invalid_at`。claude-mem 的 90 天硬截断勉强算，但它是静默丢弃不是主动清理，而且 `relevance_count` 建了不用。（Codex 的出厂 schema 里有对应字段，但我手上没有运行数据，不计入。）

**还有第五个动作，几乎完全空白：观测。** 第一节量命中率那三条死路不是 Claude Code 独有的窘境，是整个品类的现状——你无法知道一条记忆被召回过几次。这一条和"退场"是死锁关系：想淘汰没用的记忆，得先知道哪条没用；想知道哪条没用，得有召回计数；而召回计数没人做，于是退场只能退回到定时过期这种粗糙近似。**两件事互为前提，一起烂在那儿。**

学术侧也是一样的偏斜。近期综述明确把遗忘分成被动衰减和主动删除，并论证主动遗忘在效率（剪枝）、质量（更新过时信息）、安全（清除污染）三个维度都有收益。但"遗忘"相比"写入"和"检索"，研究热度明显低一个量级。

**为什么这块最难？** 我的判断是：写入和检索都是"找相似"，而矛盾裁决和退场需要"判断否定"。

向量检索的整个数学基础是相似度。而"我不吃辣了"和"我喜欢吃辣"在 embedding 空间里高度接近——语义相似，语义方向相反。同理，"我上次为什么否决了 X 方案"和"我上次选择了 X 方案"距离很近。LongMemEval 把时序推理和知识更新单列，正是因为这两类是相似度检索的结构性盲区。

除非系统显式建模了"取代关系"——这正是 Graphiti 用图结构而不是纯 embedding 的动机——否则纯相似度检索无法判断两条矛盾记忆里哪条是最新有效的。

而这件事一旦没做，后果不是"少记了点东西"，是**记忆会自我强化错误**。这不需要外部攻击者，系统自己就会产生：agent 把一次误诊的 bug 根因当成"经验"存进长期记忆，之后每次遇到类似报错都复用这个错误结论，而且因为它被复用得多，在任何"访问强化"机制下还会排得更靠前。

有攻击者的版本也已经不是理论。SpAIware（2024，有厂商响应的公开案例）的路径是：攻击者通过一段被 ChatGPT 读到的不可信内容注入提示，指令被写入长期记忆后，**后续所有新会话都携带这条恶意指令**，可持续外泄用户输入和模型回复。同一团队 2025 年披露了 Windsurf IDE 的类似漏洞。

这条对 coding agent 尤其现实：agent 每天都在读 README、issue、代码注释——这些恰好是不可信输入最常见的落点。一旦写进跨会话记忆，影响就不止一次对话。

最后是删除的彻底性。在向量索引 + 图结构 + 摘要衍生物并存的系统里，"删干净"往往做不到——摘要和反思节点可能已经把原始敏感信息揉进了更高层的归纳里，删掉原始条目不代表衍生结论也被清除。这一条的公开研究相比攻击面研究少得多，是整篇里证据最薄弱的部分，我只能标出方向。

---

## 七、一个好的记忆系统应该长什么样

综合上面所有材料，我认为分歧不在技术选型（向量还是图、SQLite 还是 markdown），而在四个设计决策上。

**第一，分层，别把不同寿命的东西塞进一个库。**

认知科学那套 episodic / semantic / procedural 的划分被 agent 领域借用得很泛滥，但对编码场景有一个非常实际的用处：**"这个 bug 是这么修的"和"这个项目用 pnpm"需要完全不同的写入、检索和失效策略。** 前者是一次性事件，价值随时间衰减，适合向量检索；后者是长期约定，要么有效要么被推翻，不该参与相似度排序，应该常驻或按路径精确匹配。

claude-mem 把 24 个项目、9 种（实际 150 种）类型全塞进一个 Chroma collection，问题就出在这——它只有一层。Letta 的 core / archival / recall 三分是对的方向，Cline Memory Bank 的六个固定文件其实也是一种朴素分层（`projectbrief` 长期不变，`activeContext` 频繁更新）。

**第二，可见、可审计、可回滚，优先于自动化程度。**

这是我看完所有方案后最强的一个判断。Cline Memory Bank 在技术上是最土的——纯 markdown、每次全读、token 爆炸、纯靠提示词纪律，甚至不是产品功能。但它的记忆能 diff、能 blame、能 review、能跟着 PR 一起审、能回滚。

对比 Cursor Memories：后台自动提炼、有审批环节（这点比大多数强），但通过之后就是个黑盒条目，没有历史、不进 git、不跨团队。

自动记忆的价值上限，取决于你能不能在它记错的时候发现并改掉。**记错了看不见，比不记更糟——因为你不知道该纠正什么。**

那位攒了 74 个 feedback 文件的用户之所以能提出那个 issue，恰恰是因为 Claude Code 的 auto memory 是明文 markdown，他能数得出来。

**第三，矛盾必须显式建模，不能交给检索排序。**

这是我认为最欠缺、也最值得投入的一块。最低标准是：当新信息与旧记忆冲突时，系统要产生一个**显式的、可查询的取代关系**，而不是让两条并存、由向量相似度随机决定召回谁。

实现上有几个档位，成本递增：

- 最低：记忆带版本号和 `superseded_by` 字段，新记忆写入时标记旧的（agentmemory 的做法）
- 中等：双时间轴，不删只标 `invalid_at`，历史永远可查（Graphiti 的做法）
- 更进一步：Codex schema 里那个 `selected_for_phase2_source_updated_at`——源变了就知道派生的记忆过期了，这是把失效检测做到了依赖追踪层面

反过来，mem0 用 MD5 字面哈希判重是明确错误的方向：它把一个语义问题降级成了字符串问题。

**第四，退场机制要基于事件，不是基于定时。**

Copilot 的 28 天闲置过期值得肯定，因为它至少做了。但定额过期是个粗糙的近似：一条"本项目禁止使用 lombok"的约定，30 天没被用到不代表它失效了；而一条"当前正在重构 X 模块"的上下文，可能三天就该退场。

更好的触发源是事件，不是时钟：

- 被纠正 → 立即失效（这是最强的信号，用户明说了）
- 源头变了 → 标记待重验（Codex 那个字段的思路）
- 与新记忆矛盾 → 走裁决流程
- 长期零召回 → 降权而不是删除（claude-mem 的 `relevance_count` 如果真的在写，就能支持这个）
- 定时过期 → 只作为最后兜底

这五条里有四条需要"这条记忆最近被用过吗"这个信号。所以**可观测不是记忆系统的锦上添花，是退场机制的前置条件**——这也是为什么我把它单独列进了下面的清单，而且排在很靠前的位置。

### 检查清单

如果要评估一个 agent 记忆方案（或者自己动手做一个），我会按这几条打分：

1. **写入可见吗？** 每条被记下的东西，能否追溯到具体是哪次对话、哪个操作触发的。
2. **召回可数吗？** 能不能查到某条记忆被召回过几次、最近一次是什么时候。这条我放在第 2 位，因为它是第 4、第 5 条的前提——数不出来，就只能拿时间当代理变量瞎猜。**目前主流方案基本全不及格。**
3. **矛盾怎么裁决？** 新旧冲突时是显式建模取代关系，还是任由检索随机返回一条。
4. **能回答否定式和时序式查询吗？** "我上次为什么没选 X""最新的配置是什么"——纯相似度检索大概率在这里失手。
5. **失效的记忆怎么退场？** 有没有基于事件的失效机制，而不只是 TTL；被纠正过的错误结论是真的清除了，还是只是被盖过。
6. **删除彻底吗？** 删一条原始记忆时，它衍生的摘要、反思、图节点是否一并清理。
7. **扛得住污染吗？** README / issue / 代码注释这些不可信输入，能否被写进长期记忆并影响后续会话，写入前有没有信任边界校验。
8. **隔离是硬约束还是软过滤？** 多项目混库时，漏加一次 filter 会不会串味（mem0 的 `raise ValueError` 是硬约束，claude-mem 的 metadata filter 是软过滤）。
9. **成本量级心里有数吗？** 每天有多少 token 花在记忆维护上，值不值。
10. **性能数字的复现条件透明吗？** backbone 模型、检索预算、judge 方式是否公开，有没有和"不做记忆、直接全量上下文"这个笨办法对比过。
11. **测的是"记得住"还是"用得上"？** 能在需要综合历史状态做决策的任务里体现价值，还是只会做问答式回忆。

---

## 我们能做的

先把预期调对。现在没有一个方案能真正"记住你的习惯"，包括我这台机器上装的那个 9 万星插件。所有方案在写入和检索上都做得不错，在矛盾裁决、退场和观测上普遍空白，而这三件才是"习惯"这个词的重点——习惯会变，变了之后旧的得退场；而要判断该退什么，先得知道哪条在被用。

也别再纠结"命中率高不高"这个问题了。我花了半天想量它，三条路全堵死。这不是你没找到方法，是这个数字在当前的产品形态下不存在。与其猜，不如把判断依据换成可观察的东西：同一条纠正你说了几次。这个数你自己数得出来，而且比命中率更直接——说第二次就说明第一次没生效，至于是没记、没召回还是没照做，再往下查。

短期能做的几件事：

**把硬约束和记忆分开。** 真正不能违反的规则不要指望写进 CLAUDE.md 或任何记忆系统——那是给模型看的建议，官方文档自己都这么说。用 hook（PreToolUse）做拦截。记忆只负责"让它知道"，hook 负责"不让它做"。

**给记忆文件设保质期，并且真的去清。** Claude Code 的 auto memory 是明文 markdown，这是它的优点——你能打开看、能删。定期扫一遍 `~/.claude/projects/*/memory/`，把已经不成立的删掉。别让它自己长到 74 个文件才发现问题。

**想要可观测，就得自己搭一层。** 如果你真的在意哪条规则在起作用，别指望现成方案给你数据。最土也最有效的办法是给关键规则加可验证的锚——比如让它输出时带一个约定标记，或者干脆写成 hook 做硬拦截（拦截失败会报错，那就是可观测的）。把"模型有没有遵守"变成一个二值信号，比追踪"记忆有没有被加载"现实得多。

**多项目混用时确认隔离方式。** 如果你在同一台机器上既处理公司代码又写个人笔记，装记忆插件前先看清它的隔离是硬约束还是查询时的软过滤。claude-mem 是后者，24 个项目共用一个 collection。

**成本心里有个数。** 我这里 14 天 2235 万 token 走 haiku。走订阅额度不单独出账，但它会挤占你的额度。

**看到 benchmark 数字先问三件事：谁测的、backbone 是什么、有没有和全量上下文的 baseline 比过。** 一个连"全塞进去"都打不过的记忆系统，数字再好看也没意义。

**要自己做的话，先做第 2 条和第 4 条。** 写入和检索有大量现成方案可抄，矛盾裁决和退场没人替你做，而它们决定了这个系统三个月后还能不能用。

---

## 参考

**官方文档**
- [How Claude remembers your project — Claude Code Docs](https://code.claude.com/docs/en/memory)
- [Memory tool — Claude Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)
- [Managing context on the Claude Developer Platform](https://claude.com/blog/context-management)（2025-09-29，29% / 39% / 84% 数据出处）
- [Effective context engineering for AI agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [AGENTS.md 规范](https://agents.md/)（现由 Linux Foundation 下 Agentic AI Foundation 托管）
- [Migrate to the Responses API — OpenAI](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [About GitHub Copilot Memory — GitHub Docs](https://docs.github.com/en/copilot/concepts/agents/copilot-memory)
- [Copilot Memory supports user preferences — GitHub Changelog](https://github.blog/changelog/2026-05-15-copilot-memory-supports-user-preferences-for-pro-pro-users/)
- [Rules — Cursor Docs](https://cursor.com/docs/context/rules) / [0.51 Memories — Cursor Forum](https://forum.cursor.com/t/0-51-memories-feature/98509)
- [Cascade Memories — docs.devin.ai](https://docs.devin.ai/desktop/cascade/memories)（已标记为 legacy）
- [Memory Bank — Cline Docs](https://docs.cline.bot/best-practices/memory-bank)
- [Letta Memory Blocks](https://docs.letta.com/guides/agents/memory-blocks/) / [Sleep-time agents](https://docs.letta.com/guides/agents/architectures/sleeptime/)

**源码**
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem)（91,627 ★，issue #3695 unenforced concepts vocabulary）
- [mem0ai/mem0](https://github.com/mem0ai/mem0)（63,902 ★，`mem0/memory/main.py`、`mem0/configs/prompts.py`、`docs/migration/oss-v2-to-v3.mdx`）
- [getzep/graphiti](https://github.com/getzep/graphiti)（30,231 ★）
- [letta-ai/letta](https://github.com/letta-ai/letta)（24,380 ★）
- [modelcontextprotocol/servers — memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)（`search_nodes` 子串匹配实现）
- [rohitg00/agentmemory](https://github.com/rohitg00/agentmemory)（27,325 ★，矛盾检测 + 版本链）
- [basicmachines-co/basic-memory](https://github.com/basicmachines-co/basic-memory)（3,732 ★）
- [Aider-AI/aider](https://github.com/Aider-AI/aider)（48,437 ★，`aider/repomap.py` tree-sitter + PageRank）
- anthropics/claude-code issues [#18660](https://github.com/anthropics/claude-code/issues/18660)、[#46724](https://github.com/anthropics/claude-code/issues/46724)、[#41830](https://github.com/anthropics/claude-code/issues/41830)

**论文与评测**
- [Generative Agents: Interactive Simulacra of Human Behavior (arXiv:2304.03442)](https://arxiv.org/abs/2304.03442)
- [MemGPT: Towards LLMs as Operating Systems (arXiv:2310.08560)](https://arxiv.org/abs/2310.08560)
- [Zep: A Temporal Knowledge Graph Architecture for Agent Memory (arXiv:2501.13956)](https://arxiv.org/abs/2501.13956)
- [Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory (arXiv:2504.19413)](https://arxiv.org/abs/2504.19413)
- [A-MEM: Agentic Memory for LLM Agents (arXiv:2502.12110)](https://arxiv.org/abs/2502.12110)
- [HippoRAG (arXiv:2405.14831)](https://arxiv.org/abs/2405.14831)
- [LOCOMO (arXiv:2402.17753)](https://arxiv.org/abs/2402.17753) 与其审计 [We audited LOCOMO](https://dev.to/penfieldlabs/we-audited-locomo-64-of-the-answer-key-is-wrong-and-the-judge-accepts-up-to-63-of-intentionally-33lg)
- [LongMemEval (arXiv:2410.10813)](https://arxiv.org/abs/2410.10813)
- [NoLiMa: Long-Context Evaluation Beyond Literal Matching (arXiv:2502.05167)](https://arxiv.org/abs/2502.05167)
- [Context Rot — Chroma Research](https://www.trychroma.com/research/context-rot)
- [Lies, Damn Lies, and Statistics: Is Mem0 Really SOTA in Agent Memory? — Zep](https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/) 与 [getzep/zep-papers issue #5](https://github.com/getzep/zep-papers/issues/5)
- [SpAIware: ChatGPT macOS 持久化数据外泄 — Embrace The Red](https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/)

**本机实测（2026-08-24）**
- `~/.claude/projects/*/memory/`（Claude Code auto memory 目录结构与 frontmatter）
- `~/.claude-mem/claude-mem.db`、`~/.claude-mem/chroma/`（claude-mem 13.15.3 表结构与统计）
- `~/.claude/plugins/cache/thedotmack/claude-mem/13.15.3/`（hooks.json、modes/code.json、worker-service.cjs）
- `~/.codex/memories_1.sqlite`（**空表，仅 schema，无运行数据，不作为实现证据**）；二进制来自 `~/.vscode/extensions/openai.chatgpt-26.818.41705-darwin-arm64`，VS Code 扩展捆绑，不在 PATH
