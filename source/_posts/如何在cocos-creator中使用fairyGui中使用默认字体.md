---
title: cocos creator使用fairyGui字体默认字体
tags:
  - cocos creator
  - fairyGui
categories:
  - cocos creator
  - fairyGui
abbrlink: 5ab84984
date: 2023-02-20 22:59:14
cover: https://angyublog.oss-cn-hangzhou.aliyuncs.com/wallpaper/wallpaper_20.jpg
---

参考了 面圈网写的知识点，得出使用方法

[面圈网](https://www.mianshigee.com/tutorial/fairygui/ee8ab16c99157b9e.md)

```
  var aFont = await Framework.ResLoader.loadBundleAnyAsync(GameConst.BundleName.preload, "font/BadComic-Regular", Font)
  fgui.registerFont('BadComic-Regular', aFont);
  fgui.UIConfig.defaultFont = 'BadComic-Regular';
```