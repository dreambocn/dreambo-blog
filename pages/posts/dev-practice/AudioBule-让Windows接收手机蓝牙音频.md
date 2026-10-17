---
title: AudioBule：让 Windows 电脑接收手机上的蓝牙音频
date: 2026-10-18
updated: 2026-10-18
categories:
  - 开发实践
  - 开源项目
tags:
  - AudioBule
  - Windows
  - 蓝牙音频
  - 开源工具
description: "AudioBule 是我做的一款 Windows 蓝牙音频接收工具，让手机声音通过电脑的耳机或音箱播放，提供多设备连接管理、托盘快捷操作、自动重连、开机启动和中英文界面。"
---

手机上正在听的音乐、播客，或者视频里的声音，能不能直接用电脑连接的耳机和音箱播放？

我做的 **AudioBule** 就是为这个场景准备的。它是一款 Windows 蓝牙音频接收工具，将手机与电脑通过蓝牙配对后，就可以在应用中连接手机，让手机的声音通过电脑的音频输出设备播放。

- [下载与安装](https://github.com/dreambocn/AudioBlue/releases/latest)
- [项目源码](https://github.com/dreambocn/AudioBlue)
- [问题反馈](https://github.com/dreambocn/AudioBlue/issues)

## 解决什么问题

坐在电脑前工作时，耳机或音箱通常已经连接着电脑，但想听的内容有时还在手机上。为了听一段音频，需要切换耳机连接，或者在电脑上重新找到同一份内容。

AudioBule 让手机成为音频来源，继续使用电脑已有的音频输出设备。内容留在手机上操作，声音交给电脑播放，适合下面这些场景：

- 手机上的音乐和播客，希望用电脑连接的音箱收听。
- 耳机连接着电脑，也想听手机上的视频声音。
- 在电脑前工作，希望通过系统托盘快速管理手机的音频连接。

## 有哪些功能

### 手机声音通过电脑播放

手机与电脑完成蓝牙配对后，在 AudioBule 中找到设备并连接，再在手机上播放音频即可。不需要把音频文件复制到电脑，也不需要在电脑上重新打开对应内容。

![AudioBule 浅色设备页，展示设备列表和连接操作](https://picture.dreambo.cn/2026/10/18/00/devices-light-9551e2db9c7475cee453db7c7d38ac30.png)

### 多设备连接管理

设备列表会分别显示每台设备的名称和连接状态，可以独立连接、断开、取消或重试。连接过程中有进度提示，失败时会显示原因，方便判断接下来该怎么处理。

多设备管理用于分别管理设备连接；实际播放效果取决于 Windows、手机和蓝牙驱动的支持情况。

### 系统托盘快捷操作

日常使用不用一直开着主窗口。关闭或最小化窗口后，应用继续驻留系统托盘，保留已有连接。

左键点击托盘图标，可以打开设备快速面板，查看状态并连接或断开设备；右键打开菜单，可以进入主窗口、设置或退出应用。

### 自动重连与开机启动

可以在设置中启用启动时自动重连上次连接的设备，减少重复操作。

开机启动默认关闭，需要时可以手动开启。启用后，登录 Windows 时应用只驻留托盘，不会自动弹出主窗口。

### 连接通知、主题和语言

连接状态通知可以按需开启或关闭。界面支持跟随系统、浅色和深色主题，也支持简体中文与 English，切换后即时生效。

![AudioBule 深色设置页，包含主题、语言、启动与通知设置](https://picture.dreambo.cn/2026/10/18/00/alignment-devices-settings-dark-zh-8983fbe334102917d7d5cd79ffe04f6f.png)

### 本地使用，无需注册账户

应用无需注册账户，没有广告或使用统计，设备列表和偏好设置保留在本机，不向项目服务器上传音频。详细说明可以查看[隐私文档](https://github.com/dreambocn/AudioBlue/blob/main/PRIVACY.md)。

## 下载与使用

AudioBule 支持 **Windows 10 2004 或更高版本**，电脑需要具备可用的蓝牙硬件和驱动。安装包提供 x64 与 ARM64 两种版本。

前往 [Releases 下载页面](https://github.com/dreambocn/AudioBlue/releases/latest)，Intel / AMD 64 位电脑选择 `_x64_Setup.exe`，Windows on ARM 电脑选择 `_arm64_Setup.exe`，按安装向导完成安装。

使用步骤很简单：

1. 在 Windows 蓝牙设置中，将手机与电脑配对。
2. 打开 AudioBule，点击刷新，在列表中找到手机。
3. 点击连接，成功后在手机上播放音频。
4. 日常通过托盘查看和管理连接；需要完全退出时，使用设置页或托盘菜单中的退出入口。

当前安装程序和应用尚未签名，Windows 可能显示未知发布者或 SmartScreen 提示，发布状态可查看[签名说明](https://github.com/dreambocn/AudioBlue/blob/main/CODE_SIGNING.md)。

AudioBule 按 MIT 许可证开源。使用中遇到设备无法显示、连接失败等问题，可以在 [GitHub Issues](https://github.com/dreambocn/AudioBlue/issues) 中提供系统版本、应用版本和复现步骤。
