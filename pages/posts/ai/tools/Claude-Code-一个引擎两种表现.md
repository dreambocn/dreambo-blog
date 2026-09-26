---
title: Claude-Code-一个引擎两种表现
date: 2026-08-26
updated: 2026-08-26
categories:
  - AI
  - 工具与框架
tags:
  - Claude Code
---
# Claude Code 的 CLI 和 Desktop：一个引擎，两种表现

我一直以为 Claude Code CLI 和 Claude Desktop 是两个东西：一个给工程师，一个给普通人，能力有高低。于是想整理一份"该用哪个"的对照表。

翻完官方文档发现前提就错了。Claude Desktop 的安装说明里写着一句：**"The app includes Claude Code, so you don't need to install the CLI separately."** 桌面端的 Code 标签不是"简化版"，它跑的就是 Claude Code，官方原话是"the same underlying engine with a graphical interface"。两边读同一批配置文件、同一份 CLAUDE.md、同一套 MCP 和 hooks，甚至可以同时开着、同时对着一个项目干活。

所谓"区别"，绝大部分是外壳差异，而且不是单向的——Desktop 独占的东西比我预想的多。真正不可替代、无法靠对方替代的差别，只有一条。

以下内容查证时间 2026-08-26，CLI 侧以 2.1.246 的 `--help` 与官方命令参考为准。

---

## 一、先把三个名字分开

混乱多半来自"Claude Desktop"这个名字被当成一个功能在用。它实际是个容器，装了三个标签页：

- **Chat**：对话，就是 claude.ai 的原生客户端
- **Cowork**：更长的代理型任务，以及从手机派发任务（Dispatch）
- **Code**：软件开发，也就是 Claude Code

本文讨论的"Claude Desktop"指的是 **Code 标签**。拿 Chat 标签去和 CLI 比编码能力，比的不是同一个东西。

顺带一提，Claude Code 的形态不止这两个：终端 CLI、VS Code、JetBrains、桌面 app、浏览器（claude.ai/code）、手机 app。官方把它们叫 surface，共用一个引擎。

## 二、共享的部分比想象的多

下面这些是两边**同一份**，不是"各有一套、恰好长得像"：

- `CLAUDE.md` 和 `CLAUDE.local.md`
- MCP server：`~/.claude.json` 和项目里的 `.mcp.json`
- hooks 和 skills
- `~/.claude/settings.json` 里的权限规则、允许的工具等设置
- 可用模型完全一致（Desktop 在发送按钮旁的下拉里选，支持会话中途切换）

会话历史是各自独立的，但可以互相搬：在终端里敲 `/desktop`，当前会话保存后在桌面 app 里打开，CLI 退出；反过来在 web 上起的会话，用 `claude --teleport` 或 `/teleport` 拉回终端。

`/desktop` 有前置条件：macOS 和 x64 Windows，且用 claude.ai 订阅登录。API key 认证、Amazon Bedrock、Google Cloud 的 Agent Platform、Microsoft Foundry 都不支持这条搬运通道。

## 三、唯一不可替代的差别：能不能被管道调用

官方的 CLI/Desktop 对照表里，`--print` 和 `--output-format` 那一行写得很直接：**"Not available. Desktop is interactive only."** "Scripting and automation"一行同样是 CLI 有、Desktop 没有。

这不是"Desktop 做起来麻烦一点"，是结构性的没有。CLI 遵循 Unix 那套约定，有 stdin、stdout、退出码，所以下面这些写法成立：

```bash
tail -200 app.log | claude -p "有异常就告诉我"
git diff main --name-only | claude -p "review 这些改动的安全问题"
claude -p "统计这个仓库的模块依赖" --output-format json --json-schema '{...}'
```

一旦你要把 agent 塞进 CI、pre-commit、cron、或者任何一段 shell 脚本，Desktop 就完全不在候选里。反过来，Desktop 独占的每一样东西，CLI 至少都有个能凑合的替代路径（后面会列）。这种不对称，就是我说"只有一条真差别"的意思。

顺着这条线还有一个附带结论：`--allowedTools` / `--disallowedTools` 这类按会话临时收紧权限的做法，Desktop 没有对应操作，只能靠 settings 文件里的常驻规则。要给某一次运行单独设边界，还是得回 CLI。

## 四、其余差别不是高低，是各有独占

