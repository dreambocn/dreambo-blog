---
title: DeepSeek-Harness-架构实测
date: 2026-08-19
updated: 2026-08-19
categories:
  - AI
  - 工具与框架
tags:
  - DeepSeek
  - Harness
---
# DeepSeek Harness：把 agent 循环也做成插件之后

## 概述

DeepSeek 在 8 月 13 日开源了自己的 agent harness，叫 `dsh`。README 第一行就把话说完了——**everything is a plugin**。这话听着像口号，但它的意思比一般项目狠得多：模型适配器、工具注册表、会话日志、沙箱都是插件，**agent loop 自己也是插件**，整个系统里没有一个"内核"在那儿等着你去打补丁。底座是 Cordis，一个 IoC/依赖注入框架，作者还专门写了篇 paper 讲"时空可组合性"。

- 仓库：https://github.com/deepseek-ai/deepseek-harness
- 协议：MIT ｜主要语言：TypeScript（另有 Python SDK 与一个 Rust/C 的 native 包）
- Star：158,665 / Fork：16,520 / Watch：656（2026-08-18 取数）
- 发布版本：`@deepseek-ai/dsh@0.1.0-rc.7`（2026-08-17）
- 状态：**developer preview**，README 用全大写写明"会有破坏性变更"
- 仓库规模：238 个 workspace 包；源码 23.0 万行 TS/TSX，**测试 29.3 万行**（测试比源码还多）

**一句话判断**：现在别拿它当日常工具用。但如果你想知道一个生产级的 agent harness 到底该怎么建，这是眼下能公开读到的最完整的一份材料——而且最该抄的不是它的架构，是它用来管住 AI 写代码的那套门禁。

我把仓库整个拉下来读了一遍（202MB、12,404 个 commit），发布版跑通了，源码也从头装、构建、跑了一遍测试。下面说的都是这么看下来的结论，不是转述 README。

---

## 一、先看它是怎么长出来的

GitHub 上这个仓库是 8 月 13 日创建的，但你 clone 下来一看 git 历史，第一个 commit 在 6 月 10 日：

```
2026-06-10 Tianyi Cui  Initialize repo with README, AGENTS.md, and CLAUDE.md symlink
2026-06-10 Tianyi Cui  Link MVP requirement analysis and microkernel architecture docs in AGENTS.md
2026-06-11 Tianyi Cui  Set up monorepo infra: Yarn 4 workspaces, tsc -b + dumble build, vitest
2026-06-11 Tianyi Cui  Vendor Cordis framework packages as source
```

换句话说：**他们私下做了 64 天，8 月 13 日才带着完整历史一次性公开**。12,404 个 commit 里有 12,345 个发生在公开之前，公开之后这 4 天只多了 59 个。中间最猛的一天是 7 月 30 日，一天 887 个 commit；整个过程合了 1008 个 PR。

另外注意前两个 commit 干的事：第一个建了 `AGENTS.md` 和指向它的 `CLAUDE.md` 软链，第二个就把"微内核架构文档"挂进了 AGENTS.md。这不是事后补的文档，是先立契约、再写代码。

但更能说明问题的是分支名。我把 merge commit 里的分支前缀统计了一下：

| 分支前缀 | 数量 |
|---|---|
| `worktree/*` | 216 |
| **`codex/*`** | **205** |
| `fix/*` | 93 |
| `feat/*` | 93 |

205 个 `codex/` 分支——他们在用 OpenAI 的 Codex 造自己的 harness。仓库里还同时躺着 `CLAUDE.md → AGENTS.md` 和 `.claude/skills → .agents/skills` 两个软链。再看 `packages/subagent/`，有两个包直接把竞品做成了自己的子 agent provider：

- `dsh-subagent-claude-code` —— 依赖 `@anthropic-ai/claude-agent-sdk@0.3.220`，把 Claude Code 当子 agent 调
- `dsh-subagent-codex` —— 依赖 `@openai/codex@0.147.0`

串起来就是：**DeepSeek 用 Codex 和 Claude Code 造出了自己的 harness，然后顺手把这两个东西做成了自己 harness 里可插拔的子 agent。** 这件事比任何架构图都更能说明他们那句"everything is a plugin"是认真的。

---

## 二、"everything is a plugin"有三处可以当场验证

这种口号一般都经不起查。这个能查，而且不用读源码，装完发布版直接跑一条命令就行：

```bash
npx -y @deepseek-ai/dsh@latest --profile web --dump-default-config
```

跑出来是一棵 **129 行的插件树**，每一行还标了它是从哪一层来的：

