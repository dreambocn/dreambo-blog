# 文章 SEO 维护

## 写文章时填写的内容

每篇公开文章都需要独立的 `title`、`description`、`date` 和 `updated`。摘要应直接概括正文，说明文章讨论的问题与覆盖范围；不要复制站点介绍，也不要堆砌关键词。

```yaml
---
# 标题描述具体主题；文件名和目录决定现有地址，不为改标题而移动文件。
title: Flink 窗口实践：水位线与迟到数据处理
description: 通过 Java 示例比较 Flink 的滚动窗口、滑动窗口和会话窗口，说明乱序水位线与迟到数据处理的配置和运行结果。
date: 2026-10-17
updated: 2026-10-17
categories:
  - 大数据开发
tags:
  - Flink
  - 流计算
# 有相关封面时再设置，文件应存在于 public 对应目录；不要填写占位路径。
# cover: /images/flink-windows.png
---
```

主题会渲染文章一级标题，正文使用 `##` 开始组织章节。保留代码块中的原始内容。正文中的图片填写具体的替代文字，解释图中表达的信息；有意义的截图优先于装饰图片。

当内容发生实质更新时修改 `updated`；仅格式整理不批量刷新日期。日期字段按本站的 `Asia/Shanghai` 时区解释。

## 分享图片与摘要

Valaxy 的分享图片顺序为 `ogImage`、`cover`、正文首图、站点图标。需要指定分享图但不展示文章封面时使用 `ogImage`。选择与内容相关且有权使用的图片，不为每篇文章重复添加站点头像作为封面。

`App.vue` 统一让搜索描述、Open Graph 与 Twitter 描述优先使用独立 `description`。未手动指定列表摘录时，`valaxy.config.ts` 复用该摘要；已有列表摘录仍保留。

## 构建与核验

```powershell
# 在项目根目录构建静态页面，同时重建站点地图并核验 SEO。
pnpm run build

# 已有最新构建时，可单独核验生成结果。
pnpm run check:seo

# 检查分类静态链接、站内链接、字体加载和部署产物。
pnpm run check:site
```

默认 `build` 和 `build:ssg` 都会执行以下步骤：

1. Valaxy 静态生成 HTML、RSS 和客户端资源。
2. `scripts/finalize-seo.mjs` 从生成页面的 canonical 去重生成站点地图，使用文章真实 `dateModified`，不为聚合页伪造更新时间。错误页、禁止索引页和外站地址不加入本站地图。
3. `scripts/check-seo.mjs` 检查全部公开文章的独立摘要、标题、单一 H1、分享类型、日期、作者和结构化数据页面关联，核对站点地图覆盖率。
4. `scripts/check-site.mjs` 检查分类页是否覆盖文章、站内链接是否有对应产物，以及字体非阻塞加载、404 禁止索引和资源缓存规则。

核验不通过时构建返回非零状态。`build:spa` 仅用于需要 SPA 产物的场景，不包含静态页面 SEO 验收。

## 地址与部署

本次优化保留全部文章文件路径与现有 URL，不批量改 slug。需要迁移文章时，应同时设置重定向并核对 canonical，避免已有链接失效。

本地构建不会发布网站。部署后应确认实际域名的 HTML、`robots.txt`、`sitemap.xml` 与本地产物一致。搜索引擎的抓取、摘要选择和收录时间由其自身决定。

Cloudflare Pages 使用 `dist` 作为发布目录，保留根目录 `404.html`；该文件让缺失页面使用自定义 404，而不进入默认 SPA 回退。`public/_headers` 会复制到 `dist`，仅对带指纹的 `/assets/*` 使用一年不可变缓存，不对文章 HTML 设置长期不可变缓存。参考：[Cloudflare 页面服务规则](https://developers.cloudflare.com/pages/configuration/serving-pages/)。

分类列表使用原生 `details` / `summary`，即使脚本不可用也能打开分类。JavaScript 启用后保持一次展开一个分类，兼容 `?category=顶级分类/子分类` 深链，并保留其他查询参数和地址片段。

主题字体样式以非阻塞方式下载，加载完成后应用；连接失败或禁用脚本时使用系统字体。原有文章图片地址和 Cloudflare 图片处理方式不变。

Docker 将站点配置安装到镜像的 `/etc/nginx/conf.d/default.conf`，保留镜像主配置；支持带或不带结尾斜杠的静态文章地址。Netlify 对未知地址返回 `404.html` 与 404 状态。以上部署配置仍需在实际部署环境检查响应状态和缓存头。

参考：[Google 搜索摘要说明](https://developers.google.com/search/docs/appearance/snippet)、[文章结构化数据](https://developers.google.com/search/docs/appearance/structured-data/article)。