| 只有 CLI 有                                                       | 只有 Desktop 有                                                |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| `--print` / `--output-format`，脚本与 CI 集成                        | 文件附件：图片、PDF（CLI 侧官方标注 Not available）                        |
| 第三方模型供应商：Bedrock、Google Cloud Agent Platform、Microsoft Foundry | `@` 提及文件带自动补全（本地和 SSH 会话）                                   |
| Agent teams：Claude 当队长，从共享任务表给队友派活                             | 自动创建 worktree 做会话隔离（CLI 要显式 `--worktree`）                   |
| `dontAsk` 权限模式                                                 | 侧栏多会话并排，窗格拖拽布局                                              |
| 按会话临时收放工具权限                                                    | 本机定时任务（Scheduled tasks）                                     |
|                                                                | Computer use 覆盖 macOS 和 Windows（CLI 只有 macOS，且要经 `/mcp` 启用） |
|                                                                | iOS Simulator 面板自动打开                                        |
|                                                                | Dispatch：从手机派任务，会话出现在侧栏                                     |
|                                                                | 可视化 diff 审阅、PR 状态监控、应用预览                                    |

权限模式的档位也不一样。CLI 是全档，包含 `dontAsk`；Desktop 是 Manual、Accept edits、Plan、Auto 四档，Bypass 要额外开——Pro / Max 在设置里自己开，Team / Enterprise 由组织策略决定。

Desktop 另外两个已知缺口：不提供 inline 代码补全（它只走对话和显式改动）；Linux 版还在 beta，且没有 Computer use。

## 五、两个真正会咬人的坑

前面那些查文档就能知道。下面两个不看到具体条款不会想到。

**MCP 配置是不对称的。** Desktop 的 Code 标签在本地会话里会加载三处 MCP 配置：`claude_desktop_config.json`（Chat 标签那份）、`~/.claude.json`、`.mcp.json`。而**独立安装的 CLI 不读 `claude_desktop_config.json`**。所以你在 Chat 里配好的连接器，Desktop 的 Code 标签能用，终端里敲 `claude` 却没有。要补上得在 macOS 或 WSL 里跑 `claude mcp add-from-claude-desktop` 显式导入。

同名冲突时的优先级还会反转：同一个 server 名同时出现在 `claude_desktop_config.json` 和 `~/.claude.json` / `.mcp.json` 里，Code 标签只连一次，用的是 `claude_desktop_config.json` 那份定义。而当 `~/.claude.json`（用户级）和 `.mcp.json`（项目级）定义了同名的 stdio server，Code 标签用**用户级**那份——官方文档明确说这是"departing from the CLI scope hierarchy"，也就是和 CLI 的作用域优先级相反。项目级配置在 CLI 里会盖掉用户级，在 Desktop 里不会。调试"同一个 MCP 在两边行为不同"时，先查这一条。

**会弹终端对话框的内置命令在 Desktop 里失效。** 不是降级，是明确不工作：没有参数形式的命令，比如 `/permissions`，会直接回一句 `isn't available in this environment`；`/config` 会打开设置界面，但命令后面的文字被忽略——`/config theme=dark` 不会改主题。要改这些，只能直接编辑 settings 文件，或者回独立 CLI 里执行。

## 六、该用哪个

按场景分，不按身份分。官方那句提示已经很准：需要脚本化、自动化，或者本来就习惯终端，用 CLI；想在一个窗口里管多个并行会话、窗格并排、可视化看改动，用 Desktop。

我会补三条：

- 要把 agent 变成工程基础设施的一部分（CI 卡点、提交前检查、日志巡检、定时任务），只有 CLI 这一个选项。
- 输入里有图和 PDF 的活儿（照着设计稿改、读扫描版文档、贴报错截图），去 Desktop，CLI 侧连附件都没有。
- 需要 Bedrock / Vertex / Foundry 这类第三方供应商，或者要用 agent teams 的多角色协作，回 CLI。

至于"非工程角色该用哪个"——这个问题本身可以不问了。Desktop 里有 Chat 和 Cowork 两个标签，本来就不需要碰 Code；而工程师装了 Desktop 也等于装了 CLI 引擎。两者不是二选一，装一个 Desktop 就同时有了 GUI 和引擎，再按上面三条决定什么时候切到终端。

## 七、常用指令

下面包含装完就有的东西：启动参数、内置命令，以及官方随安装包附带的 skill。第三方插件和自己写的 skill 也会往 `/` 菜单里加命令，那些因人而异，不在这里列。

内置命令和自带 skill 在官方文档里是分开归类的，机制确实不同：内置命令直接执行固定逻辑，自带 skill 是提示词驱动——给 Claude 一份详细指令，让它自己用工具去编排。这个区别有实际后果，见本节末尾。

### 启动参数

