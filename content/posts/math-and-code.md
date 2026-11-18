---
title: "LaTeX 公式与代码高亮示例"
date: "2026-11-09"
tags: ["数学", "编程"]
category: "技术"
summary: "演示 KaTeX 公式、代码高亮、表格与引用等 Markdown 能力。"
draft: false
---

这是一篇演示文章，展示本站支持的各类 Markdown 能力。

## 公式

行内公式：$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

矩阵：

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## 代码高亮

C++：

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
```

JavaScript：

```javascript
const greet = (name) => `你好，${name}`;
console.log(greet("世界"));
```

## 表格

| 语言 | 难度 | 我的喜爱度 |
| ---- | ---- | ---------- |
| Python | 简单 | ★★★★★ |
| C++ | 中等 | ★★★★☆ |
| Rust | 困难 | ★★★★☆ |

## 其他

- 支持**加粗**、*斜体*、~~删除线~~、`行内代码`
- 支持 [链接](https://example.com) 与脚注[^1]
- 支持任务列表

- [x] 搭建博客
- [x] 支持公式
- [ ] 写更多文章

[^1]: 这里是脚注内容。
