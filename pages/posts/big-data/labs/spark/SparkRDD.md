---
title: SparkRDD
date: 2025-05-26
updated: 2025-05-26
categories:
  - 大数据开发
  - 实验
tags:
  - Spark
  - 实验
description: "记录 Scala 与 Maven 环境下的 Spark RDD 编程实践，梳理依赖配置、文件读取、数据转换和行动操作的代码实现。"
---
## 环境配置

使用java 1.8 作为SDK
![image.png](https://picture.dreambo.cn/2026/10/17/23/luR9SJ4EHcCGbzF-37508d0fa11c08146f52c5ea4f88b0d9.png)

scala的版本设置为scala-sdk-2.12.18
![image.png](https://picture.dreambo.cn/2026/10/17/23/jVk1DfPAie65ZdC-cf9b64e856a2fca8aa03184bf57054ff.png)

使用scoop安装Spark-Hadoop3环境
![image.png](https://picture.dreambo.cn/2026/10/17/23/KdVgDCUAIcwmLeO-524e2f958e8a62a58a7a6b0077df5a61.png)

maven设置
添加spark-core_2.12
![image.png](https://picture.dreambo.cn/2026/10/17/23/5tavQFcjPyI4sDK-81b084256e2a5756199254d38e34d541.png)

## 代码创建
首先在main/java下创建cn/dreambo/bigdata/spark/core/req目录存储项目文件
![image.png|401](https://picture.dreambo.cn/2026/10/17/23/TLJhZY4se8V2Wva-c9a965cf664b372b01806220e5d0380d.png)

创建scala的object代码文件用于存储代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/1RCgGdtU4M3kHaT-c9300778bd42165aae77c0a483622d87.png)

## 代码具体

连接spark
![image.png](https://picture.dreambo.cn/2026/10/17/23/p2zyClN5BAwrGPL-4fdbe4b0d66b08acf3b2180654eccc92.png)

从文件中读取数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/wIi9CA8bDURYEMW-f1ca5d3f008f69a9ac97bf324ea5968e.png)

从actionRDD中统计点击数量
![image.png](https://picture.dreambo.cn/2026/10/17/23/vdozZkinh8BTMI3-d78e747279953c995e50f16d328428ed.png)

从actionRDD中统计下单数量
![image.png](https://picture.dreambo.cn/2026/10/17/23/eW1h8adcksjESXr-c860a629daae4a03de00b43ff7457381.png)

从actionRDD中统计支付数量
![image.png](https://picture.dreambo.cn/2026/10/17/23/7EHpibVxAaYf1IL-426c917efdd06597f79dda08f2faeaa5.png)

对统计的数量进行排序读取前十名
![image.png](https://picture.dreambo.cn/2026/10/17/23/FCsWPpVqeKNoLxB-a3723f3d5afff01f1725d92c45ead96b.png)

输出结果然后中断连接
![image.png](https://picture.dreambo.cn/2026/10/17/23/STVy3pcRImjA5Dr-b32a96714bd0efdb2e7745b8e0dd3d2e.png)

结果展示
![image.png](https://picture.dreambo.cn/2026/10/17/23/HQRZ2OiF6hnN8ql-8e3309fa9a647ba6180930f56de3a5b5.png)
