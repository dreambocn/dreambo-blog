---
title: SparkRDD
date: 2025-05-26
updated: 2025-05-26
categories: 大数据开发 实验 Spark
  - 大数据开发
  - 实验
  - Spark
---
## 环境配置

使用java 1.8 作为SDK
![image.png](https://s2.loli.net/2025/05/25/luR9SJ4EHcCGbzF.png)

scala的版本设置为scala-sdk-2.12.18
![image.png](https://s2.loli.net/2025/05/25/jVk1DfPAie65ZdC.png)

使用scoop安装Spark-Hadoop3环境
![image.png](https://s2.loli.net/2025/05/25/KdVgDCUAIcwmLeO.png)

maven设置
添加spark-core_2.12
![image.png](https://s2.loli.net/2025/05/25/5tavQFcjPyI4sDK.png)

## 代码创建
首先在main/java下创建cn/dreambo/bigdata/spark/core/req目录存储项目文件
![image.png|401](https://s2.loli.net/2025/05/25/TLJhZY4se8V2Wva.png)

创建scala的object代码文件用于存储代码
![image.png](https://s2.loli.net/2025/05/25/1RCgGdtU4M3kHaT.png)

## 代码具体

连接spark
![image.png](https://s2.loli.net/2025/05/25/p2zyClN5BAwrGPL.png)

从文件中读取数据
![image.png](https://s2.loli.net/2025/05/25/wIi9CA8bDURYEMW.png)

从actionRDD中统计点击数量
![image.png](https://s2.loli.net/2025/05/25/vdozZkinh8BTMI3.png)

从actionRDD中统计下单数量
![image.png](https://s2.loli.net/2025/05/25/eW1h8adcksjESXr.png)

从actionRDD中统计支付数量
![image.png](https://s2.loli.net/2025/05/25/7EHpibVxAaYf1IL.png)

对统计的数量进行排序读取前十名
![image.png](https://s2.loli.net/2025/05/25/FCsWPpVqeKNoLxB.png)

输出结果然后中断连接
![image.png](https://s2.loli.net/2025/05/25/STVy3pcRImjA5Dr.png)

结果展示
![image.png](https://s2.loli.net/2025/05/25/HQRZ2OiF6hnN8ql.png)
