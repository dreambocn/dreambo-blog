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
![image.png|500](https://s2.loli.net/2025/05/06/iZgjksXY6hxMVm4.png)
解压Hbase到`/data/bigdata`目录下
![image.png|700](https://s2.loli.net/2025/05/06/ip5GMtPkHbxS3u6.png)
2.修改配置
进入刚解压的Hbase文件下找到`conf`目录，进入修改`hbase-env.sh`
![image.png](https://s2.loli.net/2025/05/06/cb36xwlpXNyHutU.png)
添加java的安装目录
![image.png](https://s2.loli.net/2025/05/06/cfJVv7OwlTBbIar.png)

修改`hbase-site.xml`文件，
![image.png|625](https://s2.loli.net/2025/05/06/cwIMBymh5DZjFHG.png)
编辑内容添加
![image.png|550](https://s2.loli.net/2025/05/06/oqRmjvnOzD1UpdG.png)
#### 5.2、单节点模式启动hbase
1.启动Hbase
进入到`/data/bigdata/hbase-1.4.9/bin`目录下，启动hbase服务
![image.png](https://s2.loli.net/2025/05/06/JI9yg4SDKwikVcp.png)
使用jps查看Hbase运行状况
![image.png|500](https://s2.loli.net/2025/05/06/a1BX4tQE5usbLMT.png)
停止hbase
![image.png](https://s2.loli.net/2025/05/06/icFTVMk638P1mEY.png)

#### 5.3、hbase伪分布式安装部署
1.Hadoop环境准备
启动hadoop服务
![image.png](https://s2.loli.net/2025/05/06/A23TOsYZU8pqVHi.png)
2、修改hbase-env.sh文件
进入到hbase的conf目录下，修改hbase-env.sh文件
![image.png](https://s2.loli.net/2025/05/06/UNwKGpV2CyaAEb8.png)
添加以下配置
![image.png](https://s2.loli.net/2025/05/06/c9yAjtskTXVJuKb.png)

> [!TIP]
> HBASE_MANAGES_ZK=false 表示zookeeper是外置

3、修改hbase-site.xml文件
![image.png](https://s2.loli.net/2025/05/06/k5NHLZMlWQeK2Cv.png)

具体内容如下
![image.png|500](https://s2.loli.net/2025/05/06/6IyOW8HemN7BGwF.png)
#### 5.4、hbase伪分布式模式部署测试
1、启动zk/启动Hbase
![image.png](https://s2.loli.net/2025/05/06/mpFdk1WugRfQJLM.png)
查看运行状态
![image.png](https://s2.loli.net/2025/05/06/OkXNoJ7RCDFQMpj.png)
2、hbase部署验证
进入hbase shell
![image.png](https://s2.loli.net/2025/05/06/Oq8SWY2e9M7zNGr.png)
查看所有表然后退出
![image.png](https://s2.loli.net/2025/05/06/6nhG2xZNJCu5cLE.png)
