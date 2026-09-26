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
![image.png](https://s2.loli.net/2025/05/09/WTSBQZiLNqXVa8x.png)
显示报错更改进入的命令
![image.png](https://s2.loli.net/2025/05/09/hO5M7a4zSYBRCnq.png)

2、检查Hadoop是否安装
注释Hadoop3的环境变量
![image.png](https://s2.loli.net/2025/05/09/UP2B7xhVFm64iNe.png)
然后使用`source /etc/profile`更新环境变量
运行hadoop，并使用jps检查启动项
![image.png](https://s2.loli.net/2025/05/09/FRV6ScOtgTAGDez.png)

#### 5.2、内嵌模式部署
1、解压hive
进入软件包存放文件夹
![image.png](https://s2.loli.net/2025/05/09/sMoYqxDGfOFQVHT.png)
将Hive解压到`/data/bigdata`目录下
![image.png](https://s2.loli.net/2025/05/09/q9M3HlpuaeLG5oQ.png)
然后进入到解压文件内进行查看
![image.png](https://s2.loli.net/2025/05/09/Lf89xZOy1zXSneR.png)

2、初始化数据库
![image.png](https://s2.loli.net/2025/05/09/Fmwjd7Bkftr4s2N.png)

3、Hive测试
进入Hive客户端，查看是否完成安装
![image.png](https://s2.loli.net/2025/05/09/kAdoVsPRHq4GbU7.png)

#### 5.3、本地模式部署
本地模式在内嵌模式的基础之上搭建。  
修改Hive的配置文件  
1、进入到Hive的配置文件目录下：
![image.png](https://s2.loli.net/2025/05/09/YiobsE961y3hquM.png)

2、修改hive-env.xml文件
先复制一份`hive-env.sh.template`并重命名为`hive-env.sh`，然后进入`hive-env.sh`文件，编辑环境变量
![image.png](https://s2.loli.net/2025/05/09/k2LdhHzTI4GcmjR.png)
编辑hive配置
![image.png](https://s2.loli.net/2025/05/09/CEpt3LoZuJB97aH.png)

3、新建新建`hive-site.xml`增加连接数据库的配置：
先创建hive-site.xml
![image.png](https://s2.loli.net/2025/05/09/BcgMPiOkQ4htqpx.png)
然后编辑xml
![image.png](https://s2.loli.net/2025/05/09/Q5CH7j9ElBA6Mzg.png)

4、元数据的配置
配置Mysql的元数据，使用root用户登录
![image.png](https://s2.loli.net/2025/05/09/dMEgp4SGuHnbrQf.png)

授予权限给用户root然后刷新权限
![image.png|475](https://s2.loli.net/2025/05/09/K3xVqh9uJPNz8kp.png)

5、将MySQL的驱动放到Hive中
![image.png](https://s2.loli.net/2025/05/09/HdCbKEoTYfei4m9.png)

6、初始化schema
![image.png](https://s2.loli.net/2025/05/09/MmeF1Ls4nrS9Xtl.png)

7、启动测试
运行hive，然后创建data表，测试是否配置成功
![image.png](https://s2.loli.net/2025/05/09/RdZ2VWnlhJc64pt.png)

#### 5.4、远程模式部署
在本地的模式基础之上修改，主要是将访问的MySQL地址进行修改即可。  
1、修改mysql绑定地址  
先查看本机ip
![image.png](https://s2.loli.net/2025/05/09/IXtGi5PLHosAk91.png)

修改mysql的配置文件，执行命令
bindaddress修改为本地ip
![image.png](https://s2.loli.net/2025/05/09/HWZu2pCPVkczthI.png)

保存退出重启MySQL服务
![image.png](https://s2.loli.net/2025/05/09/hp8SJG6iWQRrcLH.png)

2、修改`hive-site.xml`配置
![image.png](https://s2.loli.net/2025/05/09/lQY1nb6fSoBhUJk.png)

3、避免因本地安装导致的远程模式l初始化schema信息错误  
在本地模式安装过程中，对mysql数据库初始化过了schema信息，再次初始化可能导致失败，故先将之前创建的hive库删除
进入MySQL数据库执行命令
![image.png|500](https://s2.loli.net/2025/05/09/PFKv3aJrcyDU4n7.png)

4、初始化scheme
![image.png](https://s2.loli.net/2025/05/09/FWIAjqdHl4o5RKS.png)

5、启动测试  
进入Hive客户端：
![image.png](https://s2.loli.net/2025/05/09/QVfFzgTNEhCpeYw.png)
