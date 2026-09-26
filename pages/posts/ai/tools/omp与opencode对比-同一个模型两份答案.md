---
title: omp与opencode对比-同一个模型两份答案
date: 2026-09-14
updated: 2026-09-14
categories:
  - AI
  - 工具与框架
tags:
  - opencode
  - 评测
---
# omp 与 opencode对比：同一个模型，两份答案

终端 coding agent 里有两把经常被放在一起比的刷子：omp（oh-my-pi）和 opencode。都开源、都 MIT、都宣称 provider 无关，功能清单摊开来像同一个东西的两种皮肤。但有人拿同一个 PR、同一个模型在两边各跑了一遍，两边抓出来的 bug 不重合。这意味着选型没法靠对着功能表打勾解决——壳本身就是答案的一部分。

下面的数字核对过官方仓库、几份评测和一个一手实测（截至 2026-09）。

## 先分清它们是谁

|             | omp                                                            | opencode                                 |
| ----------- | -------------------------------------------------------------- | ---------------------------------------- |
| 出身        | can1357 fork 自 Mario Zechner 的 Pi，做成"电池全含"版          | Anomaly（原 SST 团队），2025 年 5 月发布 |
| 实现        | 几万行 Rust 核心（各口径 5.5 万～8 万行）+ TypeScript/Bun 表面 | TypeScript/Bun                           |
| GitHub star | 约 3.1 万（2026-09）                                           | 约 20.7 万（2026-09）                    |
| 形态        | 纯终端 TUI                                                     | TUI + 桌面应用 + VS Code 扩展            |
| provider    | 60+，含 Cursor / GitHub Copilot / Devin 订阅路由               | 75+，支持 ChatGPT Plus 订阅接入          |
| 版本口径    | v15.2.4（2026-05 实测文截图）                                  | 1.15.10（同上）                          |

opencode 是主流选项，star 数大一个数量级，社区和生态不在一个量级。omp 是 Pi 阵营里的开箱即用分支——上游 Pi 刻意极简，内置工具就 read/bash/edit/write/grep/find/ls 七个；omp 在这个地基上堆料，堆了 30 多个。

这个关系像 NeoVim 和 LazyVim：一个给你地基，一个给你配好的发行版。

## omp 的牌：把 IDE 拆进终端

omp 的自我定位是"a coding agent with the IDE wired in"，它的差异点全在这句话里。

LSP 集成是全套的，14 种语言服务操作——rename、go-to-definition、code actions。意味着 agent 做重构时拿到的是工作区级的符号信息，不是文本替换猜的。DAP 调试器支持 lldb、dlv、debugpy，能真打断点单步走，不是只会把脚本重跑一遍。

再加一组 AST 工具（`ast_grep`/`ast_edit`）：按语法结构搜索和改写，搜 `console.log($$$)` 这种调用模式，不会被字符串、注释、格式差异骗到。写 codemod 时有用。但要泼一盆冷水：AST pattern 对形状敏感，模型会写错查询，大重构里 LSP rename 仍然比 AST 稳。它是多一个工具，不是信仰。

最实的优势其实是 `read`。一个工具直接读文件、目录、压缩包（tar/zip）、SQLite、PDF、DOCX、PPTX、XLSX、Jupyter notebook、URL，语法内建在工具说明里：

```
file.db                          列出表和行数
file.db:table                    看表结构和样例
file.db:table?key                按主键取一行
file.db:table?limit=50&offset=100  分页
file.db?q=SELECT ...             只读查询
```

模型不需要自己发明 sqlite3 命令，不需要装 sqlite3，不会把转义搞错，也不会把三万行 dump 进上下文。PDF、表格、notebook 同理。

另外它把 harness 行为做成了显式旋钮：`steeringMode`、`interruptMode`、`compaction.strategy`。想要控制权的人喜欢这个，另一部分人看到的就是三个兔子洞。

## opencode 的牌：不炫技的产品

opencode 的工具箱是标准套装：shell、read、glob、grep、edit/apply_patch、task/subagents、todo、web fetch/search、skills、插件和 MCP，LSP 可选开启，诊断信息会回喂给模型。它不试图成为万能瑞士军刀——读源码文件、目录、图片、PDF，够写代码用了，再多的不碰。

它的竞争力在产品层：键盘驱动的 TUI、会话持久化、git 集成、可选的桌面应用和 VS Code 扩展。行为上刻意收敛，把 omp 暴露成配置的那些东西（转向模式、中断策略、压缩策略）藏在默认值里，开箱就是成品。

