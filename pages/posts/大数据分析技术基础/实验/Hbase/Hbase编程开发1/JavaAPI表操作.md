---
title: Hbase JavaAPI表操作
date: 2025-04-12
updated: 2025-04-12
categories: 大数据开发 实验 Hbase
tags:
  - 大数据开发
  - 实验
  - Hbase
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
![image.png](https://s2.loli.net/2025/05/06/W9LRsCTIVXFfngY.png)
#### 5.2 启动IntelliJ Idea并创建Java项目
1.启动IntelliJ Idea。
![image.png](https://s2.loli.net/2025/05/06/kHpNeiSqdD1FcU7.png)

2.在idea中创建Java项目，依次选择“Create New Project——java——next——next”，并命名为”hbase_name”，最后选择“Finish”
![image.png](https://s2.loli.net/2025/05/06/LQrbyFGidvTzp9k.png)

3.然后依次选择”File——Project structure…”菜单项，进入项目结构界面。
![image.png](https://s2.loli.net/2025/05/06/ys1wAKn4Fa3B5Lg.png)

4.base程序开发和运行，需要依赖Hbase相关的jar包。按图中所示依次选择，手动导入Hbase的jar包到项目中。
5。要引入的jar包位于Hbase安装目录的libs目录下。请按图中所示操作，之后一直点击【OK】按钮即可导包成功。
![image.png](https://s2.loli.net/2025/05/06/PthzxTEZSMdYjuf.png)

6.查看成功导入的部分jar包
![image.png](https://s2.loli.net/2025/05/06/48Mb3QhltFE5LPg.png)

#### 5.3、编写表操作代码并测试
1.选中项目”hbase_name的src目录上，单击右键，依次选择”New——Java Class”
![image.png](https://s2.loli.net/2025/05/06/Be19xy5pkv7mRzT.png)

2.在弹出的对话框中，命名”TablePro”，并选择”class”类型。
![image.png](https://s2.loli.net/2025/05/06/bDKaVzgBQRGu67k.png)

3.在“TablePor”类中先赋予conn一个null值
4.创建连接Hbase方法getConn()
5.创建定义表的方法testCreateTable()
6.创建main方法，测试表创建内容
![image.png](https://s2.loli.net/2025/05/06/vEQiVM5eWOHKTAZ.png)

7.在idea中右击选择【Run“TablePro.main()”】,运行测试
8.启动hbase shell 查看运行结果
![image.png](https://s2.loli.net/2025/05/06/ThzkHSJPcFDZ8os.png)

9.创建修改表方法testAlterTable()
![image.png](https://s2.loli.net/2025/05/06/tQur38BNLXIvDVU.png)

10.在main方法中测试修改表功能
![image.png](https://s2.loli.net/2025/05/06/lFkQUmXZvganeMj.png)

11.在idea中右击选择【Run“TablePro.main()”】,运行测试  
12.hbase shell结果如下：
![image.png](https://s2.loli.net/2025/05/06/NZM8aAs5bcIjGEl.png)

13.创建删除表的方法testDropTable()
![image.png](https://s2.loli.net/2025/05/06/YkHjyn3Ex1uirvz.png)

14.在main中测试删除表功能
![image.png](https://s2.loli.net/2025/05/06/qRL1bUSzdHQg6lm.png)

15.在idea中右击选择【Run“TablePro.main()”】,运行测试
16.hbase shell结果如下
![image.png](https://s2.loli.net/2025/05/06/oXJZreMucgs6S8l.png)
