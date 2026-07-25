---
layout: post
title: Hexo 图片优化与自动发布实践
channel: tech
categories:
  - 技术
tags:
  - Hexo
  - 图片优化
  - GitHub Actions
summary: 介绍如何为 Hexo 建立本地图片目录、WebP 和 AVIF 转换、资源预算检查，以及通过 GitHub Actions 验证并发布站点。
cover: /images/covers/markdown.webp
featured: true
abbrlink: 13bdc7d
date: 2026-07-26 03:42:30
updated: 2026-07-26 03:42:30
---

## 问题

静态博客的文章通常很轻，真正容易拖慢页面的是图片。一张未经处理的相机照片可能超过数兆字节，还可能带来尺寸过大、格式不统一、构建结果不可重复等问题。

过去新增图片时，我会直接使用外部 OSS 地址，或者把原图放进静态目录。这样虽然方便，却没有统一的尺寸和体积限制。外部资源失效时，文章也会出现无法控制的空白。

这次重构保留了已有的 OSS 图片，同时为新内容建立本地图片流程。目标不是追求极限压缩，而是让每张新图片都有明确位置、稳定输出和自动检查。

## 约束

图片流程需要满足以下要求。

- 继续使用 Markdown 写作，不增加 CMS。
- 原图随 Git 保存，构建结果可以重复生成。
- 新文章只发布 WebP 或 AVIF，不把 JPEG 和 PNG 原图复制到站点。
- 图片必须限制像素、尺寸和文件体积。
- Pull Request 和正式发布使用同一套检查。
- 已经存在的 HTTPS OSS 图片继续可用。

## 目录与格式

每篇文章拥有独立的图片目录。创建文章时，快捷命令会同时准备对应目录。

```text
source/
├── _posts/
│   └── hexo-image-optimization-and-deployment.md
└── images/
    └── posts/
        └── hexo-image-optimization-and-deployment/
            ├── cover.jpg
            ├── cover.webp
            └── cover.avif
```

JPEG 或 PNG 是可编辑的源图，WebP 和 AVIF 是发布版本。Markdown 当前优先引用兼容性稳定的 WebP，AVIF 保留给需要更高压缩率的页面或后续的 `picture` 元素。

文章中的引用使用站点绝对路径，避免文件移动后相对路径失效。

```markdown
![图片优化流程](/images/posts/hexo-image-optimization-and-deployment/pipeline.webp)
```

## 自动优化

`npm run optimize:images` 会遍历 `source/images/posts/` 下的 JPEG 和 PNG，并通过 Sharp 生成同名 WebP 和 AVIF。

图片先根据 EXIF 信息旋转，再按最长边等比例缩放。脚本不会放大小图，也不会改变宽高比。不同格式会尝试多组质量参数，直到结果进入预算。

| 项目 | 限制 |
| --- | ---: |
| 单张源图 | 8 MiB |
| 源图像素 | 4000 万像素 |
| 输出最长边 | 2000 px |
| 单张输出图片 | 450 KiB |

如果相同内容已经生成，脚本会比较文件字节并跳过写入。这一点可以避免每次构建都修改二进制文件，也能减少无意义的 Git 变更。

当图片无法压缩到预算内、超过像素限制或存在同名输出冲突时，命令会直接失败，而不是带着异常资源继续发布。

## 构建约束

正式构建依次执行主题资源同步、图片优化、内容检查和 Hexo 生成。

```bash
npm run sync:vendor
npm run optimize:images
npm run check
hexo clean
hexo generate
```

Hexo 配置会忽略文章目录中的 JPEG 和 PNG。原图留在源码分支，用于后续重新裁切或调整质量，但不会进入 `public/`。

内容检查还会验证以下规则。

- 本地图片必须位于 `/images/` 下，并且文件真实存在。
- `source/images/posts/` 下的引用只能使用 WebP 或 AVIF。
- Markdown 图片必须提供能够说明内容的 Alt 文本。
- 外部图片必须使用 HTTPS。
- 文章封面不能为空。

生成站点后，资源检查会再次遍历 `public/`。HTML、CSS、JavaScript、字体和图片分别拥有单文件预算，首页核心资源总量不能超过 1 MiB。

## 自动发布

GitHub Actions 同时处理 Pull Request 和 `hexo` 分支的推送。两个入口都会使用 Node.js 22，执行 `npm ci` 和 `npm run verify`。

`verify` 不只生成页面，还会检查 HTML 结构、站内链接、静态资源、浏览器交互、视觉基线和 Lighthouse。失败时，工作流会保留测试结果和 Lighthouse 报告，便于定位问题。

Pull Request 只有只读权限，不会发布网站。推送到 `hexo` 分支且完整验证通过后，构建产物才会交给独立的发布任务，并通过仓库自带的 `GITHUB_TOKEN` 写入 `main` 分支。

这个拆分保证发布任务只接收已经验证的 `public/`，不会在部署阶段重新生成一份不同的站点。

## 验证

本地使用以下命令执行与 CI 相同的检查。

```bash
npm run verify
```

当前站点会验证桌面、平板和手机布局，并覆盖浅色、深色、减少动态和无背景模糊环境。搜索、移动导航、主题切换、代码复制、Twikoo 评论和旧地址重定向也在浏览器测试范围内。

Lighthouse 的最低标准为移动端 Performance 85、Accessibility 95、SEO 95 和 Best Practices 90。图片流程必须在这些检查之前通过，避免用视觉回归掩盖资源问题。

## 取舍

源图仍然保存在 Git 中，仓库体积会随文章增加。对当前个人博客来说，获得可追踪、可重复处理的原始素材，比只保存压缩结果更重要。如果图片规模明显增长，再考虑 Git LFS 或对象存储。

当前脚本会生成 WebP 和 AVIF，但普通 Markdown 只能直接引用其中一种格式。后续可以扩展 Markdown 渲染器，自动输出带有 `srcset` 和 `sizes` 的 `picture` 元素，让浏览器根据能力和视口选择资源。

图片优化也不能替代内容判断。没有信息价值的装饰图，即使压缩到几十 KiB，仍然会增加下载和视觉噪声。新图片应该优先展示项目结果、操作状态或真正需要说明的细节。

## 参考资料

- [Sharp 官方文档](https://sharp.pixelplumbing.com/)
- [GitHub Actions 官方文档](https://docs.github.com/actions)
- [web.dev 图片性能指南](https://web.dev/learn/images/)
