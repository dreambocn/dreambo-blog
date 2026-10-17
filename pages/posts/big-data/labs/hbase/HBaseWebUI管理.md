---
title: HBase WebUI管理
date: 2025-04-12
updated: 2025-04-12
categories:
  - 大数据开发
  - 实验
tags:
  - HBase
  - 实验
description: "记录 HBase Web UI 管理实验，介绍服务启动后查看 Master 与 RegionServer 节点信息、运行状态和管理页面的方法。"
---
### 一、 实验目的

  掌握Hbase Web UI的管理方法  
  掌握Master节点的Web管理  
  RegionServer节点的Web管理

### 二、 实验内容

  1、启动Hadoop服务和Hbase服务  
  2、Master节点的Web管理  
  3、RegionServer节点的Web管理

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、Hbase1.4.9、Hadoop-2.7.3  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

  Hbase提供了简单的基于Web的可视化管理手段，通过浏览器可以查看Hbase的集群状态、配置信息、日志信息、表和数据信息等。Hbase中涉及两个重要节点，一是Master节点，用于Hbase集群调度和管理；二是RegionServer节点，用于具体数据处理。

### 五、 实验步骤

#### 5.1、启动Hadoop、Hbase、Zookeeper服务
1.启动hadoop
![image.png](https://picture.dreambo.cn/2026/10/17/23/eTMJsSa8Fybn7q1-a8bb31d7e85781a49a17b3184a7c844e.png)

2.启动zookeeper和Hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/PQz8TfoRBpJOuHn-e3544c30c30a67e92b6bf42e08c164eb.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/ULPrETdVZk7Gaz5-ed57a0bc65f4b7d7a4d938ed4b058365.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/T5sZBcwb3SvnLuW-812f0ef1a6cfa654d440658879373c40.png)
#### 5.2、Master节点的Web管理
1.在浏览器中输入“localhost:16010”
 可以看到Master节点的运行状态
![image.png](https://picture.dreambo.cn/2026/10/17/23/LVBJbZdWkFOxIXv-aa0afffa71d9de9452af5b6bae1fa2a5.png)

2.最下面可以看到Hbase整个集群运行服务信息
![image.png](https://picture.dreambo.cn/2026/10/17/23/uxDKQtfkbE6WTl3-6f3bd5392c8d3fb2ee925833598ada2f.png)

3.进入hbase的命令行模式
![image.png](https://picture.dreambo.cn/2026/10/17/23/MhtKbNT8DdspaqR-d46780c9c35d2c4b41a9a7420af5a99b.png)

4.创建表'syb'
![image.png](https://picture.dreambo.cn/2026/10/17/23/BKJGiSWQvyAN5su-ce2cd47605d3703ae6507fff111eb661.png)

5.插入数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/ln1YLEWhX73cwiC-fe24a3da0653d6bbf9b130f29e1a2303.png)

6.刷新网页，可以在Tables处看到新增的表
![image.png](https://picture.dreambo.cn/2026/10/17/23/VNxG3gkUXqBbmzo-39862479359f367a75482d84246af289.png)

#### 5.3、RegionServer节点的Web管理
1.点击ServerName
![image.png](https://picture.dreambo.cn/2026/10/17/23/rikoyXK8pRQhJtb-8ea0b6dbc276c2893c40dd51a81e2450.png)
可以获得RegionServer的信息和block信息
![image.png](https://picture.dreambo.cn/2026/10/17/23/7IB8XNCfZeqHPdG-9df041cc617004103dceda769af11fdf.png)

2.查看Regions和Tasks的信息
![image.png](https://picture.dreambo.cn/2026/10/17/23/kDf1E6GH5xMozjq-878db2550665b690276fa5407ac01c8d.png)
