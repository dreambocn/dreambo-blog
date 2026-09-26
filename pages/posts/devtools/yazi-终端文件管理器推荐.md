---
title: yazi-终端文件管理器推荐
date: 2026-08-17
updated: 2026-08-17
categories:
  - 开发工具
  - 工具推荐
tags:
  - yazi
  - 终端
---
# yazi：全异步的终端文件管理器

## 概述

yazi 是一个用 Rust 编写的终端文件管理器，由 sxyazi 开发。名字取自「鸭子」（鸭子在水面上从容，水下脚掌高速划动）——这个隐喻精准描述了它的技术核心：**所有耗时操作全部异步化，界面永远不阻塞**。

- 仓库：https://github.com/sxyazi/yazi
- 协议：MIT
- Star：41.4k / Fork：984
- 主要语言：Rust
- 版本方案：CalVer（如 `v26.5.6` 即 2026-05-06）
- 平台：Linux / macOS / Windows / Android
- **项目状态：public beta，官方明示「预期会有破坏性变更」**

**一句话定位**：如果你曾经因为「进大目录会卡、预览大文件会冻住」而放弃过终端文件管理器，退回到 `ls` + `cd`，yazi 就是那个让你能重新试一次的答案。

---

## 一、为什么使用它

### 1. 全异步 I/O：这是它和前辈的根本差异，不是优化

终端文件管理器的经典痛点是**卡顿**，而且卡在最不该卡的地方：

- 进入一个有 10000 个文件的目录，界面冻住几秒；
- 光标移到一个大视频文件上，等缩略图生成的时候整个 UI 无响应；
- 对目录树算总大小，算完之前什么都做不了。

ranger 用 Python 写，在大目录上会明显吃力；lf 快但功能极简，很多能力要自己配。

yazi 的做法是**从架构上把这类操作全部移出主线程**：目录列举、预览生成、大小计算都在后台跑，CPU 密集任务分发到多线程。实际体感是——**进入一个 10000 文件的目录和进入一个 10 文件的目录，操作手感没有区别**。预览还没算好时你可以继续移动光标，算好了自己会刷新上来。

这个差异不是「快了 30%」的量变，而是「不会卡」和「会卡」的定性区别。对经常在大型代码仓库、日志目录、媒体文件夹里翻找的人，这一条基本就足够构成迁移理由了。

### 2. 预览能力开箱即用

内置多种图片协议支持：**Kitty、iTerm2、WezTerm、Sixel**。在支持的终端里，图片是真的以像素渲染出来的，不是字符画。

配合可选依赖，预览覆盖面相当广：

| 预览类型 | 依赖 |
|---|---|
| 视频缩略图 | ffmpeg |
| PDF | poppler |
| 压缩包内容 | 7-Zip |
| JSON 格式化 | jq |
| SVG | resvg |
| 字体 / HEIC / JPEG XL | ImageMagick ≥7.1.1 |
| 代码高亮 | 内置 |

**注意：唯一的必需依赖只有 `file`（用于文件类型识别），其余全部可选。**装多少取决于你要预览什么，这个渐进式的依赖设计比"装不全就跑不起来"要友好得多。

### 3. Lua 插件系统 + 官方包管理器

插件用 Lua 编写并且是并发执行的。更关键的是 yazi 自带包管理器（`ya pkg`），插件和主题（flavors）都能一条命令装：

```bash
ya pkg add yazi-rs/plugins:full-border
ya pkg add yazi-rs/flavors:catppuccin-mocha
```

这解决了 ranger 时代的一个老问题——插件靠往配置目录里手动扔 Python 文件，装了什么、版本多少、怎么更新全靠自己记。

### 4. 与现代 CLI 工具链深度集成

原生集成 **fd**（文件名搜索）、**ripgrep**（内容搜索）、**fzf**（子树跳转）、**zoxide**（历史目录跳转）。

这个设计取向值得肯定：**不重复造轮子，而是把已经赢得共识的工具接进来当子系统**。如果你本来就在用这套工具，yazi 相当于给它们套了一个统一的可视化外壳。

---

## 二、必做的一步：shell wrapper

装完之后**第一件事**应该是配置 `y` 函数，否则你会损失掉这个工具一半的价值。

