---
title:
  - markdown语法
tags:
  - markdown
categories:
  - markdown
# top_img:
#   - 'https://api.likepoems.com/img/mc'
abbrlink: f134a8e5
date: 2023-02-20 23:23:30
cover: https://angyublog.oss-cn-hangzhou.aliyuncs.com/wallpaper/wallpaper_34.jpg
---

[IT常识](https://it.cha138.com/shida/show-319358.html)


# 简介
.md即markdown文件的基本常用编写语法，是一种快速标记、快速排版语言，现在很多前端项目中的说明文件readme等都是用.md文件编写的，而且很多企业也在鼓励使用这种编辑方式。下面就简单和大家分享一些.md基本语法。

# 一、基本符号： *-+.>

1.前面带#号，后面带文字，分别表示h1-h6，只到h6，而且h1下面会有一条横线

示例：
<table><tr><td bgcolor="edf0f1">

1 # 一级标题
2 ## 二级标题
3 ### 三级标题
4 #### 四级标题
5 ##### 五级标题
6 ###### 六级标题

</td></tr></table>

2、标签闭合

示例：
<table><tr><td bgcolor="edf0f1">

1 # 一级标题 #
2 ## 二级标题 ##
3 ### 三级标题 ###
4 #### 四级标题 ####
5 ##### 五级标题 #####
6 ###### 六级标题 ######

</td></tr></table>

效果如下：
# 这是一级标题
## 这是二级标题
### 这是三级标题
#### 这是四级标题
##### 这是五级标题
###### 这是六级标题

# 二、字体
斜体：要倾斜的文字左右分别*号包起来
加粗：要加粗的文字左右分别用两个*号包起来
斜体加粗：要倾斜和加粗的文字左右分别用三个*号包起来
删除线：要加删除线的文字左右分别用两个～～号包起来

示例：
<table><tr><td bgcolor="edf0f1">

1 *斜体文字*
2 **加粗文字**
3 ***斜体加粗文字***
4 ～～删除线文字～～

</td></tr></table>

效果如下：
*斜体文字*
**加粗文字**
***斜体加粗文字***
~~删除线文字~~

# 三、引用
在饮用的文字前加>即可。饮用也可以嵌套，如加两个>>三个>>>
n个...
貌似可以一直加下去，但没什么卵用

示例：
<table><tr><td bgcolor="edf0f1">

1 >这是引用的内容
2 >>这是引用的内容
3 >>>>>>>>>>这是引用的内容

</td></tr></table>

效果如下：
>这是引用的内容
>>这是引用的内容
>>>>>>>>>>这是引用的内容

# 四、分割线
三个或者三个以上的 - 或者 * 都可以。

示例：
<table><tr><td bgcolor="edf0f1">

1 ---
2 ----
3 ***
4 ****

</td></tr></table>

效果如下：
---
----
***
****

# 五、图片

语法：
<table><tr><td bgcolor="edf0f1">

1 ![图片alt](图片地址 ‘‘图片title‘‘)
2 
3 图片alt就是显示在图片下面的文字，相当于对图片内容的解释。
4 图片title是图片的标题，当鼠标移到图片上时显示的内容。title可加可不加

</td></tr></table>

示例：
<table><tr><td bgcolor="edf0f1">

![墙纸](https://angyublog.oss-cn-hangzhou.aliyuncs.com/wallpaper/wallpaper_21.jpg "昂予壁纸库21")

</td></tr></table>

效果如下：
<table><tr><td bgcolor="edf0f1">

![墙纸](https://angyublog.oss-cn-hangzhou.aliyuncs.com/wallpaper/wallpaper_20.jpg "昂予壁纸库20")

</td></tr></table>

# 六、超链接

语法：
<table><tr><td bgcolor="edf0f1">

1 [超链接名](超链接地址 "超链接title")
2 title可加可不加

</td></tr></table>

示例：
<table><tr><td bgcolor="edf0f1">

⚠️注意：[]后边不应该加空格，这里是为了演示
1 [IT常识] (https://it.cha138.com/shida/show-319358.html)
2 [昂予] (http://www.angyuer.com)
</td></tr></table>

效果如下：
[IT常识](https://it.cha138.com/shida/show-319358.html)
[昂予's Blog](http://www.angyuer.com)

# 七、列表

## 无序列表

语法：
无序列表用 - + * 任何一种都可以
<table><tr><td bgcolor="edf0f1">

注意：- + * 跟内容之间都要有一个空格
1 - 列表内容
2 + 列表内容
3 * 列表内容

</td></tr></table>

效果如下：
<table><tr><td bgcolor="edf0f1">

- 列表内容
+ 列表内容
* 列表内容

</td></tr></table>

## 有序列表

语法：
数字加点
<table><tr><td bgcolor="edf0f1">

注意：序号跟内容之间要有空格
1 1. 列表内容
2 2. 列表内容
3 3. 列表内容

</td></tr></table>

效果如下：
<table><tr><td bgcolor="edf0f1">

1. 列表内容
2. 列表内容
3. 列表内容

</td></tr></table>

## 列表嵌套

语法：
需在子列表中的选项前面添加四个空格

效果如下：
<table><tr><td bgcolor="edf0f1">

1. 第一项：
    - 第一项嵌套的第一个元素
    - 第一项嵌套的第二个元素
2. 第二项：
    - 第二项嵌套的第一个元素
    - 第二项嵌套的第二个元素


</td></tr></table>

# 八、表格

语法：
<table><tr><td bgcolor="edf0f1">

 1 表头|表头|表头
 2 ---|:--:|---:
 3 内容|内容|内容
 4 内容|内容|内容
 5 
 6 第二行分割表头和内容。
 7 - 有一个就行，为了对齐，多加了几个
 8 文字默认居左
 9 -两边加：表示文字居中
10 -右边加：表示文字居右
11 注：原生的语法两边都要用 | 包起来。此处省略

</td></tr></table>

示例：
<table><tr><td bgcolor="edf0f1">

1 姓名|技能|排行
2 --|:--:|--:
3 刘备|哭|大哥
4 关羽|打|二哥
5 张飞|骂|三弟

</td></tr></table>

效果如下：
<table><tr><td bgcolor="edf0f1">

| 姓名 | 技能  | 排行 |
| ---- | :---: | ---: |
| 刘备 |  哭   | 大哥 |
| 关羽 |  打   | 二哥 |
| 张飞 |  骂   | 三弟 |

</td></tr></table>


# 九、代码

语法：
单行代码：代码之间分别用一个反引号包起来
代码块：代码之间分别用三个反引号包起来，且两边的反引号单独占一行

效果如下：

单行代码
`create database hero;`

代码块
```
    function fun(){
         echo "这是一句非常牛逼的代码";
    }
    fun();
```

# 十、流程图

TODO:
    暂时不清楚为什么在md文件中显示不出来流程图，
    只能通过Markdown Preview Enhanced 插件预览打开，然后再右键生成html生成无题的html文件在博客中显示。

<table><tr><td bgcolor="edf0f1">

```flow
st=>start: 页面加载
e=>end: End:>http://www.google.com
op1=>operation: get_hotel_ids|past
op2=>operation: get_proxy|current
sub1=>subroutine: get_proxy|current
op3=>operation: save_comment|current
op4=>operation: set_sentiment|current
op5=>operation: set_record|current
cond1=>condition: ids_remain空?
cond2=>condition: proxy_list空?
cond3=>condition: ids_got空?
cond4=>condition: 爬取成功??
cond5=>condition: ids_remain空?
io1=>inputoutput: ids-remain
io2=>inputoutput: proxy_list
io3=>inputoutput: ids-got
st->op1(right)->io1->cond1
cond1(yes)->sub1->io2->cond2
cond2(no)->op3
cond2(yes)->sub1
cond1(no)->op3->cond4
cond4(yes)->io3->cond3
cond4(no)->io1
cond3(no)->op4
cond3(yes, right)->cond5
cond5(yes)->op5
cond5(no)->cond3
op5->e
```

</td></tr></table>