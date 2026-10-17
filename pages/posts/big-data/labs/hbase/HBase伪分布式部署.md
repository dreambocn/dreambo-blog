---
title: HBase 伪分布式部署
date: 2025-04-12
updated: 2025-04-12
categories:
  - 大数据开发
  - 实验
tags:
  - HBase
  - 部署
  - 实验
description: "记录 Ubuntu 实验环境下的 HBase 单机与伪分布式部署，梳理 JDK、Hadoop、ZooKeeper 依赖和运行配置。"
---
### 一、实验目的

  掌握单机版hbase运行环境的搭建  
  掌握伪分布式hbase运行环境的搭建

### 二、实验内容

  完成基于ubuntu环境的Hbase单机、伪分布式部署环境搭建

### 三、实验原理

  Hbase是一个分布式的、面向列的开源数据库，基于Hadoop的分布式数据库，所以安装得确保Hadoop安装完成。

### 四、实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、Hbase1.4、Hadoop-2.7、zookeeper3.4  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 五、实验步骤

#### 5.1、Hbase单机模式安装配置
1.解压tar包
进入`data/software`文件夹找到Hbase压缩包
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/iZgjksXY6hxMVm4-3faedc1c7ee195eb4030dfccbc2609e6.png)
解压Hbase到`/data/bigdata`目录下
![image.png|700](https://picture.dreambo.cn/2026/10/17/23/ip5GMtPkHbxS3u6-38244ab28d858d79a76de76d8b2152e3.png)
2.修改配置
进入刚解压的Hbase文件下找到`conf`目录，进入修改`hbase-env.sh`
![image.png](https://picture.dreambo.cn/2026/10/17/23/cb36xwlpXNyHutU-f56b740cf9ed8d20185bbe23711061a3.png)
添加java的安装目录
![image.png](https://picture.dreambo.cn/2026/10/17/23/cfJVv7OwlTBbIar-3e2dca5dd122a95c84dd1a905dc46bfa.png)

修改`hbase-site.xml`文件，
![image.png|625](https://picture.dreambo.cn/2026/10/17/23/cwIMBymh5DZjFHG-12248dddc405059960f0747030030752.png)
编辑内容添加
![image.png|550](https://picture.dreambo.cn/2026/10/17/23/oqRmjvnOzD1UpdG-e3504ad2da577366541326bae9bb8e50.png)
#### 5.2、单节点模式启动hbase
1.启动Hbase
进入到`/data/bigdata/hbase-1.4.9/bin`目录下，启动hbase服务
![image.png](https://picture.dreambo.cn/2026/10/17/23/JI9yg4SDKwikVcp-2edb4d709283536b560778a274085390.png)
使用jps查看Hbase运行状况
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/a1BX4tQE5usbLMT-bd012472a9938a86b78d5d0aaf86efa0.png)
停止hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/icFTVMk638P1mEY-cb5fb93c448fbdc8b0d400f26b1c3956.png)

#### 5.3、hbase伪分布式安装部署
1.Hadoop环境准备
启动hadoop服务
![image.png](https://picture.dreambo.cn/2026/10/17/23/A23TOsYZU8pqVHi-912b11ec4251f23dc960b5bc53b984f9.png)
2、修改hbase-env.sh文件
进入到hbase的conf目录下，修改hbase-env.sh文件
![image.png](https://picture.dreambo.cn/2026/10/17/23/UNwKGpV2CyaAEb8-46793a8d286ae5c1efb928e560871b9f.png)
添加以下配置
![image.png](https://picture.dreambo.cn/2026/10/17/23/c9yAjtskTXVJuKb-7c46c06350ccc1c8da333f7cedbca506.png)

> [!TIP]
> HBASE_MANAGES_ZK=false 表示zookeeper是外置

3、修改hbase-site.xml文件
![image.png](https://picture.dreambo.cn/2026/10/17/23/k5NHLZMlWQeK2Cv-3966d81f73fef84c5723231278f99f49.png)

具体内容如下
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/6IyOW8HemN7BGwF-9061b45381d9f115a4070954af5cb343.png)
#### 5.4、hbase伪分布式模式部署测试
1、启动zk/启动Hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/mpFdk1WugRfQJLM-6ce34bf9591c90c7d7737ce56e2f1e14.png)
查看运行状态
![image.png](https://picture.dreambo.cn/2026/10/17/23/OkXNoJ7RCDFQMpj-4f77468790a4d2efac67c0cabc737bd2.png)
2、hbase部署验证
进入hbase shell
![image.png](https://picture.dreambo.cn/2026/10/17/23/Oq8SWY2e9M7zNGr-4a8bb3acc1f55930a9e47a907dd68535.png)
查看所有表然后退出
![image.png](https://picture.dreambo.cn/2026/10/17/23/6nhG2xZNJCu5cLE-109518aace0b154d38060198f6c2388a.png)
