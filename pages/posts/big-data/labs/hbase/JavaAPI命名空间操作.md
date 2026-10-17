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
description: "记录使用 HBase Java API 管理命名空间的实验步骤，整理客户端连接、命名空间操作与运行验证过程。"
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
![image.png](https://picture.dreambo.cn/2026/10/17/23/pZ31C8JdxXIFEsS-720877e23d6081553812987810303949.png)
2.在idea中创建Java项目，依次选择“Create New Project->java->next->next”，并命名为”hbase_name”，最后选择“Finish”，其它都默认即可。
![image.png](https://picture.dreambo.cn/2026/10/17/23/Ne9JXG8kUrvVls2-fdd438d68f69351bae1f7e72d56cf5bc.png)
![image.png](https://picture.dreambo.cn/2026/10/17/23/HMgO5PAJ47eKu6S-66f8f96b6702ac0ac6c99c53117b0bb1.png)
3.然后依次选择”File->Project structure…”菜单项，进入项目结构界面。
![image.png](https://picture.dreambo.cn/2026/10/17/23/8WyVIl3Oho9rDA4-50de8eaa03438c7663d58ac74aae8ba7.png)
4.Hbase程序开发和运行，需要依赖Hbase相关的jar包。按图中所示依次选择，手动导入Hbase的jar包到项目中。
![image.png](https://picture.dreambo.cn/2026/10/17/23/QgDZh9NwtxW52b7-95990df58af7f72fbe0e42640c526903.png)
5.导入Hbase安装目录下的libs目录中的jar包
![image.png](https://picture.dreambo.cn/2026/10/17/23/zYiQdFCjecbKMyf-595e3ed3d6bb00ff95884d46f419cbe5.png)
6.查看导出成功的jar包
![image.png](https://picture.dreambo.cn/2026/10/17/23/R4d6oahrbHxlWiE-6fb82586e814548607c5fbe23d78da16.png)
#### 5.2、编写Namespace操作代码

1.选中项目”hbase_name的src目录上，单击右键，依次选择”New->Java Class”，创建Java类。
2.在弹出的对话框中，命名”NameSpacePro”，并选择”class”类型。
![image.png](https://picture.dreambo.cn/2026/10/17/23/hNwuUgrAZf278DG-18abb10614e742675fc68fbe6446f1bd.png)

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
![image.png](https://picture.dreambo.cn/2026/10/17/23/IUWf9NnkEduybqG-95340aad4bc4ab5459fe2da4ca59a649.png)
#### 5.3、对Namespace的测试验证
1.启动hadoop
2.zookeeper，Hbase
![image.png](https://picture.dreambo.cn/2026/10/17/23/opGj3tyOzwCmevu-10e6f50ba373098c4c047c3aa8e177e2.png)

3.运行idea中的程序
![image.png](https://picture.dreambo.cn/2026/10/17/23/ROTEZSrdF4fX7NW-42482008c729ea24dc3aa7c83c60c877.png)

4.启动hbase shell 查看运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/pEyRl2UwFonAmLQ-0a29bb9278c831e59e67d20a34eab949.png)
