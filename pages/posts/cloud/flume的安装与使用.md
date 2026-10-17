---
title: flume的安装与使用
date: 2022-04-01
updated: 2022-04-01
categories:
  - 云计算与分布式
  - 笔记
tags:
  - Flume
description: "记录 Flume 的安装与使用实践，梳理软件部署、采集配置及运行过程，理解日志采集组件的连接与数据流转方式。"
---
## flume的安装与使用

## 软件的安装

### 1. 下载与解压缩

- 通过wget直接从官网下载

```
  wget https://dlcdn.apache.org/flume/1.11.0/apache-flume-1.11.0-bin.tar.gz
```

![image-20240331224805037](https://picture.dreambo.cn/2026/10/17/23/7TwMNjayzHkp6G4-334ac856f1678d557b6dc11982289229.png)

- 解压缩

```
sudo tar -zxvf apache-flume-1.11.0-bin.tar.gz -C /opt/software/
```

![image-20240331224719469](https://picture.dreambo.cn/2026/10/17/23/iqRpSD8xlOGXMFJ-122804db583a275960ad2a90f784b577.png)

### 2.配置环境

- 复制环境配置

```
cd /opt/software/apache-flume-1.11.0-bin/conf/
cp flume-env.sh.template flume-env.sh
```

![image-20240331225230839](https://picture.dreambo.cn/2026/10/17/23/i9lL6vwaFqOh4sT-c4463fd14b9ad51636cc6026295702f5.png)

- 编辑flume环境

```
vim flume-env.sh
```

![image-20240331230506154](https://picture.dreambo.cn/2026/10/17/23/orBvOQtCidE8Deq-938ddb8e3eefc5d60af75fc9af89c040.png)

```
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
```

- 配置环境配置

```
vim /etc/profile
```
![image-20240331230652533](https://picture.dreambo.cn/2026/10/17/23/tAGYEpPCJbd3sWu-e0642413659a84b78ddb23010c642c4a.png)

```
export FLUME_HOME=/opt/software/apache-flume-1.11.0-bin
export PATH=$FLUME_HOME/bin:$PATH
```

执行source命令

```
source /etc/profile
```

- 验证查看

```
flume-ng version
```

![image-20240331230957573](https://picture.dreambo.cn/2026/10/17/23/HC6RhedYVJkT8Q2-2b115be724a8634e243be7f0955bddda.png)


bin/flume-ng agent --conf conf/ --name a2 --conf-file /opt/software/apache-flume-1.11.0-bin/job/flume-file-hdfs.conf