```yaml
# == @deepseek-ai/dsh-base
- id: llm
  name: '@deepseek-ai/dsh-llm'
- id: session
  name: '@deepseek-ai/dsh-session'
# == @deepseek-ai/dsh-base, patched by @deepseek-ai/dsh-web-app
- id: hmr
  name: '@deepseek-ai/cordis-plugin-hmr'
  config:
    root: ['.']
  disabled: true
...
- id: agent-loop
  name: '@deepseek-ai/dsh-agent-loop'
  config:
    agents: []
```

**`agent-loop` 就是其中一行。** 把 `name` 换掉，你就换掉了整个 agent 循环——不需要 fork，不需要打补丁。

组合是一层层叠上去的：先是 profile（一个起了名字的组合），它列出要叠哪几个 bundle；然后叠你自己的 `cordis.patch.yml`；最后还能用 `--patch` 再盖一层。每一层都按 row 的 `id` 找目标，找到就把那一行的 config 整块换掉。最底下那层 `dsh-base` 有 79 行，`dsh-web-app` 和 `dsh-headless` 各自往上叠自己那部分。

第三处验证在浏览器里。打开 web UI，看首页 HTML 的 `window.__DSH_BOOT__`：

```json
{"id":"@deepseek-ai/dsh-client-ui-conversation",
 "url":"/plugins/@deepseek-ai/dsh-client-ui-conversation/client.js?rev=ed9baf16da8e",
 "inject":["@deepseek-ai/dsh-client-connection","@deepseek-ai/dsh-client-locale",
           "@deepseek-ai/dsh-client-runtime","@deepseek-ai/dsh-client-ui-settings",
           "@deepseek-ai/dsh-api-remotes","@deepseek-ai/dsh-client-ui-layout"]}
```

**前端也是一棵带依赖注入的插件树**，38 个客户端插件，每个都声明自己要 inject 谁：conversation、tool、skill、subagent、jobs、goal、plan、trajectory、workspace、deliverables、settings-models……说白了，对话框里每一类卡片都是一个能卸掉的包。

---

## 三、真正值钱的那条设计：模型可见 ⟺ 已记录

如果只能从这个仓库里带走一样东西，我会带这条。

在 `AGENTS.md` 里，这是一条硬约束：

> **Model-visible ⟺ logged**：anything that reaches a model request must be reconstructable from the session log; a new model-visible input requires a session event.

说人话就是：**凡是能进到模型请求里的东西，都必须能从会话日志里完整重建出来。**想给模型加一个新的可见输入？那就得同时加一个会话事件。没有例外，也没有"我先临时塞一段进 prompt"这种操作。

会话日志是一条只能追加的事件流，`deriveMessages()` 负责从它投影出模型看到的那份历史。fork、resume、导出 transcript、遥测、持久化，全都是从这一条流派生出来的。

关键在于，这不是文档里的一句自律，而是**运行时断言**。`packages/core/agent-loop/src/invariant.ts`：

```ts
ctx.on('llm/stream', (options: GenerateOptions, next) => {
  if (!isAgentLoopRequest(options)) return next()
  if (!Object.isFrozen(options)) fail('a loop-built request must be frozen')
  ...
  const expected = session.deriveMessages()
  if (JSON.stringify(options.messages) !== JSON.stringify(expected)) {
    fail(`llm request for session "..." diverges from the dispatch-time durable
          derivation (log-reconstruction desync)`)
  }
  const headerMatches = options.model === header.config.model
    && options.system === header.system
    && options.temperature === header.config.temperature
    && options.maxTokens === header.config.maxTokens
    && JSON.stringify(options.tools ?? []) === JSON.stringify(header.tools ?? [])
  if (!headerMatches) fail(`... diverges from the folded request header`)
  return next()
}, { global: true, prepend: true })
```

每一次发往模型的请求，都会在 `llm/stream` 这个事件上被拦下来做**逐字节比对**。实际发出去的那份 `messages`，跟从持久化日志重新推出来的 `messages`，必须一模一样。模型名、system prompt、temperature、maxTokens、tools schema，也都得跟日志里记下的 request header 对得上。`prepend: true` 的注释写得很清楚——放在链首，防止某个短路的 replay 监听器把这个检查吞掉。

这条为什么值钱？因为**调 agent 的时候最难回答的问题，永远是"模型到底看到了什么"**。上下文注入、历史压缩、各种提醒、政策文本、子 agent 的汇报，每一个都有机会悄悄改写模型的输入，而你在日志里看不见它们。这条不变量把"看到的"和"记下的"焊成了同一件事：不可能存在一个日志里没有、但模型看到了的东西。

