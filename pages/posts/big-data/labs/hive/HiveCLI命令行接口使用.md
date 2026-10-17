---
title: HiveCLl命令行接口使用
date: 2025-04-25
updated: 2025-04-25
categories:
  - 大数据开发
  - 实验
tags:
  - Hive
  - 实验
description: "介绍 Hive CLI 命令行接口的实验用法，整理连接、执行 HQL 和查看结果的基本步骤，帮助完成交互式数据查询。"
---
### 一、 实验目的

  了解常用的Hive CLI命令使用  
  掌握hive的交互式Shell命令

### 二、 实验内容

  1、启动Hadoop服务  
  2、Hive CLI操作

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、hive-2.3.3、Hadoop-2.7.3  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

   Hive CLI：查询处理器,用户通过它可以对hive做查询操作处理。  
   处理流程：根据MetaStore中的信息，将sql解析成MR任务，在提交给yarn去执行；处理后的结果存放在hdfs上，结果再返回给hive cli，解析好之后返回给用户。

![](http://172.31.151.156/upload/imagePath/5e7ebe5086e04.png)

### 五、 实验步骤

#### 5.1、启动Hadoop服务

1、启动Hadoop：
注释Hadoop3的环境变量
![image.png](https://picture.dreambo.cn/2026/10/17/23/UP2B7xhVFm64iNe-41b30be2924aea0af01c8f179525cecc.png)
然后使用`source /etc/profile`更新环境变量
运行hadoop，并使用jps检查启动项
![image.png](https://picture.dreambo.cn/2026/10/17/23/FRV6ScOtgTAGDez-0cc3b0e7e7b964cecbb4a8a6a8b94bb6.png)

#### 5.2、Hive CLI操作

$HIVE_HOME/bin/hive是一个shell实用程序，可用于以交互或批处理模式运行Hive查询,也可以称为Hive CLI。  
所有hive操作需要在hive的安装目录下进行
![image.png](https://picture.dreambo.cn/2026/10/17/23/gULWAus7Jhjp5Cr-a4cace59a6d914d1ed38e131052a7604.png)

1、帮助命令。假如忘记Hive的使用命令或者想要查询其他命令，可以使用这个命令。
![image.png](https://picture.dreambo.cn/2026/10/17/23/nL8I5d1NGHeR4ZT-4123c4c82605db63b9da35b6949b8b0a.png)

2、批处理模式  
- hive -e ‘< query-string>’执行查询字符串  
- hive -f ‘< filepath>’ 从文件执行一个或多个SQL查询  
使用批处理模式命令查看数据库：
![image.png](https://picture.dreambo.cn/2026/10/17/23/u6ILqHUi1FVYaDr-9fb9ad388527efc1d135313f7d68ff7d.png)

将创建库的SQL追加到“info”文件中
使用批处理模式命令创建“info”表
![image.png](https://picture.dreambo.cn/2026/10/17/23/dnPst3GFVm6lS7p-e818d6ea68d645343a3075c979cd6406.png)

3、hive的交互式Shell命令
![image.png](https://picture.dreambo.cn/2026/10/17/23/oO5Zz2svKxcFUYu-ed24e2cf20170dfb94d999dc9a86a8dd.png)

对Hive的配置值的设置，设置reduce的task：
![image.png](https://picture.dreambo.cn/2026/10/17/23/BVj2UuWlqkeibas-157b88ad5bfb376734e4a2cde1a2051f.png)

在Hive的Shell中执行Shell命令，查看目录文件：
![image.png](https://picture.dreambo.cn/2026/10/17/23/UWtXVzQ5oDd2ME8-1148d70ae7a946e75a8fbe2620c44249.png)

从Hive Shell执行dfs命令，查看目录文件：
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/RYwCpJk3GIohUDu-72bdcfa71a5b57cc5c15eeda1e25dcb4.png)

添加文件资源，
![image.png](https://picture.dreambo.cn/2026/10/17/23/gWGN6VZJrc4wxpa-c292ffcd592f3db7e3690d0b18ab9483.png)
