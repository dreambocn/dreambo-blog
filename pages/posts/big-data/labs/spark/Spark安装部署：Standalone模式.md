---
title: Spark安装部署：Standalone模式
date: 2025-05-13
updated: 2025-05-13
categories:
  - 大数据开发
  - 实验
tags:
  - Spark
  - 部署
  - 实验
description: "记录 Spark Standalone 集群的安装配置与启动步骤，通过测试任务和 Web UI 验证主从节点的运行状态。"
---
**1、实验目的**

- 熟悉 Linux操作命令；
- 掌握Spark的解压安装以及Spark Standalone 的配置；
- 掌握启动Spark集群的方法；
- 熟悉Spark Standalone 的测试用例；
- 熟悉使用 Web UI查看spark的相关信息。

**2、实验环境**
**镜像详情**
虚拟机数量：3个 （1个master，2个slave：slave01，slave02）
此环境用于IDE安装使用
主从节点信息：

- 操作系统：Cent OS 7.5；
- 软件包位置：/home/zkpk/tgz；
- 数据包位置：/home/zkpk/experiment；
- 已安装软件：Hadoop版本：Apache Hadoop 2.7.3；Spark版本：Apache Spark 2.1.1。

**3、实验内容**

- 在master主节点解压压缩包，配置spark的slaves、spark-env.sh和.bash_profile文件，并将spark目录及.bash_profile远程拷贝到slave01、slave02从节点，在master节点启动spark集群，以spark  
    standalone模式运行一个spark的计算Pi的例子验证spark  
    standalone安装是否成功；并使用 Web UI查看spark的相关信息；
- 实验内容流程图。
    ![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/0d640a5581484a1f9119783996ce3d34/image/1.png)
    图3-1实验内容流程图

**4、实验关键点**

- 注意有的实验步骤命令是分别在master、slave01、slave02不同虚拟机上操作的；
- 修改spark的slaves、spark-env.sh和.bash_profile配置文件时一定要正确；
- 实验中所有命令或关键字都是大小写敏感的；
- 每做完一步最好验证一下是否成功以保证后续步骤顺利进行。

**5、实验效果图**

spark standalone 模式下Pi 计算示例最终效果图：
![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/0d640a5581484a1f9119783996ce3d34/image/b93b982ac8295c44f3860a7cb6e8820b.png)
图5-1实验效果图

