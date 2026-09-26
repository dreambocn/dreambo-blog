---
title: 推荐文 cua-让AI接管真实桌面的开源驱动
date: 2026-09-15
updated: 2026-09-15
categories:
  - AI
  - Agent
tags:
  - Agent
  - computer-use
---
# cua：让 AI 接管真实桌面的开源 computer-use 驱动

> 一句话定位：MIT 开源的 Rust 桌面驱动（trycua/cua，22.7k star，2026-09-15 数据），把 macOS / Windows / Linux 的真实桌面——原生 App、窗口、键盘鼠标、截屏——以 MCP 工具的形式交给任意 coding agent；在 macOS 上可以不抢你的焦点、不动你的鼠标，在后台把事办完。

## 概述

浏览器自动化已经卷烂了，但 agent 的能力边界始终卡在浏览器边框上：原生 App、跨应用流程、系统弹窗、菜单栏，这些浏览器管不到的地方是 computer use 的地盘。

cua（trycua/cua）做的就是这个：一个原生桌面驱动，agent 通过 MCP 或 CLI 调它的工具，去"看"屏幕、点按钮、敲键盘。它不是套壳截图 + 猜坐标——驱动直接读系统辅助功能树（Accessibility），能用元素级 API 操作的绝不走像素模拟。仓库 4700+ commits、1.6k fork（2026-09-15），主干已经从早期的 Python agent 包整体重写为 Rust，当前核心产品叫 Cua Driver。

仓库里是四件套：Driver（本文主角）、Lume（Apple Silicon 上跑本地 macOS/Linux 虚拟机给 agent 用）、Fleets（云端隔离桌面池，商业服务）、Cua Bench（computer-use 任务评测与轨迹导出）。个人日常用的是 Driver，它是免费开源的部分。

## 一、为什么使用它

现有方案基本两类，各有硬伤：

**截图 + 坐标流**（大多数 computer-use MCP，如 Windows 下的 MCPControl）：靠截屏喂给视觉模型，让模型报出像素坐标再合成鼠标事件。问题有三层——吃视觉模型能力；坐标在高分屏、缩放、动态 UI 下不可靠；点击前必须把窗口带到前台，你正在干的活会被打断。

**AppleScript / 系统脚本流**：只能覆盖支持脚本的 App，覆盖面碎，且没有给 agent 的标准接口。

cua Driver 的差异化：两条路都通，且默认走后台路径。macOS 上操作一个后台最小化的窗口，不需要把它调到前台，不需要移动你的鼠标指针。对每天开着七八个窗口干活的开发者，这是"agent 在旁边帮忙"和"agent 抢我电脑"的区别。

## 二、cua 独有的技术点

**1. 双寻址操作。** 每个 MCP 工具（click、right_click、double_click 等）都有两种目标方式：

- 元素路径：传 `element_index` / `element_token`（来自窗口辅助功能树的快照），走纯 AX API RPC。对后台、最小化、隐藏窗口都有效，零焦点抢占。
- 像素路径：传 `x, y`，走 CGEvent 合成鼠标事件投递给目标进程。留给 AX 树覆盖不到的表面——canvas、视频、WebGL、自绘控件。

**2. 双模态感知 + 交叉验证。** 核心感知工具 `get_window_state` 一次返回两个东西：结构化元素树（每个可交互元素带索引、角色、标签、当前值、坐标框）和窗口截图。官方文档原话是"树在某些表面会说谎"——Electron 会回显确认、Catalyst 有空值、虚拟化列表有高度为 1 的假行——所以要求 agent 用截图交叉验证，操作时自己选走哪条路。这个设计比"纯视觉流"和"纯 AX 流"都诚实。

**3. 权限模型在进程启动时固定。** 三档：`standard`（默认，对桌面所有 App 免提示输入）、`bounded`（只允许已审阅清单里的工具、App、浏览器域名、目录，清单外一律拒绝）、`unrestricted`（要显式传 `--dangerously-bypass-approvals`）。关键在于 agent 无法从工具调用里给自己提权——权限属于拥有运行时的那个 daemon 进程，改档必须重启 daemon。无人值守跑任务时用 bounded 是正解。

**4. macOS TCC 归属处理得干净。** Accessibility 和 Screen Recording 授权挂在 `CuaDriver.app` 的签名身份（`com.trycua.driver`）上而不是终端进程上，所以升级不会丢权限。安装器把 App 放进 /Applications，MCP 进程自动代理到 App 的 daemon。

**5. 并发会话隔离。** `launch_app` 支持 `creates_new_application_instance: true`，强制拉起新实例——两个 agent 会话同时操作同一个 App 时各自拿到独立窗口，不会互相打架。

macOS 上 Driver 暴露 56 个 MCP 工具（Windows/Linux 各有自己的工具集），另有内置的 `skill://cua-driver/` 资源和可安装的 agent skill 文件包。

## 三、为什么推荐它

**安装是一条命令，不要管理员权限。** macOS 14+（Sonoma）：

```bash
/bin/bash -c "$(curl -fsSL https://cua.ai/driver/install.sh)"
```

Windows 10/11（PowerShell，无交互式会话时跳过自启注册）：

```powershell
irm https://cua.ai/driver/install.ps1 | iex
cua-driver autostart kick
```

