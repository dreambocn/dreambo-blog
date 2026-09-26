---
title: Hbase JavaAPl命名空间操作
date: 2025-04-12
updated: 2025-04-12
categories:
  - 大数据开发
  - 实验
tags:
  - HBase
  - JavaAPI
  - 实验
---
### 一、实验目的

  掌握Hbase开发环境的配置  
  掌握hbase对Namespace的操作  
  了解Hbase的的NamespaceJava API的使用原理

### 二、实验内容

  1、启动IntelliJ Idea并创建Java项目  
  2、编写Namespace操作代码  
  3、对Namespace的测试验证

### 三、实验原理

  HBase命名空间 namespace 是与关系数据库系统中的数据库类似的表的逻辑分组。这种抽象为即将出现的多租户相关功能奠定了基础：

- 配额管理（Quota Management）（HBASE-8410） - 限制命名空间可占用的资源量（即区域，表）。
  
- 命名空间安全管理（Namespace Security Administration）（HBASE-9206） - 为租户提供另一级别的安全管理。
  
- 区域服务器组（Region server groups）（HBASE-6721） - 命名空间/表可以固定在 RegionServers 的子集上，从而保证粗略的隔离级别。
  

### 四、实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、Hbase1.4.9、Hadoop-2.7、idea-IC-191.7479.19  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 五、实验步骤

#### 5.1、启动IntelliJ Idea并创建Java项目
1.启动IntelliJ Idea。在终端窗口下
![image.png](https://s2.loli.net/2025/05/06/pZ31C8JdxXIFEsS.png)
2.在idea中创建Java项目，依次选择“Create New Project->java->next->next”，并命名为”hbase_name”，最后选择“Finish”，其它都默认即可。
![image.png](https://s2.loli.net/2025/05/06/Ne9JXG8kUrvVls2.png)
![image.png](https://s2.loli.net/2025/05/06/HMgO5PAJ47eKu6S.png)
3.然后依次选择”File->Project structure…”菜单项，进入项目结构界面。
![image.png](https://s2.loli.net/2025/05/06/8WyVIl3Oho9rDA4.png)
4.Hbase程序开发和运行，需要依赖Hbase相关的jar包。按图中所示依次选择，手动导入Hbase的jar包到项目中。
![image.png](https://s2.loli.net/2025/05/06/QgDZh9NwtxW52b7.png)
5.导入Hbase安装目录下的libs目录中的jar包
![image.png](https://s2.loli.net/2025/05/06/zYiQdFCjecbKMyf.png)
6.查看导出成功的jar包
![image.png](https://s2.loli.net/2025/05/06/R4d6oahrbHxlWiE.png)
#### 5.2、编写Namespace操作代码

1.选中项目”hbase_name的src目录上，单击右键，依次选择”New->Java Class”，创建Java类。
2.在弹出的对话框中，命名”NameSpacePro”，并选择”class”类型。
![image.png](https://s2.loli.net/2025/05/06/hNwuUgrAZf278DG.png)

3.创建configuration对象
```java
Configuration conf=new Configuration():
```

4.设置连接参数
```java
conf.set("hbase.zookeeper.quorum","localhost:2181");
```

5.获取一个Admin对象
```java
HBaseAdmin hbaseAdmin = new HBaseAdmin(conf);
```

6.获取一个namespace的描述器
```java
NamespaceDescriptor nsd = NamespaceDescriptor.create("ns1").build();
```

7.提交创建namespace
```java
hbaseAdmin.createNamespace(nsd);
```

8.销毁对象
```java
hbaseAdmin.close();
```

完整代码
![image.png](https://s2.loli.net/2025/05/06/IUWf9NnkEduybqG.png)
#### 5.3、对Namespace的测试验证
1.启动hadoop
2.zookeeper，Hbase
![image.png](https://s2.loli.net/2025/05/06/opGj3tyOzwCmevu.png)

3.运行idea中的程序
![image.png](https://s2.loli.net/2025/05/06/ROTEZSrdF4fX7NW.png)

4.启动hbase shell 查看运行结果
![image.png](https://s2.loli.net/2025/05/06/pEyRl2UwFonAmLQ.png)