一个数字能说明生态差距：opencode 的 star 从 2026 年 6 月的 16 万出头涨到 9 月的 20.7 万，三个月涨了一个 omp 的总身位。

## 同一个 PR，两份答案

光比功能清单得不出结论，真正有信息量的是一个对照实验（AkitaOnRails，2026-05-25）：拿同一个待合并的 PR（ai-memory#10），让三套组合各审一遍找真实问题——omp 配 GPT-5.5、opencode 配 GPT-5.5、Claude Code 配 Opus 4.7。

结果是三个都没找全。假设 PR 有 A、B、C、D 四个问题，大致形状是：omp 找到 A 和 B，opencode 找到 B 和 C，Claude 找到 C 和 D。各自抓到了别人漏掉的，也各自漏了别人抓到的。

最值得记的细节：omp 和 opencode 用的是同一个 GPT-5.5，答案却不重合。因为壳改变了模型看到的一切——系统提示词、工具清单、上下文格式、信息排序、该用 LSP 还是 AST 的压力方向。同模型不同壳，就是两条不同的推理路径，走到不同的地方，漏掉不同的东西。

就这次实验而言，omp 和 opencode 打平。都是合格的 harness，也都会漏。别指望任何一个把代码审查变成完美审计。

## omp 有时用力过猛

同一个作者还记了个轶事。让 omp 改一篇双语博文的局部内容：葡语部分改对了，英语部分它决定整篇从头重译。一次局部小改，token 花出了一次全文翻译的量。Claude Code 和 opencode 做同类任务通常只动被要求的那一段。

单个案例不构成结论，但方向和工具设计一致：omp 工具多，而且急着用。有时会在 opencode 会直接走直线的地方绕路，把答案做复杂了。这也呼应另一个常见印象——omp 默认输出偏啰嗦，想收敛得去调配置，而调配置正是它提供的兔子洞。

## 到底选谁

场景分开说：

- 常规源码工程——CRUD、后端服务、前端、CLI：opencode。同模型下效果不输 omp，更内聚、更顺手、生态大一个量级，踩坑有人陪。
- 项目里大量非代码工件——SQLite、表格、PDF、notebook、压缩包，或者做审计、数据迁移、文档分析：omp。万能 `read` 是真实优势，省掉的是模型自己拼命令、错转义、污染上下文这三类高频事故。
- 重度依赖 LSP 重构和 AST 批量改写的代码库：omp。
- 需要桌面端或 IDE 集成、团队统一环境：opencode。

订阅路线也值得一提：想把 ChatGPT Plus 订阅接进终端 agent，opencode 官方支持；omp 能路由 Cursor / Copilot / Devin 的订阅。Anthropic 明确禁止第三方工具用 Claude Pro/Max 登录，想用补贴价 Opus 就得回 Claude Code——这条对两家的选型影响相同。

两个都是单命令安装，切换零迁移成本。最务实的姿态是 opencode 当主力，omp 留在工具箱里按场景取用。

## 我们能做的

选型别看功能表和 star 数。功能表回答不了"哪个在我这类任务上更好"，star 数回答的是流行度不是适配度。可操作的替代方案：从自己仓库挑一个待合并的真实 PR，让候选 agent 配同一个模型各审一遍，对比谁抓的 bug 更贴你的痛点。一个下午能测完，比读十篇评测可靠。

排查 agent 答案质量时，把 harness 列为变量。同一个模型换个壳，推理路径就变，"这模型不行"的结论先别急着下，换个 harness 重跑一次再定。反过来，评测报告里没写明 harness 版本的跑分，参考价值也要打折。

最后，双工具策略的成本比想象低。这类终端 agent 安装就是一条命令，配置互不干扰，不值得为"只留一个"纠结。主力求稳，场景工具求专，按任务切换。

## 参考

- omp 官方仓库：https://github.com/can1357/oh-my-pi
- omp 官网与安装：https://omp.sh
- opencode 官网：https://opencode.ai
- opencode 架构概览：https://deepwiki.com/sst/opencode
- AkitaOnRails 一手实测（2026-05-25，同一 PR 三工具对照）：https://akitaonrails.com/en/2026/05/25/first-impressions-using-oh-my-pi-and-opencode/
- AI/TLDR 工具页（omp / opencode，star 数口径 2026-09）：https://ai-tldr.dev/tools/oh-my-pi/
- DevThrottle opencode 评测页：https://devthrottle.com/coding-agents/opencode
- RunThis AI omp 指南（2026-07-20）：https://runthisai.com/en/blog/oh-my-pi-guide
