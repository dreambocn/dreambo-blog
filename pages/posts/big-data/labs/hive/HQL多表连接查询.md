---
title: HQL多表连接查询
date: 2025-04-25
updated: 2025-04-25
categories:
  - 大数据开发
  - 实验
tags:
  - Hive
  - HQL
  - SQL
  - 实验
---
### 一、 实验目的

  掌握Hive的HQL多表查询操作  
  了解HQLJoin的几种常用连接方式

### 二、 实验内容

  1、启动Hadoop服务和Hive服务，并创建表数据  
  2、多表连接查询操作

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、hive-2.3.3、Hadoop-2.7.3  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

  Hive的多表联查：  
  通左连接（左边表中的数据优先全部显示）、右连接（右边表中的数据优先全部显示）、内连接（只显示符合条件的数据）、全连接（显示左右表中全部数据）等方式实现多个表的数据查询。

### 五、 实验步骤

#### 5.1、启动Hadoop服务和Hive服务，并创建表数据
注意：需要在配置文件/etc/profile中注释掉Hadoop3的相关环境变量设置，然后执行命令【source /etc/profile】，让配置的profile文件立刻生效。  
  ![image.png](https://s2.loli.net/2025/05/09/3giMXWJEbC9s1Gw.png)

1、启动Hadoop：
![image.png](https://s2.loli.net/2025/05/09/t8b69NZpEqO2d5e.png)

2、进入hive安装目录，打开hive
![image.png](https://s2.loli.net/2025/05/09/QiLtspWT4MoNekc.png)
3、创建表  
创建员工信息表“employee”，分为员工名称、职务、入职日期、工资、绩效、部门编号五个字段，数据格式以“，”分割：
![image.png](https://s2.loli.net/2025/05/09/LzRpTZdClrM5vou.png)
创建部门表“department”，分为部门编号、部门、所在城市三个字段，数据格式以“，”分割：
![image.png](https://s2.loli.net/2025/05/09/s6vpOuCjUNcWtgY.png)

4、导入数据
![image.png](https://s2.loli.net/2025/05/09/cqy9C2OZsTwNhQa.png)

5、查看导入表的数据
![image.png|475](https://s2.loli.net/2025/05/09/PloCtDGHFczx3wZ.png)

![image.png|475](https://s2.loli.net/2025/05/09/BgHZ5FDVR9jQYWn.png)

#### 5.2、多表连接查询操作
1、查询员工姓名和部门  
因为员工姓名和部门分别在两个表中，所以需要使用两表联查，使用“join”,其中员工表为主表
```
select e.name, d.position from employee e join department d on e.deptid=d.deptid;
```
![image.png](https://s2.loli.net/2025/05/09/LwRHWU8NAyj9c4x.png)

2、查询员工姓名、部门和所在地区，其中“员工信息表”为主表
```
select e.name, d.position, d.location from employee e left join department d on e.deptid=d.deptid;
```
![image.png](https://s2.loli.net/2025/05/09/ns3jZHMWED8p5yf.png)

3、查询员工姓名、部门和入职日期，其中“员工信息表”为主表
```
select e.name, d.position, e.hiredate from department d right join employee e on e.deptid=d.deptid;
```
![image.png](https://s2.loli.net/2025/05/09/51VHrmkW9EYdFXf.png)

4、查询员工姓名、职务和入职日期，其中“员工信息表”为主表
```
select e.name, d.position, e.hiredate from department d full join employee e on e.deptid=d.deptid;
```
![image.png](https://s2.loli.net/2025/05/09/xQ98mDhTRLwsFAU.png)
