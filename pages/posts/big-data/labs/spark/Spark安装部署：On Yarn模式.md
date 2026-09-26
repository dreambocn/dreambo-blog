---
title: Spark安装部署：OnYarn模式
date: 2025-05-13
updated: 2025-05-13
categories:
  - 大数据开发
  - 实验
tags:
  - Spark
  - 部署
  - 实验
---
**1、实验目的**

- 熟悉 Linux操作命令；
- 掌握Spark的解压安装以及Spark on Yarn 的配置；
- 掌握启动Hadoop集群；
- 熟悉Spark on yarn 的测试用例；
- 熟悉使用 Web UI查看Spark的相关信息。

**2、实验环境**

**镜像详情**
虚拟机数量：3个 （1个master，2个slave：slave01，slave02）
此环境用于IDE安装使用。
主从节点信息：

- 操作系统：Cent OS 7.5；
- 软件包位置：/home/zkpk/tgz；
- 数据包位置：/home/zkpk/experiment；
- 已安装软件：Hadoop版本：Apache Hadoop 2.7.3，Spark版本：Apache Spark 2.1.1。

**3、实验内容**

- 在master节点中，解压安装spark并通过修改.bash_profile文件配置spark；然后，启动hadoop集群，以spark on yarn的模式运行一个spark的计算Pi的例子，以此验证spark on yarn安装是否成功；并会使用 Web UI查看spark的相关信息。
- 实验内容流程图。
  
    ![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/f0be58cda1aa4974a424da02773c51ae/image/1.png)
  图3-1实验内容流程图

**4、实验关键点**

- 注意有的实验步骤命令是分别在master、slave01、slave02不同虚拟机上操作的；
- 修改.bash_profile配置文件时一定要正确；
- 实验中所有命令或关键字都是大小写敏感的；
- 每做完一步最好验证一下是否成功以保证后续步骤顺利进行。

**5、实验效果图**
spark on yarn 模式下Pi 计算示例操作最终效果图：
![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/f0be58cda1aa4974a424da02773c51ae/image/d8284c579e27a545dd82a53a75842abf.png)
图 5-1实验效果图

**6、实验步骤**
**前提：开始本实验之前，已经在集群中成功安装部署好Hadoop集群。**
6.1在master虚拟机上解压spark压缩包。
6.1.1打开linux命令行终端。
6.1.2命令行终端中，切换到spark压缩包所在目录/home/zkpk/tgz/spark。
6.1.3将spark压缩包解压到用户的根目录/home/zkpk下。
![image.png|500](https://s2.loli.net/2025/05/16/thpIbJ4EGl3iOXA.png)

6.2查看解压出的spark目录中的内容。
6.2.1返回用户根目录/home/zkpk。
6.2.2进入解压出的spark目录。
6.2.3查看此目录内容
![image.png|500](https://s2.loli.net/2025/05/16/rVY2WclBHPCUqoh.png)

6.3配置环境变量。
6.3.1返回到用户根目录/home/zkpk。
6.3.2使用vim命令编辑.bash_profile文件。
6.3.3添加如下三个环境变量在文件末尾，然后保存退出。
6.3.4运行source命令，重新编译.bash_profile，使添加变量生效。
![image.png|525](https://s2.loli.net/2025/05/16/JYxDVgGXfo1vCmw.png)

![image.png|375](https://s2.loli.net/2025/05/16/7gXZceCNb2tn3AW.png)

6.3.5有时候我们在启动spark on  
yarn时会出现内存大小错误，此时job会被强制杀死，为了避免这一情况，我们需要编辑/home/zkpk/hadoop-2.7.3/etc/hadoop目录下的yarn-site.xml文件。
![image.png](https://s2.loli.net/2025/05/16/BF816Hr54P3Avgp.png)

6.3.6在文件中加入以下内容，这里的设置是取消yarn运行模式的运行内存检测，这样就算内存达不到要求也不会kill掉任务。
![image.png](https://s2.loli.net/2025/05/16/ZwHuC1k5IiqhOXM.png)

6.3.7将yarn-site.xml文件拷贝到slave01、slave02从节点。
![image.png](https://s2.loli.net/2025/05/16/jfFYo8zGNt1H4Dm.png)

6.4启动Hadoop集群。
6.4.1在master虚拟机上启动Hadoop集群。
![image.png](https://s2.loli.net/2025/05/16/fgBcREUPkNyLYoO.png)
6.4.2在master虚拟机上运行jps，确认NameNode, SecondaryNameNode,ResourceManager进程启动。
![image.png|500](https://s2.loli.net/2025/05/16/H35lBdrzLmRxTFu.png)
6.4.3在slave01虚拟机上运行jps，确认DataNode, NodeManager进程启动。
![image.png|500](https://s2.loli.net/2025/05/16/oYULV4MupBdjZIs.png)

6.4.3在slave02虚拟机上运行jps，确认DataNode, NodeManager进程启动。
![image.png|500](https://s2.loli.net/2025/05/16/1HSg27WMClfXwUE.png)

6.5验证spark on yarn安装部署是否生效。
6.5.1进入spark主目录。
6.5.2执行spark内置的测试代码。
![image.png](https://s2.loli.net/2025/05/16/hO5taLARvTkDswV.png)
结果：
![image.png](https://s2.loli.net/2025/05/16/75Tt6qpiJnAceE8.png)

6.5.3访问Web UI，在master虚拟机的菜单”Application”中 打开浏览器访问spark Web UI界面，在地址栏输入[](http://172.31.151.214/tms-module-adminhttp://master:18088/)，出现类似图6-11界面。
![image.png](https://s2.loli.net/2025/05/16/vzmE2Neuw3iYkh4.png)

**7、思考题**

1.请同学们尝试关闭hadoop集群，然后重新启动集群但是不取消安全模式，看是否影响6.5.2步骤的执行？
不能启动
因为此时是安全模式，在这个时候文件系统是只读的，不能进行写操作。而用户提交spark作业时spark会创建HDFS临时文件但此时NameNode在安全模式所以操作失败。
![image.png](https://s2.loli.net/2025/05/16/zCOhvEWQDRdY2K9.png)

2.请同学们尝试不要完整添加6.3.3中的三个环境变量在.bash_profile文件末尾，试问会出现什么效果？

哪怕全注释了也能运行
![image.png](https://s2.loli.net/2025/05/16/gWmna1bNTKxSktf.png)

![image.png](https://s2.loli.net/2025/05/16/PdqIGOhgvE2DSfB.png)

3.请同学们尝试调整步骤6.5.2命令行中Pi后面的一个参数，看看是否可以得到更接近3.1415926......的结果。
最后的数字`10`是传递给应用程序`SparkPi`的**计算参数**，用于指定蒙特卡洛方法中随机采样的次数（即生成的点数）。数值越大计算出的结果越精准但是计算时间越长
