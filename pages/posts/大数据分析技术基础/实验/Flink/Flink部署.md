---
title: Flink部署
date: 2025-05-26
updated: 2025-05-26
categories: 大数据开发 实验 Flink
tags:
  - 大数据开发
  - 实验
  - Flink
---
## 快速上手
首先创建一个maven管理的java项目
![image.png](https://s2.loli.net/2025/05/27/D8EwRJUekSFBs1M.png)

修改pom文件，添加依赖性
![image.png](https://s2.loli.net/2025/05/27/FGYtzBMok6hxQsq.png)

新建data目录用于存放数据，在data目录中创建word.txt用于存储计算数据
![image.png](https://s2.loli.net/2025/05/27/Px3N84l62oVpt9W.png)

在java目录下新建cn.dreambo.wc用于存放程序，然后新建WordCountStreamUnboundedDemo.java java类存放计算程序
编写程序
![file-20250527170119323](https://s2.loli.net/2025/06/02/DguCdSLwsA1m8XR.png)
首先连接创建无界流执行环境
![image.png](https://s2.loli.net/2025/05/27/QyaYbztElPiOCjA.png)

然后选择从本地的40123端口读取数据
![file-20250527170127979](https://s2.loli.net/2025/06/02/amOtpUYRof5zE3L.png)

处理数据
先对数据进行分组，使用“ ”进行分组，然后输出到下一部分，
使用returns确定返回元组的类型，确保不会报错
使用keyby根据word进行分组
使用sum统计每一组的数量
![file-20250527170142922](https://s2.loli.net/2025/06/02/Trs7IfocB1V8aln.png)

使用print()输出结果
最后使用env.execute()执行操作
![file-20250527170159661](https://s2.loli.net/2025/06/02/VEpxr8UO71QmcyJ.png)

运行测试
首先使用netcat监听40123端口
![file-20250527170230912](https://s2.loli.net/2025/06/02/zUrmDWgueRysMc1.png)
然后运行java程序
![file-20250527170326938](https://s2.loli.net/2025/06/02/lifW8P5hQ6BkDCI.png)

可以看到java程序和netcat都已经启动
现在在shell中输入一些测试单词
![file-20250527170502084](https://s2.loli.net/2025/06/02/7nPGuaFDErWs5Xc.png)

程序能正常处理输入数据

## Flink集群搭建
## 集群启动

解压文件到安装文件夹
![image.png](https://s2.loli.net/2025/06/02/ilsxUZ5DGvdNu2m.png)

查看配置文件
需要修改config.yaml、masters、workers
![image.png](https://s2.loli.net/2025/06/02/YoNwvn5RuiPf78x.png)

编辑config.ymal
```
#JobManager节点地址.
jobmanager.rpc.address:server1
jobmanager.bind-host:0.0.0.0
rest.address:hadoop102
rest.bind-address:0.0.0.0
#TaskManager节点地址.需要配置为当前机器名
taskmanager.bind-host:0.0.0.0
taskmanager.host:server1
```
![image.png](https://s2.loli.net/2025/06/02/JevtlYmoG5M1uQn.png)
![image.png](https://s2.loli.net/2025/06/02/6Kph4SlwHxEDVsU.png)
![image.png](https://s2.loli.net/2025/06/02/riOYy7kG4VZeDzP.png)

其余机器类似仅需修改taskmanager即可

masters
修改主机为server1即可
![image.png](https://s2.loli.net/2025/06/02/mMzgNcAS9I3o8HE.png)

workers
添加集群所有机器
![image.png](https://s2.loli.net/2025/06/02/daHDqeEVLhu7mnx.png)

使用xsync同步代码
![image.png](https://s2.loli.net/2025/06/02/UVxFltWRATPsbqL.png)

修改server2和server3上的config.yaml的testmanager为对应主机名
![image.png](https://s2.loli.net/2025/06/02/Q7BSuF2XfNjWYZp.png)

运行flink集群
![image.png](https://s2.loli.net/2025/06/02/cNABFLsm2QfxS94.png)

运行结果
![image.png](https://s2.loli.net/2025/06/02/86WTFCyGvMHsSxQ.png)


网页访问
![image.png](https://s2.loli.net/2025/06/02/Kft25RkhFEX1DHu.png)

## WebUI提交

环境准备

在server1上启动netcat
![image.png](https://s2.loli.net/2025/06/02/nt6yDEz5Y7wSKTL.png)
在程序上修改为监听server1的40123端口
![image.png](https://s2.loli.net/2025/06/02/Q9XfjBP8Z4tKHLg.png)

程序打包
在pom.xml添加打包相关依赖
![image.png](https://s2.loli.net/2025/06/02/f8iZFys14IuEQqN.png)
限定原始依赖作用域，确保打包时不会被使用
![image.png](https://s2.loli.net/2025/06/02/tXRd6rYvKbpE2zi.png)


使用maven打包
![image.png](https://s2.loli.net/2025/06/02/vP1ASFNZtf75jar.png)

打包后，使用webui提交任务
![image.png](https://s2.loli.net/2025/06/02/k7dgRDImSXwYNnJ.png)

添加任务修改执行类名
![image.png](https://s2.loli.net/2025/06/02/lmJc1XxWwANshPg.png)

设置完成后提交job
![image.png](https://s2.loli.net/2025/06/02/cwXf7O1no5ChuGr.png)

运行测试
![image.png](https://s2.loli.net/2025/06/02/XAixgDQcPmJ5f8K.png)

## 命令行提交

使用命令行提交job
![image.png](https://s2.loli.net/2025/06/02/eH61lY7R4L9yTPf.png)
网页端反应
![image.png](https://s2.loli.net/2025/06/02/vnqjskAMZ2bDNPO.png)

查看具体Stout
虽然之前的还存在但是不影响新的计算
![image.png](https://s2.loli.net/2025/06/02/JKA649eYTUFZfob.png)

## standalone运行
环境准备
在server1中运行netcat
![image.png](https://s2.loli.net/2025/06/02/EqSOmkb9gPZpUuG.png)

将程序jar包转移到lib/下
![image.png](https://s2.loli.net/2025/06/02/5KerCzYnT4pjIw3.png)

执行命令运行JobManager
![image.png](https://s2.loli.net/2025/06/02/bJLZzorgIExNRGa.png)

启动TaskManager
![image.png](https://s2.loli.net/2025/06/02/uAdlFn2kcBz4PoL.png)

模拟输入数据
![image.png](https://s2.loli.net/2025/06/02/JijEbx8Ld6Tn5rs.png)


观察输出
![image.png](https://s2.loli.net/2025/06/02/yE4W7qMRF3QrJlx.png)

暂停运行
![image.png](https://s2.loli.net/2025/06/02/AayzPjgVHiTGp29.png)

## YARN部署
### 会话模式
配置Hadoop环境变量
![image.png](https://s2.loli.net/2025/06/02/giMatQ6Nw4HEpfD.png)
启动hadoop
![image.png](https://s2.loli.net/2025/06/02/LNumKFWwAg5BHVC.png)
通过yarn-session.sh运行
![image.png](https://s2.loli.net/2025/06/02/AoT1Kbmg6yvYJZW.png)

### 单作业模式
直接运行flink，在命令中增加 -d -t yarn-per-job 选项
![image.png](https://s2.loli.net/2025/06/02/5iLByqClVXhWQ2P.png)

### 应用模式
使用flink run-application 命令运行
![image.png](https://s2.loli.net/2025/06/02/EMYSdZiRg8sr5xH.png)

还可以将jar包提前上传到HDFS，然后使用HDFS路径运行