Linux（x86_64 桌面会话，先补依赖）：

```bash
sudo apt install libxi6 at-spi2-core
/bin/bash -c "$(curl -fsSL https://cua.ai/driver/install.sh)"
```

**接 agent 是标准 MCP。** 任何接受通用 `mcpServers` 配置的客户端都能接（Claude Code / Codex / Cursor / OpenCode 等有官方预设，其余客户端用通用 JSON；建议写绝对路径，避免 GUI 启动的会话 PATH 里没有 `~/.local/bin`）：

```json
{
  "mcpServers": {
    "cua-driver": {
      "command": "/Users/you/.local/bin/cua-driver",
      "args": ["mcp"]
    }
  }
}
```

**macOS 上初次使用多三步**（先起 daemon 再授权，否则 TCC 请求会算到你终端头上）：

```bash
open -n -g -a CuaDriver --args serve   # 先启动 daemon
cua-driver permissions grant            # 触发 Accessibility + Screen Recording 两轮授权
cua-driver permissions status           # 确认两项都拿到
cua-driver doctor                       # 全环境体检
```

授权有两个坑，提前知道：系统弹窗上的按钮是"Open System Settings"不是"Allow"——弹窗本身不授权，要去系统设置里把 CuaDriver 的开关打开；开关打开后必须完全重启 App 才生效，弹窗问要不要 quit and reopen 时选是。`permissions status` 显示只拿到一项就再跑一遍 grant 补另一项。

**活跃度和工程质量。** 2026-09 时点 22.7k star，发版节奏密，文档有独立的 MCP 工具参考、权限模式参考、平台支持矩阵，甚至有 `doctor` 体检命令——不是 demo 级项目。Rust 实现带 UniFFI 绑定（Python / TypeScript SDK）和稳定 C ABI，除了接 agent 还能嵌进自己的应用。

## 四、边界与代价

**本质是把鼠标键盘交给模型。** standard 模式下 agent 可以对桌面上任何 App 输入，包括你的终端、密码管理器、聊天软件。给生产凭据同机的 agent 挂这个 MCP 前想清楚；无人值守场景应该写 bounded manifest。

**截图坐标流该付的成本一样要付。** 元素路径虽准，但每轮操作前必须重新拿快照（快照按窗口作用域缓存、过期即失效），大页面的 AX 树展开能到上万个元素——Electron / Obsidian 这类 App 会爆 agent 的上下文窗口。好在工具面带 `max_elements` / `max_depth` 截断和 `query` 投影，用对参数可控。

**带修饰键的点击必须走前台路径。** cmd+click 这类操作 macOS 观察的是物理修饰键状态，后台 AX 路径传不了修饰键，会短暂置前再还原。偶尔你的焦点会被晃一下。

**遥测默认开**（内容无关的产品遥测），介意就 `cua-driver telemetry disable`，设置跨升级保留。

**daemon 要常驻。** macOS 上 MCP 进程只是代理，真正干活的是 CuaDriver.app 的后台 daemon；它没跑，agent 的所有工具调用都失败。记得 `cua-driver autostart enable` 登录自启。

**浏览器接管默认用自己的隔离 profile。** 想让 agent 操作你已登录的那个浏览器 profile，要显式 `--grant existing-profile`，这是刻意的安全边界。

## 五、适用场景

- **日常开发提效**：让 coding agent 顺手操作原生 App——打开计算器验算、在 Finder 里整理文件、操作 Xcode / Android Studio 跑构建，不用你离开当前窗口。
- **有 Windows 虚拟机的桌面自动化**：Driver 的 Windows 支持配合远程桌面，把重复的 GUI 流程交给 agent。
- **UI 自动化测试**：AX 树 + 截图双模态天然适合断言"按钮真的变了状态"，比纯视觉流稳定。
- **给 agent 一个独立电脑**：配合 Lume 在 Apple Silicon 上开本地 macOS/Linux 虚拟机，或者上 Fleets 云桌面，agent 在隔离环境里随便折腾。
- **computer-use 研究**：Cua Bench 建任务、跑评测、导出轨迹训练数据。

不适合：只想自动化网页（chrome-devtools 这类浏览器 MCP 更轻更准）；需要精确游戏级鼠标轨迹的自动化（CGEvent 合成事件延迟在几十毫秒级）。

## 结论

cua 是目前开源 computer-use 里工程完成度最高的一档：不是"截图给模型看"的玩具，而是把辅助功能树、像素模拟、权限边界、TCC 归属这些系统级脏活都处理掉的原生驱动。双寻址操作加后台投递，让它第一次做到"agent 帮忙而不抢电脑"。代价是你要接受把系统输入权交给模型这件事本身——standard 模式当玩具，bounded 模式当工具，这个分寸感项目方已经替你想好了，用不用在你。

## 参考

- 仓库：https://github.com/trycua/cua
- 官方文档：https://cua.ai/docs
- 安装指南：https://cua.ai/docs/how-to-guides/driver/install
- 连接 agent 指南：https://cua.ai/docs/how-to-guides/driver/connect-your-agent
- MCP 工具参考（macOS）：https://cua.ai/docs/reference/cua-driver/mcp-tools
- 权限模式参考：https://cua.ai/docs/reference/cua-driver/permission-modes

（star 数、工具数等事实数据截止 2026-09-15）
