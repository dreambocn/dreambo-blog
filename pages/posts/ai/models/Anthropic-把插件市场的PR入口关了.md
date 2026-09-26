---
title: Anthropic-把插件市场的PR入口关了
date: 2026-08-24
updated: 2026-08-24
categories:
  - AI
  - 模型与动态
tags:
  - Anthropic
  - 生态
---
# Anthropic 把插件市场的 PR 入口关了

`anthropics/claude-plugins-community` 是 Claude Code 和 Claude Cowork 的社区插件市场，
2026 年 3 月建仓，截至 8 月 24 日上架 2,282 个插件条目。它的 README 说自己是「只读镜像」，
仓库里有个 workflow 就叫 `Close External PRs`。

这句话字面为真，但「大厂收紧治理」不是这件事值得写的原因。值得写的是：他们为了守住这个
目录，用两千多个 PR 维护了每个条目的 commit pin，然后在 8 月发现——那个 pin 管不住插件
真正会执行的代码。修复方案至今是个未合并的 draft，而唯一的自动更新通道已经被手动关掉了。

下面三条判断是这件事里能直接搬走的部分，每条后面附了你该去查自己的什么。案例本身压到后面
当证据。本文事实全部来自 GitHub API、仓库文件和 PR/issue 正文，核实于 2026-08-24。

---

## 一、先说结论：三个可迁移的判断

### 判断 1：pin 住版本号，不等于固定住会执行的代码

依赖固定有三层，很多人以为自己在第二层，执行其实发生在第三层：

| 层 | 形态 | 可变性 |
| --- | --- | --- |
| L1 可变引用 | tag、分支名、`@latest`、`^1.2` | 随时被重指，指向的内容会变 |
| L2 内容哈希 | commit sha、image digest、lockfile | 不可变，但只冻住「这次拉下来的文件」 |
| L3 运行时解析 | 启动那一刻才去 registry 决定跑什么 | 完全不受 L1/L2 约束 |

Anthropic 那个目录做到了 L2——每个条目都 pin 了 commit sha，2,170 个机器人 PR 全是在推进
这些 pin。但插件里 `.mcp.json` 声明的 MCP server 会在会话启动时自动拉起，如果它的 command
是 `npx some-pkg@latest`，那**实际执行的代码是启动那一刻从 npm 解析出来的，pin 住的 commit
对它没有任何约束**。

**你该去查什么。** 在自己的项目里找 L3。下面四条我都实测过，注意第一条不能用裸 grep——
`npx pkg@latest` 和 `npx pkg@1.2.3` 一个是 L3 一个是 L2，grep 分不出来，得把启动命令平铺
出来看：

```bash
# 1) MCP 启动命令：平铺出来逐条看版本
for f in $(rg -l --glob '*mcp.json' '' .); do
  jq -r --arg f "$f" '(.mcpServers//{})|to_entries[]
    |"\($f)  \(.key)  →  \(.value.command) \((.value.args//[])|join(" "))"' "$f"
done
# npx -y pkg@latest  ← L3   npx pkg@1.2.3  ← L2   uvx tool  ← L3（裸名字，启动时解析）

# 2) GitHub Action 用 tag 而不是 sha（排除 40 位 sha，否则正确写法会被误报）
rg -n 'uses:\s*\S+@(?![0-9a-f]{40}\b)' --pcre2 .github/

# 3) Dockerfile 用 tag 而不是 digest
rg -n '^FROM (?!.*@sha256)' --pcre2 .

# 4) Maven 依赖里的范围与变量版本
rg -n '<version>\s*[\[\($]' pom.xml
```

Java 侧还有一个更隐蔽的 L3：二方包的版本你固定了，但它启动时去配置中心拉的那份配置没有
版本概念。Apollo 上一个键被改掉，等于换了行为，而你的 `pom.xml` 一个字没动。

### 判断 2：审核过一次，不等于持续受控

这个目录给每个条目记的是 GitHub 的 `owner/repo`。他们 8 月加了一个每日扫描，用的判定依据
很值得抄：**不看 owner 的 login，看 GitHub account id**——login 会被释放然后被别人重新注册，
account id 不会变。所以「一个记录过的 login 解析到了不同的 id」就是这个账号已经换人了。

基线覆盖 1,764 个 owner。刚建立基线那一刻的现存发现是：9 个 owner login 已经解析不到，
56 个仓库归属于和登记不同的账号，26 个仓库解析不到。这些全部发生在上架**之后**——上架时
的任何审核都管不了。

**你该去查什么。** 对你引用的每个外部仓（skill、Action、npm 包、Go module），记录时多存
一个字段：

