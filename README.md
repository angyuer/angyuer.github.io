# 昂予's Blog

这是一个使用 Hexo 和 Butterfly 构建的个人博客，内容分为技术、日记和项目三个频道。源码维护在 `hexo` 分支，推送后由 GitHub Actions 自动构建并发布到 `main` 分支。

## 环境

- Node.js 22 LTS
- npm
- Git

首次安装：

```bash
nvm use
npm ci
npm run dev
```

本地访问 `http://localhost:4000`。开发服务会包含草稿；正式构建不会发布草稿。
项目只支持 Node.js 22；版本不符合时，`npm run check:env` 会直接给出提示。

## 写作

使用频道命令创建文章：

```bash
npm run new:tech -- "文章标题"
npm run new:journal -- "日记标题"
npm run new:project -- "项目名称"
```

快捷命令会创建符合频道结构的正文模板，并准备 `source/images/posts/<文章标识>/`
图片目录。详细规则见 [文章写作规范](docs/writing-guide.md)。

文章位于 `source/_posts/`，统一使用以下元数据：

```yaml
layout: post
title: 文章标题
date: 2026-07-19 20:00:00
updated: 2026-07-19 20:00:00
channel: tech
categories:
  - 技术
tags: []
summary: 用一两句话说明文章解决的问题。
cover: /images/posts/example/cover.webp
featured: false
```

`channel` 只接受 `tech`、`journal`、`project`。完成文章后运行完整验证：

```bash
npm run verify
```

该命令会依次检查 Node.js 环境、文章元数据、Hexo 干净构建、HTML/SEO、
站内链接、静态资源预算、浏览器关键流程、视觉基线和 Lighthouse。本地浏览器测试
使用 Chrome，覆盖首页、三个内容频道、搜索、主题切换、频道筛选、代码复制、
Twikoo 初始化、旧链接、移动导航和减少动态模式。

也可以单独执行：

```bash
npm run check:env
npm run check
npm run check:html
npm run check:links
npm run check:assets
npm run test:smoke
npm run test:visual
npm run check:lighthouse
```

视觉回归会对桌面、平板、手机、浅色、深色和无磨砂滤镜环境进行感知差异比较。
只有在确认视觉调整符合预期后，才使用 `npm run test:visual:update` 更新基线。
Lighthouse 使用移动端模拟：首页和文章页 Performance 不低于 85，Accessibility 与
SEO 不低于 95，Best Practices 不低于 90。HTML 和 JSON 报告写入 `.lighthouseci/`。

## 图片

文章图片放在 `source/images/posts/<文章标识>/`。构建会自动把 JPEG 或 PNG 源图增量
生成为 WebP 和 AVIF；源图不会发布到站点，文章只引用优化后的格式。也可以手动执行：

```bash
npm run optimize:images
```

源图最大为 8 MiB、4000 万像素；生成图片最长边不超过 2000px，单张不超过
450 KiB。内容未变化时不会重写已有图片。

首页主视觉的原图保存在 `assets/hero/hero-source.jpg`，更新后执行：

```bash
npm run prepare:hero
```

该命令会生成桌面和移动端图片到 `source/images/hero/`。

## 发布

推送 `hexo` 分支后，`.github/workflows/site.yml` 会执行与本地一致的 `npm run verify`。
通过后才会把验证过的 `public/` 构建产物交给独立发布任务并发布到 `main`。
Pull Request 只有只读权限，只有推送后的发布任务拥有写权限。自定义域名由
`source/CNAME` 和工作流中的 `cname` 配置共同保持。

本地仍保留 `npm run deploy` 作为紧急发布方式，但日常发布应使用 GitHub Actions。

## 主题维护

`themes/butterfly/` 是 Butterfly 5.6.0 的仓库内副本，确保全新克隆不依赖缺失的 Git Submodule。站点级配置集中在 `_config.butterfly.yml`，视觉覆盖集中在 `source/css/custom.css`；升级主题时应先在独立分支验证配置和截图。

依赖升级和安全审计的处理原则见 [依赖治理规范](docs/dependency-policy.md)。