原因是：直接跑 `yazi` 命令，退出后 shell 还停在原来的目录。而文件管理器最高频的用途之一恰恰是「**导航到某个深层目录，然后在那里干活**」。

官方给的 wrapper（写进 `.bashrc` / `.zshrc`）：

```bash
function y() {
	local tmp cwd
	tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
	command yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ "$cwd" != "$PWD" ] && [ -d "$cwd" ] && builtin cd -- "$cwd" || builtin true
	command rm -f -- "$tmp"
}
```

之后用 `y` 启动。**按 `q` 退出会 cd 到你最后所在的目录，按 `Q` 退出则保持原目录不变**——两种退出方式区分开，这个细节设计得很好。

配好之后，`y` 就从「一个文件管理器」变成了「一个可视化的 cd」，使用频率会上一个数量级。

> 小提醒：shell 里的 `y` 命令和 yazi **内部**的 `y` 键（yank / 复制）是两回事，不冲突，但初见容易困惑。

### 基本键位

完全是 vim 心智模型，有 vim 基础几乎零学习成本：

- **导航**：`h j k l`（返回上级 / 下 / 上 / 进入）
- **选择**：`Space` 切换选中，`v` 可视模式，`Ctrl+a` 全选
- **操作**：`y` 复制，`x` 剪切，`p` 粘贴，`d` 删到回收站，`D` 永久删除
- **搜索**：`s` 按文件名（fd），`S` 按内容（rg），`/` `?` 当前目录内查找
- **其他**：`Enter`/`o` 打开，`Tab` 文件信息

---

## 三、为什么推荐它

- **41.4k star**，已经显著超过 ranger、lf、nnn 等前辈，是当前该品类关注度最高的项目；
- **开发极其活跃**，CalVer 高频发布；
- **跨平台完整**，包括 Windows 和 Android（这一点比很多 Unix 传统工具走得远）；
- **文档质量高**，官方站 https://yazi-rs.github.io 的完成度在同类工具里属于顶级；
- 社区活跃，有英文 Discord 和中文 Telegram 群。

### 安装

```bash
# macOS / Linux
brew install yazi

# 推荐一并装上可选依赖
brew install ffmpeg sevenzip jq poppler fd ripgrep fzf zoxide imagemagick resvg

# Windows
scoop install yazi
# 或 winget install sxyazi.yazi

# Arch
pacman -S yazi

# 从源码
cargo install --locked yazi-build
```

另外强烈建议装一个 **Nerd Font** 并在终端里启用，否则图标会显示成方块。

---

## 四、边界与代价

### 1. Public beta —— 这是最需要提前知道的

官方 README 明确写着项目处于 public beta，「**heavy development, expect breaking changes**」。这不是免责声明式的客套，是真实发生过的：

- `[open]` 规则里的字段曾从 `name` 重命名为 `url`，直接破坏已有配置；
- 有过 Windows 上升级后预览面板空白、文件打不开的 issue。

**实际影响**：你的 `yazi.toml` / `keymap.toml` 可能在某次升级后需要调整。对个人机器这是可接受的小代价（配置文件本来就该进 dotfiles 版本管理），但**如果你打算把它写进团队标准环境或做进基础镜像，需要显式锁版本**。

官方同时说明「can be used as a daily driver」——即功能上足够日常使用，风险集中在配置兼容性而非稳定性。这个定位是诚实的，我实际使用中没有遇到崩溃或数据问题。

### 2. 想发挥全部能力，依赖不少

核心只要 `file`，但要拿到完整预览体验，上面那串可选依赖基本都得装。相比 nnn（一个 C 语言小二进制，几乎零依赖）它明显更「重」。

如果你的场景是在资源受限的服务器、容器里临时看文件，nnn 或 lf 更合适；yazi 更适合本地开发机。

### 3. 对终端有要求

图片预览依赖终端支持 Kitty / iTerm2 / WezTerm / Sixel 协议。如果你用的是 macOS 自带 Terminal.app 或某些老终端，图片预览这块能力直接不可用（会退化成文本信息）。这不是 yazi 的问题，但会影响你对它的评价——**换终端是使用 yazi 的隐性前置成本**。

### 4. 学习曲线取决于 vim 熟悉度

