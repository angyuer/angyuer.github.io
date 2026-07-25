# 依赖治理规范

## 基本原则

- 项目只使用 Node.js 22，并通过 `.nvmrc`、`package.json` 和 `check:env` 保持一致。
- 直接依赖使用精确版本，依赖变更必须提交 `package-lock.json`。
- 安装使用 `npm ci`，不在 CI 中使用会修改锁文件的命令。
- Dependabot 每周检查 npm 和 GitHub Actions 更新。
- 升级依赖后必须运行 `npm run verify`。
- 不使用 `npm audit fix --force` 绕过审计问题。

## 安全审计

安全告警按“是否进入发布产物、是否处理不可信输入、修复是否破坏兼容性”评估。

截至 2026-07-26，npm 报告的 5 个高危项来自以下本地构建链：

```text
hexo-renderer-stylus → stylus → glob → minimatch → brace-expansion
```

这些依赖只编译仓库内受信任的 Butterfly Stylus 文件，不会进入生成后的静态站点。
npm 当前给出的自动修复方案是把 `hexo-renderer-stylus` 从 `3.0.1` 降到 `0.3.1`，
会破坏 Hexo 8 和当前主题的兼容性，因此暂不执行。后续在 Stylus 或渲染器提供兼容升级时移除此记录。

## 升级流程

1. 阅读直接依赖的变更日志和 Node.js 兼容范围。
2. 在独立分支更新一个依赖组。
3. 执行 `npm ci && npm run verify`。
4. 检查桌面、平板、手机和明暗模式截图。
5. 确认生成地址、RSS、Sitemap 和旧地址重定向未变化后再合并。
