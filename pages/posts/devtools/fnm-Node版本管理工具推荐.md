---
title: fnm-Node版本管理工具推荐
date: 2026-08-17
updated: 2026-08-17
categories:
  - 开发工具
  - 工具推荐
tags:
  - fnm
  - Node
---
# fnm：我现在唯一在用的 Node 版本管理器

## 概述

fnm（Fast Node Manager）是一个用 Rust 编写的 Node.js 版本管理器，由 Schniz 开发。它的定位很克制——不发明新的工作流，而是把 nvm 那套已经被广泛接受的命令和配置文件（`.nvmrc`）原样接过来，用编译型二进制重写实现，顺便补上 nvm 在 Windows 上缺失的那一半。

- 仓库：https://github.com/Schniz/fnm
- 协议：GPL-3.0
- Star：26.6k / Fork：640
- 主要语言：Rust
- 最新版本：v1.39.0（2026-03）
- 平台：macOS / Linux / Windows（原生支持，非 WSL 兼容层）

**一句话定位**：nvm 的命令你一条都不用重学，`.nvmrc` 一个字都不用改，换来的是快一个数量级的响应，以及一个在 Windows 上真正能用的同款工具。

---

## 一、为什么使用它

### 1. 启动开销从「每开一个终端交一次税」降到接近零

这是 fnm 最直接的价值，也是从 nvm 迁移过来后感知最强的一点。

nvm 的本体是一段几千行的 shell 脚本，需要在每次 shell 启动时 `source` 进来。这意味着**每开一个终端标签页，你都要为它付一次初始化成本**，实测量级在 100ms 以上。单次看不出什么，但叠加上「频繁开新窗口」「tmux 分屏」「IDE 内置终端」「每个 CI job 都要初始化一次」这些日常场景，累积的等待是实打实的。

fnm 是单个编译好的二进制，启动时间在 1ms 以内。版本切换的差距同样明显：nvm 热态切换约 148–217ms，fnm 约 4–5ms。

对这个差距要有一个清醒的判断：**它不会改变你的产出，只是消除了一个持续存在的低级摩擦**。但工具类软件的价值往往就体现在这种地方——不是让你做成某件原本做不到的事，而是把一件每天要做几十次的事的成本降到不用去想它。

### 2. 命令与配置完全兼容 nvm，迁移成本几乎为零

```bash
fnm install 22        # 对应 nvm install 22
fnm use 22            # 对应 nvm use 22
fnm default 22        # 对应 nvm alias default 22
fnm ls                # 对应 nvm ls
```

同时读取项目里已有的 `.nvmrc`，也支持更通用的 `.node-version`。**换句话说，团队里的项目配置文件一个字都不用改，其他同事继续用 nvm 也不受影响。**这一点决定了 fnm 是可以单人静默迁移的——不需要先说服整个团队，也不需要在 README 里改一行文档。

### 3. `cd` 自动切版本

开启 `--use-on-cd` 后，进入任何带 `.nvmrc` / `.node-version` 的目录会自动切到对应版本：

```bash
# ~/.zshrc
eval "$(fnm env --use-on-cd --shell zsh)"
```

nvm 也能通过 shell hook 实现类似效果，但需要自己往配置里粘一段社区流传的脚本，而且每次 `cd` 都要跑一遍 shell 逻辑，本来就不快的启动会更慢。fnm 把这个能力做进了本体，且因为是二进制，自动切换的开销可以忽略。

在同时维护多个 Node 版本项目的场景下，这个功能消除了一整类问题：那种「装依赖装到一半报奇怪的原生模块编译错误，排查半天发现是忘了切版本」的时间浪费。

### 4. 单文件、无运行时依赖

安装产物是一个二进制文件，不依赖 Node 本身（这一点很关键——版本管理器不应该依赖被它管理的东西），也不需要 Python、不需要额外的编译工具链。卸载就是删文件。放进 Docker 镜像或 CI 环境时，这个特性省掉的麻烦比想象中多。

---

## 二、我为什么使用它：全平台统一

这是我个人切换过去的**首要原因**，甚至优先于性能。

### 一个容易被忽略的事实：nvm 在 Windows 上根本不是同一个项目

很多人以为 nvm 是一个跨平台工具，实际上不是：

| | nvm-sh/nvm | coreybutler/nvm-windows |
|---|---|---|
| 作者 | Ljharb 等 | Corey Butler |
| 实现语言 | Shell | Go |
| 平台 | macOS / Linux | Windows |
| 关系 | **两个完全独立的项目，无代码复用** | |
| `.nvmrc` 支持 | 支持 | 支持不完整 / 行为不一致 |
| 命令差异 | — | `nvm alias`、`nvm exec` 等命令缺失或语义不同 |

它们只是**名字撞了**。这带来的实际后果是：在 macOS 上写好的开发文档、脚本、Makefile，拿到 Windows 上不能直接用；跨平台协作的团队里，环境搭建文档必须写两套；自己在两台机器间切换时，肌肉记忆会不断出错。

### 关于 nvm-windows 的现状，需要一个准确的说法