更狠的是覆盖面：**238 个包里有 219 个各自带了一个 `invariant.ts` 伴生插件**，注册自己那份运行时自检。而且注册中心默认就是 `enabled: true`，不是只在测试里开着玩。`AGENTS.md` 连自检该检什么都规定了：

> Runtime invariants assert owned relationships. Check authoritative event streams or mutable data, not service or method presence, plugin metadata or effects, or fixed pure examples.

顺便说一个时间上的巧合：EU AI Act 对高风险系统的义务 8 月 2 日起可执行了，要求有能"完整重建系统做了什么、何时做、基于什么"的自动事件日志。这套架构天生就长成那个形状——我不觉得他们是为合规做的，但确实正好踩上了。

---

## 四、capability seam：换一个 provider，整个产品跟着换

它对"什么才算一层抽象"卡得很死。一个 **seam**（缝）必须凑齐三个角色，少一个就不算：

| 角色 | 职责 |
|---|---|
| Service Definition | 声明接口（做什么） |
| Service Provider | 实现（怎么做） |
| Consumer | 使用者，通常是一个面向模型的工具 |

所以 `spill`（工具输出太大时先写到磁盘、只给模型一个定位符）拆成了三个包，`compaction`（历史压缩）也是三个包。乍看很啰嗦，换来的是这个：

**文件系统和子进程两个 provider 共享同一个"执行世界"，所以把它们指向一个远端沙箱，Bash、PTY、LSP 会一起搬过去，不需要给任何 consumer 开分叉。**

最能说明这套抽象有多能扛的是 subagent——8 个 provider 挂在同一个接口后面：

```
subagent-fork-in-process    进程内 fork（继承父上下文）
subagent-spawn-in-process   进程内新建
subagent-claude-code        走官方 Claude Agent SDK 调 Claude Code
subagent-codex              调 Codex
subagent-acp                走 Agent Client Protocol
subagent-dsh-sdk            走自己的 JSON-RPC SDK
```

从"在进程里 fork 一个子 agent"，到"把这一轮活直接外包给另一家的产品"，在调用方眼里是同一个接口。

第二个例子是 `tool-ralph`。Ralph 就是那个"每一轮都起一个全新的 agent、只给它一个不变的目标、把工作区当长期记忆"的玩法。换别家大概会把它做成 loop 里的一个 mode，这里它就是**一个普通的工具包**——README 第一段专门点了这件事：

> no Ralph mode or fresh-agent loop is added to `agent-loop`

第三个例子最野：`tool-cordis` 给模型五个工具——`cordis_inspect` / `cordis_define` / `cordis_run` / `cordis_stop` / `cordis_undefine`——**让模型检查、然后改写自己正跑在里面的那个运行时**。模型可以写一个插件（host 半边加 browser 半边），挂进当前进程，甚至往 web UI 的插槽里塞一个自己写的组件。仓库里有个 `pnpm run demo:cordis` 就是演示这个。

他们描述这个功能的措辞我很欣赏，一点没往大了说：

> The sandbox isolates globals but is not a security boundary. ... **Treat this toolset like bash access.**

---

## 五、沙箱：正好撞上这一周的"沙箱逃逸周"

时间点撞得很巧。7 月 Pillar Security 一口气披了六个 AI coding agent 的沙箱逃逸，Cursor、Codex、Gemini CLI、Antigravity 全在里面，修复在八月陆续落地。其中 CVE-2026-48124 就是那个「工作区里放个 `.claude` hook 配置，就能拿到非沙箱命令执行」。那批漏洞的根因是同一个：**没有一个是把沙箱本身打破了，全部是钻了"沙箱管住的范围"和"沙箱外某个可信组件之后会去读、去执行什么"之间的缝**。

带着这个视角去看 dsh 的沙箱（`packages/sandbox/sandbox-local`），有几处对得上得挺巧：

- **Linux**：先探一下 `bwrap` 能不能用，不行就走 **Landlock**——为了这个他们自己写了个 native 包发到 npm 上（`@deepseek-ai/node-addon-landlock-run`，先自我限权再 exec 的那种启动器）。
- **macOS**：Seatbelt。profile 写成 **allow-default 加一条 `(deny file-write*)`，然后再往回开写白名单**。`read-only` 模式下白名单里只有 `/dev/null` 一个字面量；`workspace-write` 才加上工作区根、`/tmp` 和 `os.tmpdir()`。每个根都先做一遍路径规范化，因为 Seatbelt 匹配的是解析后的路径——在 macOS 上 `/tmp` 其实就是 `/private/tmp`。
- **Windows**：受限令牌加 ACL，每个 session/workspace 组合分一个随机的私有临时目录和独立 SID，彼此看不到对方的。
- 探测失败、或者平台压根不支持，就直接 `SANDBOX_UNAVAILABLE` **失败退出**。这句他们写得很硬：执行绝不会悄悄退化成无约束运行。

