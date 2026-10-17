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
description: "通过 Hive 多表连接实验整理 HQL 查询方式，结合数据表关联条件和执行结果，理解多表数据组合的处理过程。"
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
  ![image.png](https://picture.dreambo.cn/2026/10/17/23/3giMXWJEbC9s1Gw-c3e2c67562bf37b022b6a2ef847379dd.png)

1、启动Hadoop：
![image.png](https://picture.dreambo.cn/2026/10/17/23/t8b69NZpEqO2d5e-7cd58b6ecb8d6dcd363c88277417ff26.png)

2、进入hive安装目录，打开hive
![image.png](https://picture.dreambo.cn/2026/10/17/23/QiLtspWT4MoNekc-7cb2416ec6acbee40d3b01175b631d75.png)
3、创建表  
创建员工信息表“employee”，分为员工名称、职务、入职日期、工资、绩效、部门编号五个字段，数据格式以“，”分割：
![image.png](https://picture.dreambo.cn/2026/10/17/23/LzRpTZdClrM5vou-70b748ac08f981d72d5de07a6fabcfdc.png)
创建部门表“department”，分为部门编号、部门、所在城市三个字段，数据格式以“，”分割：
![image.png](https://picture.dreambo.cn/2026/10/17/23/s6vpOuCjUNcWtgY-82619f7e645f16e39e37a80948b424ff.png)

4、导入数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/cqy9C2OZsTwNhQa-2fb2eaa5680de9f065d34c039335a525.png)

5、查看导入表的数据
![image.png|475](https://picture.dreambo.cn/2026/10/17/23/PloCtDGHFczx3wZ-33fcf1df0fe12279c4c31e20e35939fc.png)

![image.png|475](https://picture.dreambo.cn/2026/10/17/23/BgHZ5FDVR9jQYWn-9e5d90041f2e48655cc8ffd79ef2e678.png)

#### 5.2、多表连接查询操作
1、查询员工姓名和部门  
因为员工姓名和部门分别在两个表中，所以需要使用两表联查，使用“join”,其中员工表为主表
```
select e.name, d.position from employee e join department d on e.deptid=d.deptid;
```
![image.png](https://picture.dreambo.cn/2026/10/17/23/LwRHWU8NAyj9c4x-c135f193a7f9f71d37945d7a243c1b56.png)

2、查询员工姓名、部门和所在地区，其中“员工信息表”为主表
```
select e.name, d.position, d.location from employee e left join department d on e.deptid=d.deptid;
```
![image.png](https://picture.dreambo.cn/2026/10/17/23/ns3jZHMWED8p5yf-f1f7bee16e322e1a9331392b52974991.png)

3、查询员工姓名、部门和入职日期，其中“员工信息表”为主表
```
select e.name, d.position, e.hiredate from department d right join employee e on e.deptid=d.deptid;
```
![image.png](https://picture.dreambo.cn/2026/10/17/23/51VHrmkW9EYdFXf-901935e7068ee25a39a72e062bed6a53.png)

4、查询员工姓名、职务和入职日期，其中“员工信息表”为主表
```
select e.name, d.position, e.hiredate from department d full join employee e on e.deptid=d.deptid;
```
![image.png](https://picture.dreambo.cn/2026/10/17/23/xQ98mDhTRLwsFAU-4ba1f4e895a15643d6b011e3f8d61940.png)
