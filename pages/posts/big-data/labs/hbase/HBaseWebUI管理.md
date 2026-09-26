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
![image.png](https://s2.loli.net/2025/05/06/eTMJsSa8Fybn7q1.png)

2.启动zookeeper和Hbase
![image.png](https://s2.loli.net/2025/05/06/PQz8TfoRBpJOuHn.png)

![image.png](https://s2.loli.net/2025/05/06/ULPrETdVZk7Gaz5.png)

![image.png](https://s2.loli.net/2025/05/06/T5sZBcwb3SvnLuW.png)
#### 5.2、Master节点的Web管理
1.在浏览器中输入“localhost:16010”
 可以看到Master节点的运行状态
![image.png](https://s2.loli.net/2025/05/06/LVBJbZdWkFOxIXv.png)

2.最下面可以看到Hbase整个集群运行服务信息
![image.png](https://s2.loli.net/2025/05/06/uxDKQtfkbE6WTl3.png)

3.进入hbase的命令行模式
![image.png](https://s2.loli.net/2025/05/06/MhtKbNT8DdspaqR.png)

4.创建表'syb'
![image.png](https://s2.loli.net/2025/05/06/BKJGiSWQvyAN5su.png)

5.插入数据
![image.png](https://s2.loli.net/2025/05/06/ln1YLEWhX73cwiC.png)

6.刷新网页，可以在Tables处看到新增的表
![image.png](https://s2.loli.net/2025/05/06/VNxG3gkUXqBbmzo.png)

#### 5.3、RegionServer节点的Web管理
1.点击ServerName
![image.png](https://s2.loli.net/2025/05/06/rikoyXK8pRQhJtb.png)
可以获得RegionServer的信息和block信息
![image.png](https://s2.loli.net/2025/05/06/7IB8XNCfZeqHPdG.png)

2.查看Regions和Tasks的信息
![image.png](https://s2.loli.net/2025/05/06/kDf1E6GH5xMozjq.png)