再回头看那批漏洞：Antigravity 栽在**黑名单式**的 Seatbelt profile 上，Cursor 栽在 **git metadata 的路径间接**绕过了按路径写的规则。而这里正好是白名单，正好做了路径规范化。

更少见的是，它把自己的短板也摊开写了：

> - **Windows ACL enforcement is partial** —— 受限令牌必须保留 Everyone 才能完成进程初始化，外部对象若授予 Everyone 写权限仍可写；NTFS 硬链接也能把一个文件对象别名到工作区外。所以上报 `enforcement: 'partial'` 而不是谎称 full。
> - **Landlock may be partial** —— 老内核 ABI 只能约束它暴露的访问类别。
> - **Seatbelt depends on deprecated `sandbox-exec`** —— 苹果标了废弃但每个 macOS 还在发；靠功能探测来 fail closed。

还有一条限制我得单独拎出来，因为它直接决定了这个沙箱到底能防住什么：

> **File-effect modes only** —— `SandboxMode` 只管文件效果，网络与进程策略不在它的词汇表里，所以这里没有任何开关能限制它们。

翻译一下：就算你开了 `read-only`，agent 照样能联网。想防数据外传，得在别的层做，别指望这个开关。

### 它自己也有一个 config-as-code 面

话说回来，dsh 自己也有一处和那批漏洞同源的东西：配置里的 `!!js` 表达式。

```yaml
- id: sandbox-policy
  config:
    mode: !!js process.env.DSH_PERMISSION_MODE ?? 'workspace-write'
    workspaceRoot: !!js process.cwd()
```

求值的代码在 `vendor/loader/src/config/utils.ts`，翻开一看就是 `new Function` 加 `with (ctx) { eval(expr) }`，没有任何沙箱。不过他们做了三件事把这个面收窄。一是 `!!js` **只在插件 `config` 和 entry 的 `disabled` 这两个位置生效**；二是 `verify-cordis-config` 门禁会拒绝表达式出现在别处；三是配置文件只从 `$DSH_HOME` 下的 profile 目录读，而不是从 agent 干活的那个工作区读——这一条最关键，它意味着 agent 写不到能被 eval 的地方去。

而且这个特性已经咬过他们一次了——`docs/postmortem/0002` 就是它，下面单独讲。

### 一个做对了的细节

dsh 带了 Claude Code 和 Codex 的 hook 桥（`packages/hooks/`），你现有的 `hooks.json` 能直接跑。但它**默认不挂载**，而且必须你显式给一个 `configPath`——**它不会自己跑去工作区里翻 `.claude/`**。这跟 CVE-2026-48124 的形状正好是反的。

---

## 六、这份仓库最该被抄的：把 AI 写代码的失效模式变成门禁

前面聊的都是架构。但如果你们团队也在让 agent 大批量写代码，下面这六条对你的用处比架构大——它们其实都在回答同一个问题：**代码由机器高速产出的时候，哪些事必须变成机器能查的门禁，而不能指望人去 review？**

### 1. 逐文件 100% 覆盖率

`vitest.config.ts`：

```ts
thresholds: {
  perFile: true,
  statements: 100, branches: 100, functions: 100, lines: 100,
}
// 100% or it doesn't merge (docs/testing.md: excessive tests are welcome)
```

注意是**逐文件** 100%，不是整体 100%，四个维度全满才让合。这就解释了为什么**测试代码（950 个文件、29.3 万行）比产品代码（1401 个文件、23.0 万行）还多**，比例 1.27 : 1。

`docs/testing.md` 里解释了这条为什么不是在刷指标，这段是重点：

> An uncovered line is often **dead code the gate is correctly flagging for deletion**, not a missing test to bolt on. Line coverage is necessary, never sufficient — it proves lines ran, not that the feature works as shipped.

没被覆盖的那行，往往说明它本来就该删，而不是该补个测试去盖住它。这个判断方向对 agent 写的代码尤其成立——机器最擅长的事情之一，就是顺手多写几个根本用不上的分支。

### 2. 假设 agent 会作弊，据此设计断言

同一份文档里的两条：

> **Verify the world, not the self-report.** An e2e assertion re-runs the command or re-reads the file externally; **a keyword probe on the agent's own output lets a cheating agent pass.** Assert untouched files are byte-identical.

> **We are DeepSeek — do not ration real-API tests.** A no-key test proves plumbing; only a with-key run proves the agent works against a real model.

