---
title: 使用HQL窗口函数
date: 2025-04-25
updated: 2025-04-25
categories: 大数据开发 实验 Hive
tags:
  - 大数据开发
  - 实验
  - Hive
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
  ![image.png](https://s2.loli.net/2025/05/09/3giMXWJEbC9s1Gw.png)

1、启动Hadoop：
![image.png](https://s2.loli.net/2025/05/09/t8b69NZpEqO2d5e.png)

2、进入hive安装目录，打开hive
![image.png](https://s2.loli.net/2025/05/09/QiLtspWT4MoNekc.png)
3、创建business表，分为顾客名称、购买日期、价钱三个字段，数据格式以“，”分割：
![image.png](https://s2.loli.net/2025/05/09/r93xgfXpVKILvya.png)

4、将本地的business.txt文件数据加载到business表：
![image.png](https://s2.loli.net/2025/05/09/JAGWUdTSEtkjmhQ.png)

5、查看business表的数据：
![image.png|475](https://s2.loli.net/2025/05/09/5aZW3DcbnpYNgO8.png)
#### 5.2、窗口函数的使用
1、查询在2019年4月份购买过的顾客及总人数
![image.png](https://s2.loli.net/2025/05/09/tOyhpWGXSni7ug9.png)

![image.png](https://s2.loli.net/2025/05/09/beXHxWCJZmQyGU8.png)

2、查询顾客的购买明细及月购买总额
![image.png](https://s2.loli.net/2025/05/09/CgqYMj79hvDGoyJ.png)

![image.png](https://s2.loli.net/2025/05/09/RstaxLohy96dCW5.png)

3、上述的场景,要将cost按照日期进行累加：
![image.png](https://s2.loli.net/2025/05/09/KbOUq4tm5XaYxv7.png)

![image.png](https://s2.loli.net/2025/05/09/BRq1bLwNAifQrc8.png)

4、查看顾客上次的购买时间：
![image.png](https://s2.loli.net/2025/05/09/wSbufANsOaLtXRn.png)

![image.png](https://s2.loli.net/2025/05/09/DKyx3W4nqprJbRv.png)

5、查询前20%时间的订单信息：
![image.png](https://s2.loli.net/2025/05/09/tK9g4JUSQ8p7T1D.png)

![image.png](https://s2.loli.net/2025/05/09/L2lamMcYhexIrw4.png)
