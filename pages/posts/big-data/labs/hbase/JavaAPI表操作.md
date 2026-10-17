---
title: Hbase JavaAPI表操作
date: 2025-04-12
updated: 2025-04-12
categories:
  - 大数据开发
  - 实验
tags:
  - HBase
  - JavaAPI
  - 实验
description: "通过 HBase Java API 实验梳理表操作的依赖与连接方式，结合示例学习通过程序管理数据表和访问表数据。"
---
### 一、实验目的

  了解使用Java API对Hbase表操作的原理  
  掌握使用Java API对Hbase的表操作

### 二、实验内容

  1、启动Hadoop、Hbase、Zookeeper服务  
  2、使用Idea构建Hbase的开发环境  
  3、编写表操作代码并测试

### 三、实验原理

  使用HBaseAdmin类的createTable()方法创建表在HBase中。这个类属于org.apache.hadoop.hbase.client包，使用Java API创建表在HBase中的步骤如下：

- 实例化HBaseAdmin
- 创建TableDescriptor
- 通过执行管理

### 四、实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、Hbase1.4.9、Hadoop-2.7.3、idea-IC-191.7479.19  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 五、实验步骤

#### 5.1、启动Hadoop、Hbase、Zookeeper服务
1.启动hadoop
2.启动zookeeper和Hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/W9LRsCTIVXFfngY-35c56feb376abc1c12de4ae022946bb0.png)
#### 5.2 启动IntelliJ Idea并创建Java项目
1.启动IntelliJ Idea。
![image.png](https://picture.dreambo.cn/2026/10/17/23/kHpNeiSqdD1FcU7-e154623a18e4fbf43e036af21139fdaf.png)

2.在idea中创建Java项目，依次选择“Create New Project——java——next——next”，并命名为”hbase_name”，最后选择“Finish”
![image.png](https://picture.dreambo.cn/2026/10/17/23/LQrbyFGidvTzp9k-3df5f32e1110d3710c5385aba1df99ed.png)

3.然后依次选择”File——Project structure…”菜单项，进入项目结构界面。
![image.png](https://picture.dreambo.cn/2026/10/17/23/ys1wAKn4Fa3B5Lg-4f232cf36036fed436be87005a3b2e38.png)

4.base程序开发和运行，需要依赖Hbase相关的jar包。按图中所示依次选择，手动导入Hbase的jar包到项目中。
5。要引入的jar包位于Hbase安装目录的libs目录下。请按图中所示操作，之后一直点击【OK】按钮即可导包成功。
![image.png](https://picture.dreambo.cn/2026/10/17/23/PthzxTEZSMdYjuf-cba4d2581f5bc29e2e406fff0dfbf219.png)

6.查看成功导入的部分jar包
![image.png](https://picture.dreambo.cn/2026/10/17/23/48Mb3QhltFE5LPg-b688465cf1fd9c66d6128db6158f5392.png)

#### 5.3、编写表操作代码并测试
1.选中项目”hbase_name的src目录上，单击右键，依次选择”New——Java Class”
![image.png](https://picture.dreambo.cn/2026/10/17/23/Be19xy5pkv7mRzT-d8d9a43ac2332013cbcc5fe5ec9e9ffa.png)

2.在弹出的对话框中，命名”TablePro”，并选择”class”类型。
![image.png](https://picture.dreambo.cn/2026/10/17/23/bDKaVzgBQRGu67k-533f65ed0e778d1d16d27051edc8dfc0.png)

3.在“TablePor”类中先赋予conn一个null值
4.创建连接Hbase方法getConn()
5.创建定义表的方法testCreateTable()
6.创建main方法，测试表创建内容
![image.png](https://picture.dreambo.cn/2026/10/17/23/vEQiVM5eWOHKTAZ-9f591bb609d0ca2ecc71f955c0814feb.png)

7.在idea中右击选择【Run“TablePro.main()”】,运行测试
8.启动hbase shell 查看运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/ThzkHSJPcFDZ8os-150a1d8a1b44eafb6e3e1d3dfa569bc6.png)

9.创建修改表方法testAlterTable()
![image.png](https://picture.dreambo.cn/2026/10/17/23/tQur38BNLXIvDVU-d6dc6e04c0eef5bc946e67c0a614a4d2.png)

10.在main方法中测试修改表功能
![image.png](https://picture.dreambo.cn/2026/10/17/23/lFkQUmXZvganeMj-670798b4b90ed264d1ce65d7cc772727.png)

11.在idea中右击选择【Run“TablePro.main()”】,运行测试  
12.hbase shell结果如下：
![image.png](https://picture.dreambo.cn/2026/10/17/23/NZM8aAs5bcIjGEl-68bc3152af12b1d1ef832191bef69e9e.png)

13.创建删除表的方法testDropTable()
![image.png](https://picture.dreambo.cn/2026/10/17/23/YkHjyn3Ex1uirvz-0c4d587eea7c591639cbb2208d3bbddb.png)

14.在main中测试删除表功能
![image.png](https://picture.dreambo.cn/2026/10/17/23/qRL1bUSzdHQg6lm-f720687fcbf9b6522da78a7545ad7d4c.png)

15.在idea中右击选择【Run“TablePro.main()”】,运行测试
16.hbase shell结果如下
![image.png](https://picture.dreambo.cn/2026/10/17/23/oXJZreMucgs6S8l-038b881cff6e9c24723a62d9c8fc9251.png)