第一条我建议直接抄进团队规范：**验证世界，别验证自述**。断言得自己重新执行一遍命令、重新读一遍文件，而不是在 agent 的输出里搜关键词——不然一个会作弊的 agent 轻轻松松就过了。顺带还得断言那些本该没被碰过的文件逐字节没变。

第二条是模型厂才有的特权，不过那句自嘲挺可爱："我们是 DeepSeek，别省真实 API 测试。"

### 3. 文档字数预算，且只能往下棘轮

这条我以前真没见过谁做成 CI 门禁。`scripts/doc-budgets.manifest.json`：

```json
{
  "AGENTS.md": 1950,
  "docs/AGENTS.md": 1320,
  "docs/architecture.md": 2400,
  "docs/cordis-primer.md": 600,
  "docs/testing.md": 1150
}
```

`scripts/verify-doc-budgets.ts` 的头注释：

> Enforce `wc -w`-style ceilings. ... **Ceilings ratchet down with at least 5% headroom; raising one requires the justification defined in `docs/AGENTS.md`.**

也就是说：常驻文档有字数上限，这个上限只准往下调（还得留 5% 余量），想往上调得先给理由。为什么要这么干，想一下就明白——**AGENTS.md 这类文件每开一次会话都要进上下文，它胖一点，你就按 token 按次多交一次税。** 让它无限长下去，是最容易发生、又最不容易被人注意到的那种浪费。

### 4. `dsh-trim-cot-leakage`：把"agent 写的散文会怎么烂"编成了一个 skill

`.agents/skills/` 下面有 11 个项目自己的 skill（`.claude/skills` 是指过去的软链，所以 Claude Code 和别的 agent 共用同一份）。这里面最值得看的是这个——它给一个我早就有感觉、但没见过谁给它起名字的问题起了名字：**chain-of-thought leakage，思维链泄漏**。

> 视角属于"写作时那次会话"而不是"仓库"的散文：引用只有那次会话能看到的东西、叙述变更而非陈述状态、或者在和一个已经离场的 reviewer 争论。

它给了一个单一判据：

> 对每一段可疑文字问：**一个站在 HEAD、拿不到任何会话记录、PR 讨论、未提交草稿的读者，能否解析每一个引用、验证每一个断言？** 不能，就把还活着的事实用仓库的视角重述一遍，其余删掉。

接着是一份八类清单，挑几条给你看：

1. **死的设计会话引用** —— `(decision 7)`、`design §4.7`、阶段标签 `T4`/`W3`
2. **stack 与 PR 视角** —— "a later PR in this stack"、"this PR adds"、"the previous commit"
3. **变更叙述与版本戳** —— "used to"、"no longer"、"the old X"、"this cut"、"now"
4. **评审编排** —— "Rejected in review:"、"the reviewer confirmed"
5. **对 reviewer 的辩解** —— "这个 cast 是安全的，它只是……"（一段为自己正确性辩护的注释，说明它在对 reviewer 说话，不是对维护者）
6. **推导过程转录** —— "先 X 然后 Y" 的控制流叙述、测试走查
7. **含糊与计划残留** —— "probably fine for now"、没有 marker 的延后
8. **写作语言串味** —— 英文散文里残留的中文片段（它举的例子是 `端`、`设计稿`、`---- 私有 ----`）

同样难得的是，它还写了一份"**这些不算泄漏**"的清单，专门防清理过头。挑几条：

- issue 引用（`#1470`、`TODO(name):`）在 HEAD 上能解析，留着；
- `oxlint-disable ... -- reason` 这类抑制理由属于必须写的散文，理由写错了是去修，不是删掉；
- "without X, Y happens" 这种反事实的回归钉子，保留；
- "(measured: 512 nests ≈ 0.15s)" 里那个 "measured" 是承重词，删了这个数字就没来源了。

这东西和我们自己那份 `no-redundant-comments.md` 其实是同一件事的两个版本。我们那份管的是"复述代码"和"给自己的改动写注释"，它这份把范围铺到了整个仓库的散文，还给了一条能照着执行的判据。**这份原文我建议你自己读一遍**：`.agents/skills/dsh-trim-cot-leakage/SKILL.md`。

### 5. 515 份分状态归档的设计笔记

`.agents/notes/` 按状态 × 类别归档（每份都有中英双语）：

| 状态 | 数量 |
|---|---|
| implemented | 515 |
| archived | 143 |
| proposed | 25 |
| rejected | 11 |