网上常见「nvm-windows 已经荒废」的说法，这个描述不够准确，也不太公平。**它的实际状态是：官方宣布进入 feature freeze（功能冻结），当前的 v1.2.x 被定位为过渡版本，作者把开发精力转向了继任项目 Runtime。**

也就是说它并没有被抛弃，安全修复和基本维护仍在进行——但对使用者来说，结论是相似的：

- 这条线上不会再有新功能，包括那些长期缺失、和 nvm-sh 对不齐的部分；
- 未来的路径是迁移到 Runtime，那是另一个工具、另一套命令，**又是一次迁移成本**；
- 在它完成交接之前的这段窗口期，Windows 用户处在一个「维护中但停止演进」的尴尬位置。

fnm 在这件事上给出的答案很干净：**一份代码，三个平台，同一套命令，同一份文档，同一个维护者。**不存在「macOS 的 fnm」和「Windows 的 fnm」两个项目。对我来说，跨机器工作时不再需要在脑子里维护两套心智模型，这个价值高于省下的那 100ms。

---

## 三、为什么推荐它

### 项目健康度

- **26.6k star**，在 Node 版本管理器这个细分品类里属于第一梯队；
- 维护持续但节奏理性——最新 release v1.39.0 发布于 2026 年 3 月，最近提交在 2026 年 7 月（例行的 Rust 工具链升级）。这里要客观说明：**fnm 不是一个高频更新的项目**。对版本管理器这类基础设施来说，这恰恰是好事，功能边界已经收敛，剩下的工作主要是跟进 Node 新版本和维护平台兼容性；
- 被大量 CI 模板、Dockerfile 和团队规范采用，遇到问题基本能搜到现成答案。

### 安装

```bash
# macOS / Linux
brew install fnm
# 或
curl -fsSL https://fnm.vercel.app/install | bash

# Windows
winget install Schniz.fnm
# 或 scoop install fnm / choco install fnm

# 任意平台（已有 Rust 工具链）
cargo install fnm
```

安装后需要在 shell 配置里加一行 `eval "$(fnm env --use-on-cd --shell zsh)"`（bash / fish / PowerShell 各有对应写法），这是唯一需要手动做的一步。

---

## 四、适用场景

### 强烈推荐

- **正在用 nvm 且经常开新终端**：tmux 分屏、IDE 内置终端、频繁开标签页——每开一个都在付 100ms+ 的初始化成本，fnm 直接把这项开销抹平。这是转化率最高的人群，迁移成本近乎为零；
- **同时在 Windows 和 macOS / Linux 之间工作**：这是 fnm 最不可替代的价值，下面单独说；
- **手上有多个 Node 版本不一的项目**：配合 `--use-on-cd`，`cd` 即切版本，彻底消除「装依赖报原生模块编译错误，排查半天发现是版本没切」这类时间浪费；
- **要往 CI / Docker 镜像里塞一个版本管理器**：单文件二进制、不依赖 Node 本身、不需要 Python 和编译工具链，这几条在容器场景里省掉的麻烦比想象中多；
- **团队里其他人还在用 nvm**：`.nvmrc` 完全兼容，你可以单人静默迁移，不需要先说服任何人，也不用改一行 README。

### 不建议

- **需要「版本锁定强制生效」的团队约束**：fnm 只做版本切换，不会阻止你在错误的版本下执行命令。如果需要「谁都不可能用错版本」的硬约束，Volta 的 pin 机制更合适——它把版本信息写进 `package.json` 并接管 `node`/`npm` 的调用入口；
- **需要统一管理多语言运行时**：如果 Node、Python、Go、Java 都要管，mise 或 asdf 这类通用版本管理器能一套工具全覆盖。fnm 只管 Node，这是刻意的单一职责；
- **项目本身就固定单一 Node 版本**：直接用系统包管理器装，或者干脆用 Docker，没有引入版本管理器的必要。

---

## 结论

如果你现在在用 nvm，**且没有上面提到的强锁定或多语言需求，那么迁移到 fnm 是一个几乎无风险的纯收益动作**：命令不用重学，配置文件不用改，团队不用协调，收获是快一个数量级的响应和一个真正跨平台的工具。

如果你同时在 macOS/Linux 和 Windows 之间工作，那这不是一个「可以考虑优化一下」的选项，而是应该优先处理的事情——nvm 在这两端的割裂是结构性的，不会因为等待而好转。

---

## 参考

- [fnm - GitHub](https://github.com/Schniz/fnm)
- [nvm-windows - GitHub](https://github.com/coreybutler/nvm-windows)
- [nvm-windows 项目路线图与功能冻结说明 - DeepWiki](https://deepwiki.com/coreybutler/nvm-windows/5.3-feature-requests-and-project-roadmap)
- [Node.js Version Managers: fnm vs Volta vs nvm - DeployHQ](https://www.deployhq.com/guides/node-version-managers)
- [fnm vs nvm vs Volta: Node.js Versions 2026 - PkgPulse](https://www.pkgpulse.com/guides/fnm-vs-nvm-vs-volta-nodejs-version-managers-2026)
- [The 500x performance gap between Node.js version managers](https://nodevibe.substack.com/p/the-500x-performance-gap-between)
