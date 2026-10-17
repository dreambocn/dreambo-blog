---
title: Flink部署
date: 2025-05-26
updated: 2025-05-26
categories:
  - 大数据开发
  - 实验
tags:
  - Flink
  - 部署
  - 实验
description: "记录 Flink WordCount 入门工程与集群搭建步骤，介绍依赖配置、流式数据读取，以及通过 Web UI 和命令行提交任务的方法。"
---
## 快速上手
首先创建一个maven管理的java项目
![image.png](https://picture.dreambo.cn/2026/10/17/23/D8EwRJUekSFBs1M-9f09e41af058b2ec0a0694877466d083.png)

修改pom文件，添加依赖性
![image.png](https://picture.dreambo.cn/2026/10/17/23/FGYtzBMok6hxQsq-8153283b329c2556be6cb1435dcad96e.png)

新建data目录用于存放数据，在data目录中创建word.txt用于存储计算数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/Px3N84l62oVpt9W-4bc26a3e571034e63ac07a8ccef81140.png)

在java目录下新建cn.dreambo.wc用于存放程序，然后新建WordCountStreamUnboundedDemo.java java类存放计算程序
编写程序
![file-20250527170119323](https://picture.dreambo.cn/2026/10/17/23/DguCdSLwsA1m8XR-31978b1b377786642a8ae6bce6931fef.png)
首先连接创建无界流执行环境
![image.png](https://picture.dreambo.cn/2026/10/17/23/QyaYbztElPiOCjA-2bb6353e9f3b54fac7800289864340e0.png)

然后选择从本地的40123端口读取数据
![file-20250527170127979](https://picture.dreambo.cn/2026/10/17/23/amOtpUYRof5zE3L-0a3dd1c2abd0e2ea0e60d3c36fa467d7.png)

处理数据
先对数据进行分组，使用“ ”进行分组，然后输出到下一部分，
使用returns确定返回元组的类型，确保不会报错
使用keyby根据word进行分组
使用sum统计每一组的数量
![file-20250527170142922](https://picture.dreambo.cn/2026/10/17/23/Trs7IfocB1V8aln-866c1a2afcf7c5efa132fd23bfc75c83.png)

使用print()输出结果
最后使用env.execute()执行操作
![file-20250527170159661](https://picture.dreambo.cn/2026/10/17/23/VEpxr8UO71QmcyJ-2cd10b4fe77a10fe44f6c8763e0dc07f.png)

运行测试
首先使用netcat监听40123端口
![file-20250527170230912](https://picture.dreambo.cn/2026/10/17/23/zUrmDWgueRysMc1-de302837bd8406a10e021ce7f9809a73.png)
然后运行java程序
![file-20250527170326938](https://picture.dreambo.cn/2026/10/17/23/lifW8P5hQ6BkDCI-f8d07d8a7889fa62208fb2583505352f.png)

可以看到java程序和netcat都已经启动
现在在shell中输入一些测试单词
![file-20250527170502084](https://picture.dreambo.cn/2026/10/17/23/7nPGuaFDErWs5Xc-07b850db8a9323313cc13720981137cc.png)

程序能正常处理输入数据

## Flink集群搭建
## 集群启动

解压文件到安装文件夹
![image.png](https://picture.dreambo.cn/2026/10/17/23/ilsxUZ5DGvdNu2m-402f67b92286ed6ada321bd5e03db1ed.png)

查看配置文件
需要修改config.yaml、masters、workers
![image.png](https://picture.dreambo.cn/2026/10/17/23/YoNwvn5RuiPf78x-322445dfb5fa1b2af8b91cfd581d6cd4.png)

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
![image.png](https://picture.dreambo.cn/2026/10/17/23/JevtlYmoG5M1uQn-10421f6e1ca419ad0439f99bb33f023e.png)
![image.png](https://picture.dreambo.cn/2026/10/17/23/6Kph4SlwHxEDVsU-cf811725f87b7c24a8d017b24cf907de.png)
![image.png](https://picture.dreambo.cn/2026/10/17/23/riOYy7kG4VZeDzP-590e16610614ff36506ef454e53c6b13.png)

其余机器类似仅需修改taskmanager即可

masters
修改主机为server1即可
![image.png](https://picture.dreambo.cn/2026/10/17/23/mMzgNcAS9I3o8HE-e95292e8b233af507100de588c6eabb8.png)

workers
添加集群所有机器
![image.png](https://picture.dreambo.cn/2026/10/17/23/daHDqeEVLhu7mnx-9688f0141bb39bbf7e62801a14f37867.png)

使用xsync同步代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/UVxFltWRATPsbqL-7bd3154cf0a7b7dceaedd6cda40b8c69.png)

修改server2和server3上的config.yaml的testmanager为对应主机名
![image.png](https://picture.dreambo.cn/2026/10/17/23/Q7BSuF2XfNjWYZp-56d95dd95a6fb2f945d11ec02840956a.png)

运行flink集群
![image.png](https://picture.dreambo.cn/2026/10/17/23/cNABFLsm2QfxS94-a498239f15239db6117e5f7f703ee481.png)

运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/86WTFCyGvMHsSxQ-7cf6941410a1c22422f5febcecd8ebff.png)


网页访问
![image.png](https://picture.dreambo.cn/2026/10/17/23/Kft25RkhFEX1DHu-c5eb99c711ee75c0ce5b68f703f8f685.png)

## WebUI提交

环境准备

在server1上启动netcat
![image.png](https://picture.dreambo.cn/2026/10/17/23/nt6yDEz5Y7wSKTL-5a0567cf3a758eea27f57cbf2c8f2ed1.png)
在程序上修改为监听server1的40123端口
![image.png](https://picture.dreambo.cn/2026/10/17/23/Q9XfjBP8Z4tKHLg-ee3745436051a8ff52f09119343fd9d4.png)

程序打包
在pom.xml添加打包相关依赖
![image.png](https://picture.dreambo.cn/2026/10/17/23/f8iZFys14IuEQqN-a362f24cfc214f4a5a90afc1045e58fa.png)
限定原始依赖作用域，确保打包时不会被使用
![image.png](https://picture.dreambo.cn/2026/10/17/23/tXRd6rYvKbpE2zi-aea9b29e263ee39f023ac3af083ea6ae.png)


使用maven打包
![image.png](https://picture.dreambo.cn/2026/10/17/23/vP1ASFNZtf75jar-8f7ebae4657ae1c836f904a7f7f76a56.png)

打包后，使用webui提交任务
![image.png](https://picture.dreambo.cn/2026/10/17/23/k7dgRDImSXwYNnJ-75e5a71b9bf4b59c4eec4332dca03f06.png)

添加任务修改执行类名
![image.png](https://picture.dreambo.cn/2026/10/17/23/lmJc1XxWwANshPg-7f0f8a6a3802b7f2c5a9e61b1f9fbcef.png)

设置完成后提交job
![image.png](https://picture.dreambo.cn/2026/10/17/23/cwXf7O1no5ChuGr-5aac953f4da5bef8557287b233973f63.png)

运行测试
![image.png](https://picture.dreambo.cn/2026/10/17/23/XAixgDQcPmJ5f8K-eaca102e35ac60f576825c9bc07f8482.png)

## 命令行提交

使用命令行提交job
![image.png](https://picture.dreambo.cn/2026/10/17/23/eH61lY7R4L9yTPf-5393ee25e74f6f82a8762363cadef14a.png)
网页端反应
![image.png](https://picture.dreambo.cn/2026/10/17/23/vnqjskAMZ2bDNPO-a3bfffff22be7c70af9f890becbe69fc.png)

查看具体Stout
虽然之前的还存在但是不影响新的计算
![image.png](https://picture.dreambo.cn/2026/10/17/23/JKA649eYTUFZfob-c52833cb70fdf3530adaf55cb50a2428.png)

## standalone运行
环境准备
在server1中运行netcat
![image.png](https://picture.dreambo.cn/2026/10/17/23/EqSOmkb9gPZpUuG-b7afa8f79ccfd4009ca880e985cfd84e.png)

将程序jar包转移到lib/下
![image.png](https://picture.dreambo.cn/2026/10/17/23/5KerCzYnT4pjIw3-3ab6fa8f1c45b6dc1f6e2f20aafedd89.png)

执行命令运行JobManager
![image.png](https://picture.dreambo.cn/2026/10/17/23/bJLZzorgIExNRGa-3b22de6b5a26bb17e0380b9d57562a89.png)

启动TaskManager
![image.png](https://picture.dreambo.cn/2026/10/17/23/uAdlFn2kcBz4PoL-e0168bdb9a754e7d49b8658cfa43671b.png)

模拟输入数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/JijEbx8Ld6Tn5rs-26c014dd963dd1a7d71ec0ec6f27dfe0.png)


观察输出
![image.png](https://picture.dreambo.cn/2026/10/17/23/yE4W7qMRF3QrJlx-bd26616ce8ec51ccd507bff532ab58b8.png)

暂停运行
![image.png](https://picture.dreambo.cn/2026/10/17/23/AayzPjgVHiTGp29-2ddd3b4e245f66a2cf8b74f1434b3288.png)

## YARN部署
### 会话模式
配置Hadoop环境变量
![image.png](https://picture.dreambo.cn/2026/10/17/23/giMatQ6Nw4HEpfD-6d5a3bcc1226ca94da1ba37c1a499ff4.png)
启动hadoop
![image.png](https://picture.dreambo.cn/2026/10/17/23/LNumKFWwAg5BHVC-07347e9c401c9c26954478b5c410b9b9.png)
通过yarn-session.sh运行
![image.png](https://picture.dreambo.cn/2026/10/17/23/AoT1Kbmg6yvYJZW-211f5fa1abd4c9021381134cd155efe0.png)

### 单作业模式
直接运行flink，在命令中增加 -d -t yarn-per-job 选项
![image.png](https://picture.dreambo.cn/2026/10/17/23/5iLByqClVXhWQ2P-ba5f76b7fe13a6cf3594f2f25e898c7b.png)

### 应用模式
使用flink run-application 命令运行
![image.png](https://picture.dreambo.cn/2026/10/17/23/EMYSdZiRg8sr5xH-d7524f4d28ff78f24e8282e426747cb0.png)

还可以将jar包提前上传到HDFS，然后使用HDFS路径运行
