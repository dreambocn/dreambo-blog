---
title: java相关
date: 2022-04-01
updated: 2022-04-01
categories: java 笔记
tags:
  - java
  - 笔记
top: 1
---
## java相关



> [!note]
>
> Java 版本之间的切换

对于 Java 运行时：

```shell
 $ sudo update-alternatives --config java
```
对于 Java 编译器： 
```shell
$ sudo update-alternatives --config javac
```

## Docker相关

查看docker运行状态

```shell
sudo systemctl is-active docker
```

容器相关

```shell
#使用zk命令行客户端连接zk
docker run -it --rm --link zookeeper:zookeeper zookeeper zkCli.sh -server zookeeper

# 查看zookeeper容器实例进程信息
docker top zookeeper

# 停止zookeeper实例进程
docker stop zookeeper

# 启动zookeeper实例进程
docker start zookeeper

# 重启zookeeper实例进程
docker restart zookeeper

# 查看zookeeper进程日志
docker logs -f zookeeper

# 杀死zookeeper实例进程
docker kill -s KILL zookeeper

# 移除zookeeper实例
docker rm -f -v zookeeper
```