```bash
gh api users/<login> --jq .id     # 记下来，以后比这个，不比名字
```

以及：`git clone` 和 `git ls-remote` 会静默跟随 GitHub 的仓库迁移重定向。你以为在拉
`orgA/repo`，实际拉的是它被转手之后的新位置，命令不会报任何错。

### 判断 3：把人从写入路径摘掉，鲜度就整个赌在自动化上

关掉外部 PR 之后，这个目录唯一的更新通道是每晚一次的机器人。吞吐是可以算的：2,282 个条目，
每次最多推进 30 个，按文件顺序（大致字母序）走。走不到后面。

后果不是「有点旧」，是**用户装上去不工作，而外观完全正常**。然后 8 月 12 日他们为了修
判断 1 那个缺陷，把这个 workflow 手动停了。目录冻在原地，但每一条看起来还是「通过了自动
安全扫描并批准分发」。

**你该去查什么。** 问自己的流程三个问题：

1. 哪些路径只有机器人有写权限？人在那条路上被挡掉之后，去哪里？
2. 那个机器人的吞吐够覆盖存量吗？算一次周转周期，别估。
3. 它停掉之后，多久会有人发现？靠什么发现——是有告警，还是等用户来报？

第 3 条在我们自己的流程里有直接对应物：`ai-runs` 的写入靠 hook、KB 同步靠 hook 兜底、
共享仓库的 push 靠 PostToolUse 补。这些都是"人写 + 自动兜底"的形状，比"只有机器人能写"
安全一档。真正要警惕的是哪天为了省事把某条路改成纯自动——那就是这篇文章里的形状了。

---

## 二、关门本身：机制成立，代价是责任全揽下来了

一个 registry 拒绝接受来自 fork 的直接写入，是完全成立的安全姿态。`pull_request_target`
在 fork PR 上带写权限跑在 base 仓上下文里，本来就危险——那个自动关闭的 workflow 自己就得
先防一遍伪造，注释里写得很清楚：只能按作者名判定，绝不能按分支名，因为任何人都能开一个
分支就叫 `bump/plugin-shas`。

代价是：关门之后，那些人想解决的问题不会消失，只是全部变成你的责任。

数据：这个仓 2,342 个 PR，2,170 个来自 `github-actions[bot]`，134 个来自 Anthropic 的
`bryan-anthropic`，21 个来自 `tobinsouth`，剩下 17 人各 1 个。

去掉机器人和有写权限的人，外部贡献者一共 **14 个 PR，全部 closed，0 个 merged**。

这 14 个里有 9 个是在修自己那一条：`wyatt-shippo` 修 Shippo 的条目、`ahmedawan-oracle`
更新 Oracle 的插件、`jaspergreen` 要升的版本里带着一个 credential cache 修复。全部收到
同一条模板评论，让他们去填表单。

## 三、饥饿：任何单通道的吞吐都是算得出来的

`bump-plugin-shas.yml` 每天 07:23 UTC 跑一次，`max-bumps` 传 30。`bump.sh` 按文件顺序
迭代，到上限就停。marketplace.json 大致按名字排序。

两个受影响的人各自独立算出了同一个结论。issue #995：07-09 到 07-12 合并的 89 个 bump
**全部落在 `42crunch` → `design-is-code-plugin` 这一个字母区间**，forgeproof 排在 2,248 条
里的第 836 位，「这影响文件后半部分的每一个条目」。issue #1588 在另一条上复现：`ru-text`
排第 1,653 位，「最近 100 个动 marketplace.json 的 commit 里 96 个是 bump，没有一个是
`bump(ru-text)`」。

两人给的建议一样：最旧优先排序、轮转起始偏移、或提高上限。都还是 open。

这一节的可迁移点很朴素：**只要一条通道的容量小于存量，排序方式就决定了谁永远排不上**。
按字母序、按 ID 序、按创建时间序扫全量的定时任务，都有这个问题。我们自己那些"每天扫一批"
的巡检任务值得对照看一眼。

## 四、后果：`install` 成功是最弱的成功信号

这些都是插件作者自己报的：

`akf`（issue #869）的条目 pin 在 2026-04-06 的一个 commit——那时候这个仓库还没有任何插件
结构。今天装它：

```
$ claude plugin install akf@claude-community   # 成功
$ claude plugin details akf@claude-community
  Skills (0)  Agents (0)  Hooks (0)  MCP servers (0)
```

安装返回成功，装出来是空的。上游从 7 月 4 日起已有合法插件，「auto-bump 今天 bump 了别的
插件，但 akf 在四月那个 SHA 上过了约 90 个后续 commit」。

