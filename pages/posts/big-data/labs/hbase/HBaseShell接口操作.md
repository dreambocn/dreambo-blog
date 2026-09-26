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
![image.png](https://s2.loli.net/2025/05/06/cgWH8UifQCSabuK.png)
2.启动zookeeper和Hbase
![image.png](https://s2.loli.net/2025/05/06/9kVpbLD5mFUYgdK.png)

#### 5.2、HBase Shell Gerneral 命令
1.进入hbase的命令行模式
![image.png](https://s2.loli.net/2025/05/06/pGOzxTH14AQNjYR.png)
2.查询当前服务器状态
![image.png](https://s2.loli.net/2025/05/06/zOQ8iWEbtvJcsq1.png)
3.查看当前版本
![image.png](https://s2.loli.net/2025/05/06/Y7uazkHvyADfWEm.png)
4.查询当前的hbase用户
![image.png](https://s2.loli.net/2025/05/06/jrv4kPIqE15leMt.png)

#### 5.3、HBase Shell 常用操作
1.查看帮助，在hbase shell命令行模式下输入”help”
![image.png](https://s2.loli.net/2025/05/06/TqVsGxzlp3eNZvR.png)
2.查看`create`的帮助指令
![image.png](https://s2.loli.net/2025/05/06/huBZe2G5Kqs6D9J.png)
3.创建“test”表，并指定列簇“cf”
![image.png](https://s2.loli.net/2025/05/06/fq8wxSMHdt9lWgo.png)

>[!TIP]
>使用create创建新表时，必须指定表名和列族

4.查询创建的表
![image.png](https://s2.loli.net/2025/05/06/PacoX3JgtBrMKhm.png)

5.查询表的详细信息
![image.png](https://s2.loli.net/2025/05/06/r9FGJ5epMzL2oUO.png)

6.插入数据
![image.png](https://s2.loli.net/2025/05/06/Vjpq1OAkSevNzou.png)

7.扫描所有数据信息
![image.png](https://s2.loli.net/2025/05/06/SFEW3zjifw7c5V8.png)

8.退出Hbase Shell
![image.png](https://s2.loli.net/2025/05/06/B61ghVvtXxGpfWl.png)

9.停止hbase服务
![image.png](https://s2.loli.net/2025/05/06/RFlvNsZmxMkDAr7.png)
