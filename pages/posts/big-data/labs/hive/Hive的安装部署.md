---
title: Hive的安装部署
date: 2025-04-25
updated: 2025-04-25
categories:
  - 大数据开发
  - 实验
tags:
  - Hive
  - 部署
  - 实验
description: "记录 Hive 实验环境的安装部署流程，梳理运行依赖、配置文件与启动验证步骤，为后续 HQL 操作准备环境。"
---
### 一、 实验目的

  掌握Hive的配置过程和三种搭建模式  
  了解Hive的配置原理

### 二、 实验内容

  1、启动Hadoop服务  
  2、内嵌模式部署  
  3、本地模式部署  
  4、远程模式部署

### 三、 实验环境

  硬件：ubuntu 16.04  
  软件：JDK-1.8、hive-2.3.3、Hadoop-2.7.3  
  数据存放路径：/data/dataset  
  tar包路径：/data/software  
  tar包压缩路径：/data/bigdata  
  软件安装路径:/opt  
  实验设计创建文件：/data/resource

### 四、 实验原理

  hive是架构在Hadoop之上的，所以需要先部署好Hadoop。  
  Hive的3种安装方式，分别对应不同的应用场景。  
  1、内嵌模式（元数据保存在内嵌的derby中，允许一个会话链接，尝试多个会话链接时会报错）  
  2、本地模式（本地安装mysql 替代derby存储元数据）  
  3、远程模式（远程安装mysql 替代derby存储元数据，并且与Hive不在同一台机器上）