`recall`（issue #1121）的 pin 停在 v2.2.0，而这个版本在当前 Claude Code 上是坏的：hook 读
的是旧的 `UserPromptSubmit` 载荷字段（当前发的是 `prompt` + `cwd`），大 transcript 上
capture-hook 会永远重读同一块，会话解析在并行会话下非线程安全。三个都在 v2.2.1~v2.2.3
修了。作者的原话：「文档说 CI 会随新 commit 自动 bump pin——但这个 pin 自提交以来没动过。」

`ru-text`（issue #1588）落后四个发布，「今天安装拿到的是这个插件宣传的那个 AI 文本清理
能力还不存在之前的版本」——条目的 description 在描述一个 pin 住那个 commit 里没有的功能。

还有一个更直接的：issue #1058，在 Claude Desktop 里加这个 marketplace 直接报
`marketplace.json lists 2248 plugins (max 2000)`，目录长过了客户端硬上限。今天它 2,282 条。

**可迁移点**：安装成功、进程起来了、健康检查返 200，都不等于装的是你以为的那个版本。
验收要验内容（版本号、能力清单、某个只有新版才有的字段），不能验退出码。

## 五、pin 不住的那一层（判断 1 的现场）

2026-08-12，`bryan-anthropic` 一天推了一批加固 PR。其中 PR #2361 的问题陈述是整件事的核心：

> 插件 `.mcp.json` 里声明的 MCP server 会在会话启动时自动拉起。当它的 command 是包管理器
> runner（`npx`/`bunx`/`uvx`/`pipx`）而 spec 是浮动的——`@latest`、任意 dist-tag、版本范围、
> 或一个没有本地 vendor 的裸名字——那么实际执行的代码是启动时从包 registry 解析出来的。
> marketplace 条目里那个 pinned `source.sha` 并不能固定它。

同一批的 PR #2362（至今未合并的 draft）想在 bump 循环里加门禁，理由说得更直白：自动 bumper
推进 pin 等于「持续给它自己都冻不住的内容重新盖章」（keep re-blessing content it cannot
actually freeze），而扣住 bump 是这个仓库对已上架条目**唯一的执行面**——它没有任何办法让
上游把版本钉死。

这批加固里有一个刻意划出去的边界，是全文最值得直接抄的一条设计：

> `skills/`、`commands/`、`agents/` 的 markdown 里的包调用故意不在范围内：那些是 agent
> 主动调用且经过权限门禁的，和会话启动自动拉起是不同的信任形状。

同样一条 `npx`，写在 SKILL.md 正文里和写在 `.mcp.json` 里是两回事——前者要 agent 决定调、
要过权限确认，后者你一开会话它就跑了。**同一个危险动作，触发路径不同，风险等级就不同**。
这个区分可以原样搬到我们自己的规则里：MCP 启动命令必须精确版本，SKILL.md 正文里的可以宽
一档。

同批还有 PR #2359：`source.path` 之前只拦 shell 元字符，**拦不住 `..` 段和绝对路径**，
补上之后 `target="$dest/$subdir"` 不可能解析到临时 clone 之外。一个跑了 742 次的自动化里
躺到 8 月的路径穿越。

## 六、「通过了自动安全扫描」能核实到什么程度

README 说每个上架插件都「通过了自动安全扫描，并被批准分发」。这句话没理由怀疑，但外界能
核实的部分比字面上少。

真正的扫描在不公开的内部流水线里——这是「只读镜像」这个定位的必然结果，不是漏洞。但它
意味着：没有任何外部方式能核实某一条上架条目被扫过什么。公开仓里那个 `scan-plugins`
action 是给别人复用的，它自己的 README 又补了两处：

> **默认不阻塞。** 发现以 `::warning` 注解呈现，设 `fail-on-findings: true` 才让 job 失败。

> 打包的 `policy/prompt.md` 是刻意最小化的……运行这个 action 的组织应该在**私有位置**维护
> 一份更详细的提示词（这样检测逻辑和回归 fixture 就不会和部署出去的扫描器一起发布）。

这个取舍是对的——公开检测规则等于交作业。但对使用者来说结论是：这句话你只能选择信或不信，
没有第三个选项。

**可迁移点**：当你在评估要不要引入某个外部资产时，「它有审核」和「它的审核我能核实」是两个
不同的输入。前者只能算信任声明，不能算证据。区分这两者，比追问审核有多严格更有用。

## 七、时间线