分类是 architecture / feature / bug-fix / process / simplification / testing。代码注释和文档里到处在引用这些 note 的路径，当作"这个决定归谁管"的地址——比如沙箱那套策略的归属地就是 `.agents/notes/implemented/feature/2026-07-06-sandbox.md`。这就是 spec-driven development 铺到工业规模之后的样子，也是 64 天能出 12,345 个 commit 的前提：**每个决定都有唯一的归属地，agent 不用重新推导一遍，也不许重新推导。**

特别留意那 11 份 `rejected`——被否掉的提案也留着。这比只存成功记录有用得多，它防的就是下一个 agent 兴冲冲地把同一个坏主意再提一次。

### 6. 每个包都要申报自己花多少上下文

`packages/` 下 268 份 README 里，**215 份都有一个 `## Model Experience` 段落，里面固定写三件事**：模型看到什么（What the model sees）、**Token effect**、**KV Cache effect**。另有 220 份写了 `## Known Limitations and Deferred Work`。

举个例子。sandbox-policy 的 KV Cache 那段写的是：切换模式时，稳定的 system prompt 保持逐字节不变，变化的上下文快照追加在保留历史后面，这样前缀缓存不会失效。MCP client 那份则老实交代：re-sync 是替换 schema 而不是累加，但只要这次 re-sync 改动了工具定义，**从第一个变化的 schema token 起** KV cache 就废了。

**每个能力都得申报自己占多少上下文、会不会打断 prompt cache。** 这一下就把"context engineering"从玄学变成了包级别的契约。这条我觉得是整个仓库里最容易被低估、同时又最容易抄走的约定。

### 一个案例：最有教育意义的那次事故

文件是 `docs/postmortem/0002-js-expression-disabled-filesystem-tools.md`。

事情是这样的。ACP 那个示例想用 `disabled: !!js ...` 按条件启用文件系统插件。但 Cordis 只在插件的 `config` 里求值 JS 表达式，`disabled` 这个字段是直接拿原值用的——于是每个文件系统 entry 拿到的都是一个**对象**，而对象永远为真，插件就永远被禁用了。结果是七个文件系统场景调的工具压根不在注册表里。

最要命的是后半段：

> All unit, coverage, snapshot, documentation, build, and hygiene checks passed.

**所有门禁全绿。** 因为快照套件在刷新时，把 `UNKNOWN_TOOL` 的失败结果录成了新的"期望输出"。他们自己的总结：

> 快照套件通过了，但它证明的是**这个回归可以被确定性地重放**，而不是文件系统功能可用。
>
> A snapshot refresh is **fixture production, not correctness review**.

这就是 AI 高速产出代码时最典型的翻车方式：机器把 bug 录进了期望值，然后每一道检查都笑着告诉你没问题。他们的补救没走"以后多加一轮人工评审"那条路，而是加了四条机器能查的守栏：

1. 文件系统场景改用一个显式的全权限 overlay，不再靠条件表达式；
2. 文档里写清 `!!js` 到底只在哪几个字段生效；
3. `verify-cordis-config` 门禁拒绝表达式出现在其他位置；
4. 快照工具**直接拒绝**把 `UNKNOWN_TOOL` 结果提交成期望输出。

最后一条是关键——**它把"机器不许把自己的失败录成标准"变成了一条代码里的规则**。

---

## 七、实测记录

### 跑发布版（推荐路径）

```bash
npx -y @deepseek-ai/dsh@latest --help                        # 正常
npx -y @deepseek-ai/dsh@latest --profile web --dump-default-config   # 129 行插件树
npx -y @deepseek-ai/dsh@latest web                           # http://127.0.0.1:3080
```

Web 起来之后 `curl` 首页拿到 `HTTP 200`，4.6ms。`$DSH_HOME`（默认 `~/.dsh`）落盘也干净：

```
profiles/  sessions/  storages/  settings.yaml  .credentials.yaml (0600)
```

`dsh plugin add <package>` 干的事就是把参数转给 profile 目录里的 pnpm——所以**插件本质上就是 npm 包**，装进哪个 profile 就在哪个 profile 生效。

### 从源码装、构建、跑测试

```
pnpm install   10 分 15 秒（中途反复重试两个平台二进制）
pnpm run build 1 分 0.7 秒（238 个包，tsc -b + tsdown + vite）
pnpm run test  144 秒 —— 816 个测试文件、13,616 个用例
               13,499 passed / 8 failed / 109 skipped
```

构建一分钟出头，这个体量算相当快了。测试跑完 13,499 个过、8 个挂——而**这 8 个挂的全指向同一个原因**，正好值得说一下：