vim 用户几乎零成本。非 vim 用户需要适应 `hjkl` 和模式化操作，会有几天不适期。

---

## 五、适用场景

### 强烈推荐

- **经常在大目录里翻找**：大型代码仓库、日志目录、`node_modules`、素材文件夹——异步架构的收益和目录规模成正比，这是 yazi 相对所有前辈最硬的优势；
- **需要预览再决定**：处理截图 / 设计稿 / PDF / 视频 / 压缩包时，「进目录直接看到内容」比「猜文件名 → 打开 → 关掉 → 再猜」快一个量级；
- **本来就在用 fd / rg / fzf / zoxide**：yazi 相当于给这套工具链套了一个统一的可视化外壳，几乎没有额外学习成本；
- **vim 用户**：键位是原生的 vim 心智模型，上手基本是零；
- **用 Kitty / iTerm2 / WezTerm 等现代终端**：真正的像素级图片预览只有在这些终端里才有；
- **需要频繁「导航到深层目录再干活」**：配好 `y` 函数后，它本质上是一个可视化的 `cd`。

### 不建议

- **主要在服务器 / 容器里临时看文件**：yazi 要装依赖、要配终端，nnn 那种近乎零依赖的 C 语言小二进制更合适；
- **终端不支持图片协议且不打算换**：预览能力会退化成纯文本，工具价值大打折扣；
- **要把它写进团队标准环境或基础镜像**：public beta 阶段配置文件可能被破坏性变更影响，至少要锁版本；
- **已有大量 ranger 配置且工作流稳定**：迁移收益要和重配成本对冲，不急着动；
- **完全不熟悉 vim 键位且不想学**：会有几天明显的不适期。

### 同类对照

| | 语言 | 定位 | 适合谁 |
|---|---|---|---|
| **yazi** | Rust | 全异步、功能完整、可扩展 | 本地开发机日常主力，尤其常翻大目录 / 需要预览 |
| **ranger** | Python | 老牌、功能全、生态成熟 | 已有大量 ranger 配置，迁移意愿低 |
| **lf** | Go | 极简、快、全靠自己配 | 喜欢从零搭配置、只要核心导航 |
| **nnn** | C | 极轻量、近乎零依赖 | 服务器 / 容器 / 低配环境 |

**结论倾向**：2026 年从零开始选，yazi 是默认答案——首次运行体验、异步预览、插件生态、跨平台四项都领先。ranger 的主要价值已经变成「存量迁移成本」。

---

## 结论

yazi 是我近两年换掉的工具里，**体感提升最直接的一个**。它的价值不在于提供了什么别人没有的功能——终端文件管理器该有的能力 ranger 十年前就都有了——而在于**用正确的架构把这些能力做到了不卡**。

工具的可用性阈值是很微妙的：一个会卡的文件管理器，你会下意识地回去用 `ls` + `cd`；一个不卡的，你才会真的把它变成肌肉记忆。yazi 跨过了这个阈值。

**建议路径**：`brew install yazi` → 装上可选依赖 → **配好 `y` 函数** → 用一周。如果一周后你还在用 `cd` 翻目录，那说明它不适合你的工作方式；但大概率不会。

唯一需要认真对待的是 public beta 状态——把配置文件纳入 dotfiles 管理，升级时留意 CHANGELOG，仅此而已。

---

## 参考

- [yazi - GitHub](https://github.com/sxyazi/yazi)
- [yazi 官方文档](https://yazi-rs.github.io/)
- [安装与可选依赖](https://yazi-rs.github.io/docs/installation)
- [Quick Start（含 shell wrapper）](https://yazi-rs.github.io/docs/quick-start)
- [CHANGELOG](https://github.com/sxyazi/yazi/blob/main/CHANGELOG.md)
- [Yazi: The Terminal File Manager Replacing Ranger - SumGuy's Ramblings](https://sumguy.com/yazi-terminal-file-manager-replacing-ranger/)
- [nnn vs Yazi (2026) - mq-dir](https://mqdir.com/blog/file-management/nnn-vs-yazi)
- [14 Must-Have Linux Terminal File Managers in 2026 - Tecmint](https://www.tecmint.com/linux-terminal-file-managers/)