| 日期 | 事件 |
| --- | --- |
| 2026-08-07 | marketplace.json 最后一次新增插件条目 |
| 2026-08-11 | 每晚 bump 最后一次按计划运行 |
| 2026-08-12 | 加固批次：owner 验证、静态 pin 检查、路径输入加固，删 10 个死条目 |
| 2026-08-13 | 一次手动 dispatch 的 bump；此后 marketplace.json 八天无变化 |
| — | `Bump Plugin SHAs` workflow 状态：`disabled_manually` |
| 2026-08-19 | issue #2370 报「进料看起来停了」，附可复现命令 |
| 2026-08-21 | Anthropic 员工手动合了一个 `Add eli5 plugin` |

issue #2370 把话说得很谨慎：8 月 7 日之后触及 marketplace.json 的 527 个 commit 里，
521 个是 `bump(...)`、4 个 `repin(...)`、2 个 `maint:`，新增插件 0 个。他特意说明另外两个
问审核时限的 issue「都没有得到回复」，所以他换成提一个「一条查询就能证伪」的整体观察。

那两个 issue 之一（#1716）的经历是：7 月 1 日通过表单提交，状态一直是「已提交待审核」，
等了五周；8 月 1 日以为丢了又提交一次，同样状态；提交页没有撤回或删除的办法。他自己
`claude plugin validate .` 通过，仓库公开，从自己的仓库直接装能装上。

---

## 我们能做的

按你现在的角色对号入座。

**如果你在写 skill / plugin 给别人用。** 你的 `.mcp.json` 里不要出现 `@latest`、dist-tag、
版本范围或裸包名——只要有一条，别人 pin 你的 commit 就是白 pin，而且他们不会知道。
`SKILL.md` 正文里的 `npx` 可以宽一档（agent 主动调、有权限确认），但 MCP 启动命令必须
精确版本。另外：如果你的插件被某个目录收录了，pin 是它记的，不是你控的——版本一旦有破坏性
变更，最好留兼容而不是指望对方及时 bump。

**如果你在装别人的 skill / plugin / MCP。** 三个动作：
1. 装完验内容不验退出码——看能力清单对不对（`Skills (N)` 是不是 0）、版本号是不是你要的那个。
2. 引用时记三样：`owner/repo` + commit sha + `gh api users/<login> --jq .id` 的那个数字。
   以后核身份比 id，不比名字。
3. 把 MCP 启动命令单独过一遍。这是唯一一类「你什么都没做，一开会话就执行外部代码」的配置。

**如果你在做内部 skill / plugin registry。** 先在两条路里选一条，别停在中间。一条是全部
vendored 进自己的仓——同期 `cursor/plugins` 走的就是这条，33 个插件全在仓内、manifest 里
`author.name` 几乎全是 Cursor，没有外部 source 就没有 pin 不住的问题，代价是供给量（33 对
2,282）。另一条是做目录、指向别人的仓库——那就必须一开始把维护预算算进去：bump 的排序策略、
owner 身份核验、上游失效清理、超客户端上限时怎么拆。

中间态是最差的：既指向外部代码，又假设审核一次就完事。

**如果你在补团队规则。** 我们的 `rules/skill-mcp-spec.md` 现在规定的是 SKILL.md 怎么写、
frontmatter 有哪些字段、权限边界那一节写什么。它没规定引用一个外部 skill 时要记什么、
多久复核一次、上游消失怎么办。这三件事补进去就行，元数据规范里已有的 `lastVerifiedAt` /
`validUntil` 正好可以复用——到期重新解析一次 owner 和 sha，对不上就标出来，不自动更新。

最后一句不写成动作：**「已审核」在一个指向外部代码的目录里，保质期比大多数人以为的短得多。**
那 49 个被冻结的条目、那 56 个归属不符的仓库、那个装上去 `Skills (0) Agents (0)` 的插件，
都是上架时通过了的。

---

## 附：完整证据链

想自己复核的话，下面是取数方式和几个没进正文的数字。

**PR 与作者分布**

```bash
gh api 'search/issues?q=repo:anthropics/claude-plugins-community+is:pr' --jq .total_count
gh api --paginate 'repos/anthropics/claude-plugins-community/pulls?state=all&per_page=100' \
  --jq '.[].user.login' | sort | uniq -c | sort -rn
```

**外部 PR 的下场**（14 个，2026-04-02 ~ 08-05，全部 closed 未合并）