`pnpm install` 最后虽然退出码是 0，但那两个平台二进制始终没拉下来（`@openai/codex` 的 darwin-arm64 包和 `@anthropic-ai/claude-agent-sdk-darwin-arm64`，我这条网络每次都超时）。挂掉的正好就是需要它们的那四个文件：

- `subagent-codex/tests/real-product.spec.ts` —— 3 个
- `subagent-claude-code/tests/real-product.spec.ts` —— 1 个
- `scripts/gen-third-party-notices.spec.ts` —— 1 个（读不到那个包的 package.json）
- `scripts/change-scope.spec.ts` —— 3 个（临时 worktree 里的 `git push --set-upstream` 在我环境下失败）

有意思的是，顺着这几个失败反而看清了他们的测试有多硬。你看这两个测试的名字：

> `real @openai/codex 0.147.0 product > passes the exact task and fake authentication to local Responses and returns exact text`
>
> `real Claude Agent SDK 0.3.220 and its distributed Claude Code 2.1.220 fixture > inherits host settings and sends the exact task and fake key to local Messages`

**他们在 CI 里启动竞品的真实二进制，指向一个本地假 API，断言发出去的任务字节精确、断言"取消一次真实的 app-server 命令审批且命令没有被执行"。** 还有一个细节：那个真实 `claude` 二进制被故意放在一个含 shell 敌意字符的临时路径下（`native&%literal%!bang!bin/claude`），用来证明 argv 处理是干净的。

代价也摆在那儿：这种"钉住竞品某个具体版本的真实行为"的测试天生就脆——sentinel 里写死了 `2_1_220`，而 Claude Code 现在已经跑到 2.1.233 了。

pnpm 那边还有两个配置值得抄：一个是 `minimumReleaseAge`，依赖必须发布满一定时间才准装，防的是刚被投毒的新版本；另一个是每条豁免都得在 `pnpm-workspace.yaml` 里写清楚为什么豁免：

```yaml
minimumReleaseAgeExclude:
  # Fresh pi-ai releases carry the model catalog updates that are the whole
  # point of bumping it; waiting out the release age would defeat that.
  - '@earendil-works/pi-ai@0.82.1'
```

### 接别家模型

默认模型是 `deepseek-official` / `deepseek-v4-flash`。但模型这个 seam 是真开的——通用适配器 `llm-pi-ai`（底下用 `@earendil-works/pi-ai`）支持三种线协议：

```
openai-chat-completions
openai-responses
anthropic-messages
```

所以想接 OpenAI 兼容网关、自建服务、或者干脆接 Claude，都是**改配置的事，不用改代码**。`apiKeyEnv` 存的是一个凭据**引用**，按请求解析，密钥本身不进配置文件。我跑测试那台机器上，它早就被配成走一个 OpenAI 兼容网关加 GLM 系列在用了，跑得挺好。

### 遥测

默认就是 `mode: DISABLED`，你不显式设 `DSH_TELEMETRY_MODE` 它一个字都不往外发。匿名 id 放在 `$DSH_HOME/.anonymous-user-id`，想重置就删掉这个文件。这点该夸。

### 与现有生态的对接情况

| 能力 | 状态 |
|---|---|
| 指令文件 | 读 `AGENTS.md`，其次 `CLAUDE.md` ——现有 CLAUDE.md 直接可用 |
| Skill | 读 `SKILL.md`，扫 `<project>/.dsh/skills`、`<project>/.agents/skills`、`$DSH_HOME/skills`、`~/.agents/skills` |
| MCP | 有 client 桥，stdio + streamable-http，工具名同为 `mcp__<server>__<tool>`；**只桥接 tools**，Resources/Prompts 未做；默认不挂载 |
| Claude Code / Codex hooks | 有桥，需显式配置路径，默认不挂载 |
| Agent Plugins 1.0（8/6 那个新标准） | **暂未支持**，没找到 `plugin.json` / `mcp.json` 的处理 |

留意 skill 那一行：它扫 `.agents/skills`，**不扫** `.claude/skills`。所以想让 Claude Code 和 dsh 共用一套 skill，最省事的办法就是 DeepSeek 自己在仓库里做的那个动作——**skill 放 `.agents/skills`，再把 `.claude/skills` 做成软链指过去**。这个约定跟外面的风向也是一致的：本周登顶 GitHub 周榜的 `mattpocock/skills`，副标题就是"straight from my .agents directory"。

---

## 八、代价与风险

不能只说好话。

