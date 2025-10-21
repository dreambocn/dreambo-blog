---
title: HiveCLl命令行接口使用
date: 2025-04-25
updated: 2025-04-25
categories: 大数据开发 实验 Hive
tags:
  - 大数据开发
  - 实验
  - Hive
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
![image.png](https://s2.loli.net/2025/05/09/UP2B7xhVFm64iNe.png)
然后使用`source /etc/profile`更新环境变量
运行hadoop，并使用jps检查启动项
![image.png](https://s2.loli.net/2025/05/09/FRV6ScOtgTAGDez.png)

#### 5.2、Hive CLI操作

$HIVE_HOME/bin/hive是一个shell实用程序，可用于以交互或批处理模式运行Hive查询,也可以称为Hive CLI。  
所有hive操作需要在hive的安装目录下进行
![image.png](https://s2.loli.net/2025/05/09/gULWAus7Jhjp5Cr.png)

1、帮助命令。假如忘记Hive的使用命令或者想要查询其他命令，可以使用这个命令。
![image.png](https://s2.loli.net/2025/05/09/nL8I5d1NGHeR4ZT.png)

2、批处理模式  
- hive -e ‘< query-string>’执行查询字符串  
- hive -f ‘< filepath>’ 从文件执行一个或多个SQL查询  
使用批处理模式命令查看数据库：
![image.png](https://s2.loli.net/2025/05/09/u6ILqHUi1FVYaDr.png)

将创建库的SQL追加到“info”文件中
使用批处理模式命令创建“info”表
![image.png](https://s2.loli.net/2025/05/09/dnPst3GFVm6lS7p.png)

3、hive的交互式Shell命令
![image.png](https://s2.loli.net/2025/05/09/oO5Zz2svKxcFUYu.png)

对Hive的配置值的设置，设置reduce的task：
![image.png](https://s2.loli.net/2025/05/09/BVj2UuWlqkeibas.png)

在Hive的Shell中执行Shell命令，查看目录文件：
![image.png](https://s2.loli.net/2025/05/09/UWtXVzQ5oDd2ME8.png)

从Hive Shell执行dfs命令，查看目录文件：
![image.png|500](https://s2.loli.net/2025/05/09/RYwCpJk3GIohUDu.png)

添加文件资源，
![image.png](https://s2.loli.net/2025/05/09/gWGN6VZJrc4wxpa.png)