| 日期 | 作者 | 想做的事 |
| --- | --- | --- |
| 08-05 | SushantTusharJoshi | 加 LLM 输出评估插件 |
| 07-23 | wyatt-shippo | 把 `shippo` 重指到 `goshippo/ai` |
| 07-05 | suirindo | 加 Next.js AIO/SEO 工具包 |
| 06-23 | usmanmughaltaleemabad | 升 `one-shot-prompting` 的 SHA |
| 06-19 | closed-loop-ai | 升 `closedloop-skills` |
| 06-16 | WhoKnowsNothing | 加 `dingdong` |
| 06-14 | nimeshkummar | 升 `sindri` 到 v0.4.0 |
| 06-11 | George-iam | 升 `axme-code` 到 v0.6.1 |
| 06-11 | jaspergreen | 升 `moeba-channel`（credential cache 修复）|
| 06-03 | gerson-ribeiro | 升 `save-your-work` |
| 05-23 | Zeffut | 删一个废弃的重复条目 |
| 05-07 | ahmedawan-oracle | 更新 Oracle 自家插件 |
| 04-19 | sylvester-francis | 更新 `ctxforge` 描述 |
| 04-02 | kobie3717 | 加 `ai-iq` |

**目录构成**（2,282 条）：1,876 条 `url` 类型、401 条 `git-subdir`、5 条指向仓内本地目录；
对象型 source 里只有 3 条没有 sha。4 条 rename 映射。

**freeze 清单**：`.github/freeze-shas.txt` 里 49 个条目被钉在当前 pin，不再自动 bump。
文件头说明这是 2026-06-13 的快照，列的是「在上游 HEAD 上确实过不了 `validate-plugins`」的
条目——新 SHA 上 manifest 丢了，或某个字段在 bump 时暴露成错误。

**公开面上的 workflow 运行次数**

| Workflow | 状态 | 历史运行 |
| --- | --- | --- |
| Validate Plugins | active | 7,150 |
| Close External PRs | active | 2,455 |
| Bump Plugin SHAs | `disabled_manually` | 742 |
| Owner Liveness Sweep | active | 11 |
| Scan Plugins | active | 1 |
| Policy Fixtures | active | 1 |

口径提醒：`Close External PRs` 在每个新开 PR 上都触发再判定放行，2,455 是触发次数，
不是关掉的外部 PR 数（那个数是 14）。`Scan Plugins` 只跑过 1 次不代表没有扫描——真正的
扫描在不公开的内部流水线里，这里那个是给别人复用的 action。

**pin 陈旧度抽样**（我自己测的，不是官方数据）：从 2,282 条里等间隔抽 24 条，22 条能解析到
上游。13 条「落后 0 天」，但这多数意味着上游自己也没更新过（插件本身不活跃），不能算 bump
生效；剩下 9 条落后 10 到 23 天。样本小，不代表全量分布。

**owner 存活扫描的初始发现**：基线覆盖 1,764 个 owner（`.github/owner-baseline.json`），
seed 时现存 9 个 owner login 解析不到、56 个仓库归属与登记不同、26 个仓库解析不到。
只有「login 解析到不同 account id」这一类会让 run 失败，其余只报告，从不自动修改或删除。

---

## 参考

**一手来源（核实于 2026-08-24）**

- https://github.com/anthropics/claude-plugins-community
- `.github/workflows/close-external-prs.yml` · `.github/freeze-shas.txt` ·
  `.github/owner-baseline.json` · `.github/actions/scan-plugins/README.md` ·
  `.claude-plugin/marketplace.json`
- https://github.com/anthropics/claude-plugins-official —— 官方目录（README 那句免责声明：
  Anthropic 不控制插件里包含哪些 MCP server、文件或其他软件，也无法验证它们是否会按预期
  工作、是否会发生变化）
- https://github.com/cursor/plugins —— 33 个插件全部 vendored 在仓内

**加固批次 PR（2026-08-12）**

- #2361 auto-exec MCP launcher 的确定性静态 pin 检查（已合并）
- #2362 runtime pin gate，扣住带浮动 auto-exec MCP 的 bump（未合并 draft）
- #2357 source availability / owner verification（已合并）
- #2359 bump 的 subdir 与路径输入加固（已合并）
- #2356 / #2358 删除 10 个上游失效条目、重指 1 个

**Issue**

- #2370 进料停滞：8-07 之后 527 个 commit 无一新增
- #1716 提交五周无状态变化且无法撤回
- #1588 `ru-text` 落后四版 + max-bumps 饥饿诊断
- #1121 `recall` 的 pin 在当前 Claude Code 上是坏的（作者本人报）
- #1058 超客户端 2,000 条上限，整个市场加载失败
- #995 尾部条目被饿死（forgeproof 排 836）
- #869 `akf` 装上是空插件