**6、实验步骤**
**前提：开始本实验之前，已经在集群中成功安装部署好Hadoop集群。**
6.1在master虚拟机上解压spark压缩包。
6.1.1打开Linux命令行终端（桌面上点击鼠标右键，选择“打开终端”）。
6.1.2在命令行终端中，切换到spark压缩包所在目录/home/zkpk/tgz/spark。
![image.png](https://picture.dreambo.cn/2026/10/17/23/MTJmkE3WuzrsLQa-7ae4c8d9de1b5e03250acea1be79ae19.png)

6.1.3将spark压缩包解压到用户根目录/home/zkpk（即~/）下。
![image.png](https://picture.dreambo.cn/2026/10/17/23/XBNPnpZeagrYz4K-ef55e4c44582d8938686c9652a40e7b9.png)
6.2查看解压出的spark目录中的内容。
6.2.2进入解压出的spark目录
6.2.3查看此目录内容。
![image.png](https://picture.dreambo.cn/2026/10/17/23/rnjxvZUBtM4cIiC-80ec630878647d890765bc077574a407.png)

6.3配置环境变量。
6.3.1返回到用户根目录/home/zkpk下。
6.3.2使用vim命令编辑.bash_profile文件。
![image.png](https://picture.dreambo.cn/2026/10/17/23/etGnXvMRjyAEk4O-2e93afa826f439dad1441f0d1ed2b248.png)

6.3.3在文件末尾添加如下spark相关信息，然后保存退出。
![image.png|500](https://picture.dreambo.cn/2026/10/17/23/WcYarMZVzgiupb2-b82ef4f43eb744fa12e71d7bb4ec0583.png)
6.3.4运行source命令，重新编译.bash_profile，使添加变量生效。
![image.png](https://picture.dreambo.cn/2026/10/17/23/j4qsfrvkpmHnB2L-2dad1087fba32d2b9f180acdc0cc4849.png)

6.3.5分别在slave01、slave02虚拟机上执行如上配置。
6.3.5.1将.bash_profile文件分别拷贝到slave01、slave02虚拟机的/home/zkpk目录下。
![image.png](https://picture.dreambo.cn/2026/10/17/23/mAb3XSkoxqpLGhJ-9e866480069016c9e5306364314c7b16.png)

6.3.5.2 source命令使修改生效。
![image.png|475](https://picture.dreambo.cn/2026/10/17/23/RCkSqOpfIQBVE3W-ca4a54695d8815800570d9fcb62e45e1.png)

6.4修改slaves文件。
6.4.1进入spark的配置文件目录。
6.4.2将conf目录中的slaves.template文件重命名为slaves。
![image.png|450](https://picture.dreambo.cn/2026/10/17/23/r7FL2tSNJDYizUy-922798a2359b3aaab0b0b3a62fa7ff36.png)

6.4.3使用vim命令编辑slaves文件，将原内容替换为如下内容，并保存退出；如果已经有这些内容，直接退出。
```
vim slaves
```
![image.png](https://picture.dreambo.cn/2026/10/17/23/6wMGyY7K9gACZn1-b4de75410ffca5ec013151070bf89e3b.png)

图6-6修改slaves文件
6.5修改conf目录中的spark-env.sh文件。
6.5.1重命名文件spark-env.sh.template为spark-env.sh。
![image.png|475](https://picture.dreambo.cn/2026/10/17/23/fWLvA78swj5ONcq-d2c809290ae10538a334a13ce9d2027a.png)

![image.png](https://picture.dreambo.cn/2026/10/17/23/9Vb41WiHtrEOUIT-dc8c45e8babff2d035e907a77f1851da.png)

图6-7修改spark-env.sh文件
6.6将经过配置的spark主目录远程拷贝到另外两个从节点slave01和slave02虚拟机上。
6.6.1切换到用户根目录/home/zkpk下。
6.6.2远程拷贝spark主目录到slave01虚拟机上。
![image.png](https://picture.dreambo.cn/2026/10/17/23/EhnM3i1caLyWm5v-dd8681243a2dc6b48d13ff6c31f5e938.png)

6.6.3远程拷贝spark主目录到slave02虚拟机上。
![image.png](https://picture.dreambo.cn/2026/10/17/23/psGh3PiI1vayYcz-550cf922d54c0060752bfe386745e934.png)

6.7启动spark集群。
6.7.1进入master虚拟机的spark-2.1.1-bin-hadoop2.7/sbin/目录下。
6.7.2运行start-all.sh命令启动spark集群，然后分别在master、slave01和slave02虚拟机上使用jps命令查看进程，如果分别出现master和worker进程，说明集群启动成功。
![image.png](https://picture.dreambo.cn/2026/10/17/23/oVIjJMcQePSurOU-e5dd75c21e88fbf30545d9a77d547833.png)

![image.png|255](https://picture.dreambo.cn/2026/10/17/23/sOxDnKPvQb9fVSR-eb64313805043bc656c00599d4bbd16f.png)

图6-10master、slave01和slave02虚拟机spark集群启动成功
6.7.3验证spark standalone模式部署正确。
6.7.3.1在master虚拟机的菜单”Application”中 打开浏览器访问spark Web  
UI界面，在地址栏输入[](http://172.31.151.214/tms-module-adminhttp://master:8080/)，出现类似图6-11界面。
![image.png](https://picture.dreambo.cn/2026/10/17/23/JlRXyiFTcamw4xh-a08f7856e33226220db0d3d3a6bfc949.png)

6.7.3.2在命令行提交job到spark集群，其中spark-examples_2.11-2.1.1.jar是计算Pi的测试例子，后面的10是参数。
执行
![image.png](https://picture.dreambo.cn/2026/10/17/23/tz3wVZEdlnXUBa2-e8ff675f4288b3521109236a928ee1cf.png)

结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/dwLioNfUIZ2Fxl8-59ffe10fe480b3875578adedd1f24c80.png)

**7、思考题**

1.当成功运行Pi程序后，再在浏览器中输入[http://master:8080](http://master:8080/)，查看界面和未运行PI程序时的差别？
![image.png](https://picture.dreambo.cn/2026/10/17/23/9VUEWLjx6FdJnHY-d1e63c0cf2ab1d265192892ed117149c.png)
多了一个Completed Applications日志记录

2.启动spark 集群使用什么命令？
位于sbin的`./start-all.sh`

3.请同学们尝试调整步骤6.7.3.2命令行中执行计算Pi的jar包后面的那个参数，看看是否可以得到更接近3.1415926......的结果。
最后的数字`10`是传递给应用程序`SparkPi`的**计算参数**，用于指定蒙特卡洛方法中随机采样的次数（即生成的点数）。数值越大计算出的结果越精准但是计算时间越长
