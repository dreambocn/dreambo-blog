---
title: HBase Shell接口操作
date: 2025-04-12
updated: 2025-04-12
categories:
  - 大数据开发
  - 实验
tags:
  - HBase
  - 实验
description: "整理 HBase Shell 实验中的常用命令，覆盖服务启动、基础信息查询和表数据操作，帮助理解命令行接口的使用流程。"
---
### 一、 实验目的

  了解Hbase Shell接口和常用的命令，并掌握常用的shell操作

### 二、 实验内容

  1、启动Hadoop服务和Hbase服务  
  2、HBase Shell Gerneral 命令  
  3、HBase Shell 常用操作

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、Hbase1.4.9、Hadoop-2.7.3  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

  HBase的命令行工具，最简单的接口，适合HBase管理使用，可以使用shell命令来查询HBase中数据的详细情况。安装完HBase之后，启动hadoop集群(利用hdfs存储)，启动zookeeper，使用start-hbase.sh命令开启hbase服务，最后在shell中执行hbase shell就可以进入命令行界面。对Hbase的数据查询和创建操作。

### 五、 实验步骤

#### 5.1、启动Hadoop、Hbase、Zookeeper服务
1.启动hadoop
![image.png](https://picture.dreambo.cn/2026/10/17/23/cgWH8UifQCSabuK-33035813d392a5f6d9b2c2c93aae896c.png)
2.启动zookeeper和Hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/9kVpbLD5mFUYgdK-54ca0792abcbf791778f2a4734d35486.png)

#### 5.2、HBase Shell Gerneral 命令
1.进入hbase的命令行模式
![image.png](https://picture.dreambo.cn/2026/10/17/23/pGOzxTH14AQNjYR-be933f58d0b248c43d13c7feba3d8d1b.png)
2.查询当前服务器状态
![image.png](https://picture.dreambo.cn/2026/10/17/23/zOQ8iWEbtvJcsq1-32a1ec857b4630411619da4c1b4ad192.png)
3.查看当前版本
![image.png](https://picture.dreambo.cn/2026/10/17/23/Y7uazkHvyADfWEm-bec0f1027be37d9cafc570f1b72317b4.png)
4.查询当前的hbase用户
![image.png](https://picture.dreambo.cn/2026/10/17/23/jrv4kPIqE15leMt-233d29755507d8d6f3bf45f2f854a0a1.png)

#### 5.3、HBase Shell 常用操作
1.查看帮助，在hbase shell命令行模式下输入”help”
![image.png](https://picture.dreambo.cn/2026/10/17/23/TqVsGxzlp3eNZvR-d99e27836050d6604ea4d71324847ba7.png)
2.查看`create`的帮助指令
![image.png](https://picture.dreambo.cn/2026/10/17/23/huBZe2G5Kqs6D9J-a971c12ea74b61a840a8a1e221e1a943.png)
3.创建“test”表，并指定列簇“cf”
![image.png](https://picture.dreambo.cn/2026/10/17/23/fq8wxSMHdt9lWgo-0c5323c50940d5a883d4717fe6824d89.png)

>[!TIP]
>使用create创建新表时，必须指定表名和列族

4.查询创建的表
![image.png](https://picture.dreambo.cn/2026/10/17/23/PacoX3JgtBrMKhm-d66e0fb86e96fd9d42708269f4e5606c.png)

5.查询表的详细信息
![image.png](https://picture.dreambo.cn/2026/10/17/23/r9FGJ5epMzL2oUO-0ab16885a3affeb811f64540292b2f7e.png)

6.插入数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/Vjpq1OAkSevNzou-b01241f117600dfb9fe60990a9a6612b.png)

7.扫描所有数据信息
![image.png](https://picture.dreambo.cn/2026/10/17/23/SFEW3zjifw7c5V8-ea3b1d849cdcd5dfcef1b1ae8e6acc65.png)

8.退出Hbase Shell
![image.png](https://picture.dreambo.cn/2026/10/17/23/B61ghVvtXxGpfWl-fa6d98474d5839e40d79d795ad98c3c2.png)

9.停止hbase服务
![image.png](https://picture.dreambo.cn/2026/10/17/23/RFlvNsZmxMkDAr7-8b519140e4de387ae4e90cd9bb39280e.png)