### 五、 实验步骤
#### 5.1、启动Hadoop服务
1、检查MySql是否安装
![image.png](https://picture.dreambo.cn/2026/10/17/23/WTSBQZiLNqXVa8x-e795354181e9c1fe5e4367e2be4c0c77.png)
显示报错更改进入的命令
![image.png](https://picture.dreambo.cn/2026/10/17/23/hO5M7a4zSYBRCnq-635df6cc0f3909781cfa4775a5602d93.png)

2、检查Hadoop是否安装
注释Hadoop3的环境变量
![image.png](https://picture.dreambo.cn/2026/10/17/23/UP2B7xhVFm64iNe-41b30be2924aea0af01c8f179525cecc.png)
然后使用`source /etc/profile`更新环境变量
运行hadoop，并使用jps检查启动项
![image.png](https://picture.dreambo.cn/2026/10/17/23/FRV6ScOtgTAGDez-0cc3b0e7e7b964cecbb4a8a6a8b94bb6.png)

#### 5.2、内嵌模式部署
1、解压hive
进入软件包存放文件夹
![image.png](https://picture.dreambo.cn/2026/10/17/23/sMoYqxDGfOFQVHT-479187457765aa1687c05f84f4b151ee.png)
将Hive解压到`/data/bigdata`目录下
![image.png](https://picture.dreambo.cn/2026/10/17/23/q9M3HlpuaeLG5oQ-493c2293a01b9e345e5735ab0d6db0bb.png)
然后进入到解压文件内进行查看
![image.png](https://picture.dreambo.cn/2026/10/17/23/Lf89xZOy1zXSneR-67f42f15ce0141235f7f243d6f74d4e6.png)

2、初始化数据库
![image.png](https://picture.dreambo.cn/2026/10/17/23/Fmwjd7Bkftr4s2N-606bae65971fe92a415bef39eac65d98.png)

3、Hive测试
进入Hive客户端，查看是否完成安装
![image.png](https://picture.dreambo.cn/2026/10/17/23/kAdoVsPRHq4GbU7-28ae2a62faff295f224777d0f12e55ab.png)

#### 5.3、本地模式部署
本地模式在内嵌模式的基础之上搭建。  
修改Hive的配置文件  
1、进入到Hive的配置文件目录下：
![image.png](https://picture.dreambo.cn/2026/10/17/23/YiobsE961y3hquM-9cab018ad6389a507c524a1c9be49362.png)

2、修改hive-env.xml文件
先复制一份`hive-env.sh.template`并重命名为`hive-env.sh`，然后进入`hive-env.sh`文件，编辑环境变量
![image.png](https://picture.dreambo.cn/2026/10/17/23/k2LdhHzTI4GcmjR-5a0865bb3024b6e660c730ff878602f3.png)
编辑hive配置
![image.png](https://picture.dreambo.cn/2026/10/17/23/CEpt3LoZuJB97aH-0fbf7b20f0fb3bc33fc7ace286953d81.png)

3、新建新建`hive-site.xml`增加连接数据库的配置：
先创建hive-site.xml
![image.png](https://picture.dreambo.cn/2026/10/17/23/BcgMPiOkQ4htqpx-c971530d38a97344b1d06062b34f76f4.png)
然后编辑xml
![image.png](https://picture.dreambo.cn/2026/10/17/23/Q5CH7j9ElBA6Mzg-837ed7b3dfba65a27a4f481096b7eb84.png)

4、元数据的配置
配置Mysql的元数据，使用root用户登录
![image.png](https://picture.dreambo.cn/2026/10/17/23/dMEgp4SGuHnbrQf-1555e3ce24dfed22264579240bb2ccba.png)

授予权限给用户root然后刷新权限
![image.png|475](https://picture.dreambo.cn/2026/10/17/23/K3xVqh9uJPNz8kp-43ded000956b9a66253799cee65f9297.png)

5、将MySQL的驱动放到Hive中
![image.png](https://picture.dreambo.cn/2026/10/17/23/HdCbKEoTYfei4m9-32cfb40824e20d459a94f726a2719345.png)

6、初始化schema
![image.png](https://picture.dreambo.cn/2026/10/17/23/MmeF1Ls4nrS9Xtl-f8fdbaec1c5f37a11f65603e5dfd6c93.png)

7、启动测试
运行hive，然后创建data表，测试是否配置成功
![image.png](https://picture.dreambo.cn/2026/10/17/23/RdZ2VWnlhJc64pt-966ac1a6dfba3907ec9468ebdfe7fad4.png)

#### 5.4、远程模式部署
在本地的模式基础之上修改，主要是将访问的MySQL地址进行修改即可。  
1、修改mysql绑定地址  
先查看本机ip
![image.png](https://picture.dreambo.cn/2026/10/17/23/IXtGi5PLHosAk91-fb7962d1d66e09bad956a89ec2606009.png)

修改mysql的配置文件，执行命令
bindaddress修改为本地ip
![image.png](https://picture.dreambo.cn/2026/10/17/23/HWZu2pCPVkczthI-bf5c8e5c7a1396ebfcbfe918819618c1.png)

保存退出重启MySQL服务
![image.png](https://picture.dreambo.cn/2026/10/17/23/hp8SJG6iWQRrcLH-c1e75d7a8ae17653ba2cc5f1888c294c.png)

2、修改`hive-site.xml`配置
![image.png](https://picture.dreambo.cn/2026/10/17/23/lQY1nb6fSoBhUJk-6f4855688d36a91eaff4ef3225a6adda.png)

3、避免因本地安装导致的远程模式l初始化schema信息错误  
在本地模式安装过程中，对mysql数据库初始化过了schema信息，再次初始化可能导致失败，故先将之前创建的hive库删除
进入MySQL数据库执行命令
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/PFKv3aJrcyDU4n7-321fa1603c37d2cbc37bf5fd5fb713fb.png)

4、初始化scheme
![image.png](https://picture.dreambo.cn/2026/10/17/23/FWIAjqdHl4o5RKS-b46bca8685a27d58a80bbd7f4fb660ec.png)

5、启动测试  
进入Hive客户端：
![image.png](https://picture.dreambo.cn/2026/10/17/23/QVfFzgTNEhCpeYw-9bc349f2bac3c864d39112a7757ebd78.png)