**学习成本是真的高。** 238 个包，还要外加 Cordis 一整套自己的词汇：fiber、effect、waterfall、seam、scope、realm。文档量同样惊人——`config-catalog.md` 129KB、`module-graph.md` 122KB、`tool-catalog.md` 79KB、`capability-seams.md` 38KB。它的 `docs/architecture.md` 开头就写了"我们建议用一个 agent 来探索这份代码库"，这句话诚实，但也说明了门槛：**这套东西读得懂，但学得慢。**对比一下，如果你只想改个提示词或加个工具，这个抽象层级是过重的。

**它自己明说了不承诺稳定。** 版本号是 `0.1.0-rc.7`；`AGENTS.md` 里专门有一节叫「Pre-release stance: foundation over blast radius」，大意是"反正现在没有外部消费者，那就优先把地基做对，重命名、重新分包都随便来"；`SESSION_FORMAT_VERSION` 还停在 `0`，明写"无兼容承诺"；后端直接拒绝读旧的磁盘格式。**这时候把生产工作流搭上去，等于给自己预定一笔迁移债。**

**连地基也还是 rc。** 他们没走 npm 依赖 Cordis 这条路，而是把整个框架层**源码 vendor** 进了仓库（放在 `vendor/`，重命名到 `@deepseek-ai/*` 作用域）。理由写得很直白——要让 harness 完全拥有自己的框架层，可审计、可打补丁、可钉版本。做法也确实专业：钉到上游某个具体 commit（`56b3d4f`）、保留上游版本号和 MIT LICENSE、维护一份"每一处跟上游的偏离都必须列出来"的修改日志，再加一个 `verify-vendored-links` 门禁防止混进 registry 副本。但 manifest 里那个上游版本号是 **`cordis@4.0.0-rc.7`**——这套架构的地基自己也还没到 1.0。

**它现在只是"源码公开"，还谈不上"开放协作"。** GitHub API 上 `has_issues: false`——**Issue 是关着的**，只留了 Discussions。公开后 4 天里那 59 个 commit，全部来自原班人马。所以有句话得说明白：

> **158,665 star 和 16,520 fork 不能当成生产就绪的证据。** 一个创建 5 天的仓库拿到这个数字，说明的是 DeepSeek 这个名字的号召力和"agent harness"这个议题的热度，不是这个软件的成熟度或社区健康度。

另外重复一遍前面那条：**沙箱只管文件，不管网络**（这是他们自己文档写的），Windows 和老内核上的 Landlock 都只是 partial，而且他们如实上报了。想防数据外传，你得在别的层做。

---

## 结论

看你是哪一类人：

**如果你在给团队搭 harness、内部 agent 平台或者 agent 网关** —— 值得一个包一个包地读。真没时间就先读这四份：`docs/architecture.md`（9KB，一口气能读完）、`packages/core/agent-loop/src/invariant.ts`（就是那条不变量）、`docs/capability-seams.md`（三角色抽象）、`packages/sandbox/sandbox-local/README.md`（沙箱怎么做，以及怎么如实交代自己的短板）。

**如果你只是想换个日常干活的工具** —— 现在别换。rc.7、Issue 关着、破坏性变更明说了会有、会话格式不给兼容承诺。装起来玩玩当然可以，跑个 `--dump-default-config` 看看一个 harness 被彻底拆成插件之后长什么样很值，但别把工作流搬进去。

**如果你管团队的工程规范或者 AI 编码治理** —— 这是我最想推荐的一类人，而且架构那部分你可以完全跳过。下面这几份读完，今天就能抄：

1. `docs/testing.md` —— 逐文件 100% 覆盖率的理由、"验证世界不验证自述"、"关键词探测会让作弊的 agent 通过"
2. `.agents/skills/dsh-trim-cot-leakage/SKILL.md` —— 思维链泄漏的八类清单与单一判据
3. `scripts/doc-budgets.manifest.json` + `verify-doc-budgets.ts` —— 常驻文档字数预算，只准往下棘轮
4. `docs/postmortem/0002` —— 所有门禁全绿的那次事故，以及"快照刷新是产出 fixture，不是正确性评审"
5. 任意一个包的 README —— 看 `## Model Experience` 里的 Token effect / KV Cache effect 两段是怎么写的

最后说句总的。这个项目值得看，主要不是因为它比 Claude Code 好用或者不好用——**它还在 rc 阶段，现在比这个没意义**。它值得看，是因为它公开了一样很少有人公开的东西：**一支团队用 agent 在 64 天里堆出 23 万行 TypeScript 和 29 万行测试，同时把"怎么防止这堆代码烂掉"的每一道门禁都写成文件放进了仓库。** 架构你可以不抄，那些门禁值得抄。

---

*实测环境：macOS 25.5 / Node v24.18.0 / pnpm 11.17.0；仓库 commit 截至 2026-08-17，数据取于 2026-08-18。*