```bash
claude                          # 交互会话
claude "修一下登录超时"          # 带 prompt 直接开
claude -c                       # 继续当前目录最近一次会话
claude -r                       # 会话选择器
claude -p "总结这个仓库"         # 非交互，管道友好
claude -p "…" --output-format json
claude --model opus             # 换模型（别名或全名）
claude --effort high            # 推理强度 low / medium / high / xhigh / max
claude --permission-mode plan   # 只出方案不落地
claude -w feature-x             # 新建 git worktree 隔离干活
claude --bg "跑全量测试"         # 后台 agent，立即返回
claude --add-dir ../other-repo  # 授权额外目录
claude --safe-mode              # 关掉所有定制，排查配置问题
claude --max-budget-usd 5 -p …  # 花费上限（仅 -p）
claude --teleport               # 把 web 会话拉回终端
```

### 子命令

```bash
claude doctor        # 装机体检
claude update        # 升级
claude mcp           # 管 MCP server
claude plugin        # 管插件
claude agents        # 管后台 agent
claude auth          # 管认证
claude setup-token   # 长期 token
claude import        # 从其他 AI 编码工具导入配置
```

### 内置斜杠命令

会话与上下文：

```
/help  /clear  /compact  /autocompact  /context  /status  /usage（/cost）
/resume  /rename  /rewind  /branch  /fork  /export  /copy  /diff  /exit
```

配置与环境：

```
/config（/settings）  /model  /effort  /toggle-thinking  /fast  /theme  /color
/permissions  /hooks  /memory  /add-dir  /cd  /mcp  /plugin  /reload-plugins
/keybindings  /snippets  /vim  /ide  /import  /upgrade  /uninstall
/login  /logout  /privacy-settings
```

任务与会话搬运：

```
/plan  /goal  /subtask  /background  /tasks  /workflows  /sandbox  /advisor
/desktop  /remote-control  /teleport  /mobile  /artifacts  /chrome
```

其他：

```
/btw  /focus  /list-agents  /agents  /bug（/share）  /feedback
/rate-limit-options  /heapdump  /powerup  /radio
```

用不着背。终端里敲 `/` 就是过滤菜单，`?` 在空输入时切出快捷键面板。有几个命令按设计不出现在菜单里（比如 `/rate-limit-options`），得输全名。

### 官方自带 skill 命令

这些不用装任何东西，每个会话都在。它们属于引擎而不是外壳，所以 Desktop 的 Code 标签里同样有——只有前面说过的那类会弹终端对话框的命令才两边不一样：

| 命令                                           | 作用                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `/code-review`（别名 `/review`）                 | 审当前 diff，或指定 PR 号、分支、路径。可带力度档位 `low`…`max`、`ultra`（云端深审），`--fix` 直接改，`--comment` 发成 GitHub 行内评论              |
| `/security-review`                           | 只查 diff 的安全漏洞                                                                                                |
| `/simplify`                                  | 给当前 diff 提简化建议                                                                                               |
| `/verify`                                    | 真把应用编译起来跑，确认改动达到预期，而不是退化成跑测试或类型检查。只在你显式调用时才跑                                                                 |
| `/run`                                       | 启动并驱动你的应用，亲眼看改动生效                                                                                            |
| `/run-skill-generator`                       | 把"怎么把这个项目跑起来"记成配方，教会 `/run` 和 `/verify`                                                                      |
| `/batch <指令>`                                | 大规模改造：先研究代码库，拆成 5 到 30 个独立单元并给出计划，批准后每个单元派一个后台子代理，各自在独立 worktree 里实现、跑测试、开 PR。需要 git 仓库                      |
| `/debug`                                     | 打开本会话的调试日志并读它排错。调试日志默认关，所以中途敲 `/debug` 是从这一刻开始记                                                              |
| `/doctor`（别名 `/checkup`）                     | 装机体检：重复安装、`PATH`、坏的设置文件；还会算 skill / MCP / 插件的上下文成本对不对得起使用率，标出慢 hook                                          |
| `/loop [间隔] [prompt]`（别名 `/proactive`）       | 会话内反复跑一个 prompt。不给间隔则由 Claude 自己控节奏                                                                          |
| `/deep-research <问题>`                        | 铺开网页搜索、抓取交叉验证、产出带引用的报告                                                                                       |
| `/dataviz`                                   | 图表和仪表盘的设计指导，含配色的色盲安全与对比度校验                                                                                   |
| `/claude-api`                                | 按项目语言加载 Claude API 与 Managed Agents 参考。子命令 `migrate` / `upgrade` / `managed-agents-onboard` / `prompt-audit` |
| `/design-sync`                               | 把仓库里的 React 设计系统同步到 Claude Design，让它产出的设计用你真实的组件                                                             |
| `/fewer-permission-prompts`                  | 扫历史会话里高频的只读 Bash 和 MCP 调用，生成允许清单写进项目 `.claude/settings.json`，减少授权弹窗                                          |
| `/insights`                                  | 生成本机近期会话的 HTML 分析报告                                                                                          |
| `/install-github-app` / `/install-slack-app` | 装 GitHub App / Slack app                                                                                     |

