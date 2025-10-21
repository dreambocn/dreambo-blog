---
title: flume的安装与使用
date: 2022-04-01
updated: 2022-04-01
categories: 云计算与分布式 笔记
tags:
  - 云计算与分布式
  - 笔记
top: 1
---
# flume的安装与使用

## 软件的安装

### 1. 下载与解压缩

- 通过wget直接从官网下载

```
  wget https://dlcdn.apache.org/flume/1.11.0/apache-flume-1.11.0-bin.tar.gz
```

![image-20240331224805037](https://s2.loli.net/2024/03/31/7TwMNjayzHkp6G4.png)

- 解压缩

```
sudo tar -zxvf apache-flume-1.11.0-bin.tar.gz -C /opt/software/
```

![image-20240331224719469](https://s2.loli.net/2024/03/31/iqRpSD8xlOGXMFJ.png)

### 2.配置环境

- 复制环境配置

```
cd /opt/software/apache-flume-1.11.0-bin/conf/
cp flume-env.sh.template flume-env.sh
```

![image-20240331225230839](https://s2.loli.net/2024/03/31/i9lL6vwaFqOh4sT.png)

- 编辑flume环境

```
vim flume-env.sh
```

![image-20240331230506154](https://s2.loli.net/2024/03/31/orBvOQtCidE8Deq.png)

```
export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/
```

- 配置环境配置

```
vim /etc/profile
```
![image-20240331230652533](https://s2.loli.net/2024/03/31/tAGYEpPCJbd3sWu.png)

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

![image-20240331230957573](https://s2.loli.net/2024/03/31/HC6RhedYVJkT8Q2.png)


bin/flume-ng agent --conf conf/ --name a2 --conf-file /opt/software/apache-flume-1.11.0-bin/job/flume-file-hdfs.conf
