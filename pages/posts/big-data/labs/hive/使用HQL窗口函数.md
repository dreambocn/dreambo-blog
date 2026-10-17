---
title: 使用HQL窗口函数
date: 2025-04-25
updated: 2025-04-25
categories:
  - 大数据开发
  - 实验
tags:
  - Hive
  - HQL
  - 实验
description: "结合 Hive 实验学习 HQL 窗口函数，梳理分组、排序与窗口计算的使用方式，并通过查询示例理解分析结果。"
---
### 一、 实验目的

  理解窗口的原理  
  掌握Hive常用的窗口函数使用

### 二、 实验内容

  1、启动Hadoop和Hive服务并创建表数据  
  2、窗口函数的使用

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、hive-2.3、Hadoop-2.7、MySQL-5.7  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

  开窗函数一般就是说的是over（）函数，其窗口是由一个 OVER 子句 定义的多行记录，其作用就如同它的名字，就是限定出一个窗口。

### 五、 实验步骤

#### 5.1、启动Hadoop和Hive服务并创建表数据
注意：需要在配置文件/etc/profile中注释掉Hadoop3的相关环境变量设置，然后执行命令【source /etc/profile】，让配置的profile文件立刻生效。  
  ![image.png](https://picture.dreambo.cn/2026/10/17/23/3giMXWJEbC9s1Gw-c3e2c67562bf37b022b6a2ef847379dd.png)

1、启动Hadoop：
![image.png](https://picture.dreambo.cn/2026/10/17/23/t8b69NZpEqO2d5e-7cd58b6ecb8d6dcd363c88277417ff26.png)

2、进入hive安装目录，打开hive
![image.png](https://picture.dreambo.cn/2026/10/17/23/QiLtspWT4MoNekc-7cb2416ec6acbee40d3b01175b631d75.png)
3、创建business表，分为顾客名称、购买日期、价钱三个字段，数据格式以“，”分割：
![image.png](https://picture.dreambo.cn/2026/10/17/23/r93xgfXpVKILvya-d1095d06eedbe8cb387b745f8dc9caab.png)

4、将本地的business.txt文件数据加载到business表：
![image.png](https://picture.dreambo.cn/2026/10/17/23/JAGWUdTSEtkjmhQ-2411dfef8ba62bc37df1eaf22f273d73.png)

5、查看business表的数据：
![image.png|475](https://picture.dreambo.cn/2026/10/17/23/5aZW3DcbnpYNgO8-ddc056dda43141516fc18129cb9abf05.png)
#### 5.2、窗口函数的使用
1、查询在2019年4月份购买过的顾客及总人数
![image.png](https://picture.dreambo.cn/2026/10/17/23/tOyhpWGXSni7ug9-538c872f1e871a53afc7cf1a669925f2.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/beXHxWCJZmQyGU8-48d2d4747eb8504ddd4105238d4eefa8.png)

2、查询顾客的购买明细及月购买总额
![image.png](https://picture.dreambo.cn/2026/10/17/23/CgqYMj79hvDGoyJ-cd1922993290abb88d40fc727cbed313.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/RstaxLohy96dCW5-20faa1ee41ed3fc13f00e1cb1efe8f1d.png)

3、上述的场景,要将cost按照日期进行累加：
![image.png](https://picture.dreambo.cn/2026/10/17/23/KbOUq4tm5XaYxv7-0033871f2d8a1f6ebf7dffe260d30b8b.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/BRq1bLwNAifQrc8-b5b9d90837da5340c1fdf280381e82fa.png)

4、查看顾客上次的购买时间：
![image.png](https://picture.dreambo.cn/2026/10/17/23/wSbufANsOaLtXRn-f7a1c041bad49ad23453c3a09f3e85a3.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/DKyx3W4nqprJbRv-9d74f396d75943853f73fad9be1d4ee5.png)

5、查询前20%时间的订单信息：
![image.png](https://picture.dreambo.cn/2026/10/17/23/tK9g4JUSQ8p7T1D-4766f263bf12b0572f7b30933dbbaf11.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/L2lamMcYhexIrw4-89f175ac221bbf26a685319588a27e2b.png)