`/run`、`/verify`、`/run-skill-generator` 是三件套，也是这批里最被低估的：前两个开箱就能用，靠项目类型和 README、`package.json`、`Makefile` 去推断怎么启动；推断不准的时候，`/run-skill-generator` 从干净环境跑一遍，把装依赖、环境变量、启动脚本记成文件提交进仓库。`/verify` 自己也会记——没有配方时它把跑通的步骤写到 `.claude/skills/verify/SKILL.md`。只有当某次运行被带错了路，Claude 才会改这个文件，所以它不会每个会话都产生 diff。

这批命令随版本增减，`/help` 和官方命令参考才是当下的准确清单。不想要可以整体关掉：`disableBundledSkills` 设置会禁用所有自带 skill，唯一例外是 `/doctor`——它在 v2.1.205 之后即使关了也还能敲（更早的版本里 `/doctor` 是内置命令而不是 skill）。要连 `/doctor` 一起藏，得用 `DISABLE_DOCTOR_COMMAND` 环境变量或 `skillOverrides` 里写 `"doctor": "off"`。

这也是内置命令和自带 skill 的实际区别所在：前者是程序逻辑，关不掉；后者是提示词，可以整体禁用，也会跟着版本变。

### 快捷键

| 键                    | 作用                                             |
| -------------------- | ---------------------------------------------- |
| `Esc`                | 打断 Claude，或关闭对话框                               |
| `Esc` `Esc`          | 清空输入草稿，或回退                                     |
| `Ctrl+C`             | 打断，或清空输入                                       |
| `Ctrl+D`             | 退出会话                                           |
| `Shift+Tab`          | 循环切换权限模式                                       |
| `Ctrl+O`             | 切换 transcript 视图                               |
| `Ctrl+R`             | 反向搜索历史                                         |
| `Ctrl+B`             | 把运行中的任务转后台                                     |
| `Ctrl+T`             | 切换任务清单                                         |
| `Ctrl+S`             | 暂存 / 恢复当前输入                                    |
| `Ctrl+G`             | 用外部编辑器写 prompt                                 |
| `Ctrl+V`             | 从剪贴板贴图（iTerm2 用 `Cmd+V`，Windows/WSL 用 `Alt+V`） |
| `Option+P` / `Alt+P` | 切模型，不清空当前输入                                    |
| `Option+T` / `Alt+T` | 切换扩展思考                                         |
| `Ctrl+X Ctrl+K`      | 停掉所有后台子代理                                      |
| `!` 开头               | shell 模式，命令输出进上下文                              |
| `@`                  | 提及文件路径                                         |

macOS 上 `Alt+B` / `Alt+F` / `Alt+D` 这类需要先在终端里把 Option 配成 Meta；`Option+T` 例外，不用配。

## 我们能做的

装 Desktop，把它当默认入口——它自带 Claude Code 引擎，Chat 和 Cowork 两个标签还能顺手用上。

同时保留独立 CLI，专门用来干三件 Desktop 结构性做不到的事：进 CI 和脚本、接第三方模型供应商、用 agent teams。

配 MCP 时记住那个不对称：`claude_desktop_config.json` 里的东西终端看不见。要两边一致，跑一次 `claude mcp add-from-claude-desktop`，或者干脆只在 `~/.claude.json` 和 `.mcp.json` 里配，别用 Chat 那份。

最后，别指望在 Desktop 里靠 `/permissions` 改权限——它会明确告诉你这个环境不支持。权限和 hooks 这类东西，认 settings 文件，不认哪个外壳。

## 参考

- [Claude Code 总览 — 各 surface 与安装方式](https://code.claude.com/docs/en/overview)（"The app includes Claude Code" 的出处）
- [Desktop application — Claude Code Docs](https://code.claude.com/docs/en/desktop)（Coming from the CLI、CLI flag equivalents、Feature comparison、What's not available in Desktop 四节是本文对照表的来源）
- [Get started with the desktop app](https://code.claude.com/docs/en/desktop-quickstart)
- [Commands reference](https://code.claude.com/docs/en/commands)（内置命令与 bundled skills 的官方分界）
- [Interactive mode — 快捷键与快速命令](https://code.claude.com/docs/en/interactive-mode)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Skills](https://code.claude.com/docs/en/skills)、[Hooks](https://code.claude.com/docs/en/hooks)、[MCP](https://code.claude.com/docs/en/mcp)、[Memory](https://code.claude.com/docs/en/memory)
- [Claude Cowork 产品页](https://claude.com/product/cowork)
- [Claude Code 文档索引（llms.txt）](https://code.claude.com/docs/llms.txt)
