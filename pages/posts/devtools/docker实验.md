---
title: docker实验
date: 2022-04-01
updated: 2022-04-01
categories:
  - 开发工具
  - 工具推荐
tags:
  - Docker
description: "记录 Docker 安装、镜像下载和容器运行实验，整理环境准备、版本检查与常见操作，帮助理解镜像和容器的基本使用流程。"
---
## docker实验

## 一、docker安装

### 1.准备条件

安装前置支持应用

```shell
sudo apt install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
```

添加docker官方源

```shell
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

添加apt源

```shell
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

更新源

```shell
sudo apt update
```

![image-20240922160213935](https://picture.dreambo.cn/2026/10/17/23/pDIkXzeHWsZ2lFQ-c80610e96fad8cf883f93a36108054f6.png)

### 2. 安装docker

```shell
sudo apt install docker-ce docker-ce-cli containerd.io
```

查看docker版本

```shell
sudo docker version
```

![image-20240922160645116](https://picture.dreambo.cn/2026/10/17/23/mRrTpI8WgYwfM6B-82a4ddb46d11d096155738425bfac932.png)

### 3.补充

允许非Root用户执行docker 命令

添加docker用户组（安装docker后自动安装）

```shell
sudo groupadd docker
```

添加用户到组中

```shell
sudo usermod -aG docker $USER
```
>[!Tip]
> 用户组改变不会立即生效，应重启使用或者使用命令
>
> ```shell
>newgrp docker
> ```

测试

```shell
#查看所有容器
docker ps -a
```

## 二、docker的镜像下载

### 1.下载jre 1.8镜像文件

运行此命令

```shell
docker pull registry.cn-hangzhou.aliyuncs.com/hhit/java8:min
```

![image-20240922162709405](https://picture.dreambo.cn/2026/10/17/23/rWwAfGo7pXOPKR1-f2d8f5cafb0b4a08a27e732df1eb1fec.png)

```shell
# 查看镜像文件
docker images
```
![image-20240922162731739](https://picture.dreambo.cn/2026/10/17/23/lbs1na7KUqTHAd3-934eec5e4de464e7555fb2356cc15041.png)

### 2.修改镜像的标记

执行以下命令

```shell
docker tag registry.cn-hangzhou.aliyuncs.com/hhit/java8:min
java8:1.0
```

运行结果

![image-20240922163053603](https://picture.dreambo.cn/2026/10/17/23/qdxw61LhT9bRk8e-469148b4e8799c15a71b4d3a164c25b2.png)

## 三、容器运行

运行容器

```shell
docker run -it java8:1.0
```

进入容器查看java版本和网络配置，由于ubuntu24已删除ipconfig，故使用新版的ipaddr

![image-20240922163340937](https://picture.dreambo.cn/2026/10/17/23/O17wTFzbEehCtWl-8d9ed555342fc8eae638847aa7a9c894.png)

查看当前运行的所有容器

开启第二个终端执行命令

```shell
docker ps
```

运行结果

![image-20240922163523373](https://picture.dreambo.cn/2026/10/17/23/lJfZNnEbYMqxmrL-d37bfbd4e1355d3464e64a71462e6e32.png)

退出当前docker

```shell
exit
```

挂载宿主机的⽬录到容器 /home/user --> /host 可以利⽤ host ⽬录共享数据

```shell
 docker run -it -v /home/user:/host java8:1.0
```

![image-20240922163823334](https://picture.dreambo.cn/2026/10/17/23/keBbS1g4LMxKl32-7b1d97499789f07f8bd3e4f090340b82.png)

查看当前所有的docker容器

```shell
docker ps -a
```

![image-20240922163937980](https://picture.dreambo.cn/2026/10/17/23/bnK2PtEQX6l831F-d523bbe2fed989cc7c467fb4a41337c3.png)

docker常用命令

```shell
docker start 351d17349b5f #启动一个已停止的容器
docker stop 351d17349b5f #停止容器
docker rm 351d17349b5f #删除容器
```

![image-20240922164247957](https://picture.dreambo.cn/2026/10/17/23/7exfyTnYLdlAWGz-ebd0fa9d9d0cb141a949304fd32a3fbc.png)

## 四、制作镜像

制作包含TCP服务器端的镜像

编译java文件

```shell
javac -source 1.8 -target 1.8 ./Downloads/TCPServer.java
```

创建Dockerfile

![image-20240922172547628](https://picture.dreambo.cn/2026/10/17/23/8kVTybhepUwHDtr-26dbf0793151adf94cc8b61aea7253f9.png)

运行

```shell
docker build -t tcpserver:1.0 .
```

运行结果

![image-20240922172639813](https://picture.dreambo.cn/2026/10/17/23/lAG2dsR9H6Ktc17-7efde82a49cf50486883c65b55541484.png)

## 四、运行自制镜像

启动tcpserver容器

```shell
docker run -it tcpserver:1.0
```

开启docker的端口映射

```shell
docker run -it -p 6789:6789 tcpserver:1.0
```

在容器内部查看容器ip地址

![image-20240922173457705](https://picture.dreambo.cn/2026/10/17/23/cbLS9saXMfneGQ4-700a178e7bb3ee6031615328c427c51f.png)

在容器内部运⾏TCP服务器端

```shell
cd /opt
java TCPserver
```

![image-20240922173837448](https://picture.dreambo.cn/2026/10/17/23/E3pNbQzVglX8R19-74bebbe9767c2421ae74a8296595ce85.png)

打开一个新的终端 在宿主机中运行TCP客户端

运行程序并发送信息

![image-20240922174408555](https://picture.dreambo.cn/2026/10/17/23/Onc7pvrfQ6Sksgh-6f42dc88ab08a34a79bb0365345a7404.png)

在docker中收到

![image-20240922174444711](https://picture.dreambo.cn/2026/10/17/23/rl4WiGSo5EJTtUx-b17a7fcb2e232d7e3102283135eec4b9.png)

## 六、练习

### 1.制作客户端的镜像

Dockerfile内容如下

![image-20240922175158376](https://picture.dreambo.cn/2026/10/17/23/HLmoWA9F5cdknue-a377528706f86e93d9c42b54b80d81ad.png)

建立镜像并查看

![image-20240922175402309](https://picture.dreambo.cn/2026/10/17/23/IKNw2qbMWr1FZLx-944b5f45ae182f526d72fe76fcd4ac52.png)

运行测试

client启动，由于需要监听6789端口，所以图方便将网络直接共享给client

```shell
docker run -it --network host tcpclient:1.0
```

server启动，将内部的6789端口映射到宿主机的6789端口上

```shell
docker run -it -p 6789:6789 tcpserver:1.0
```

启动运行部分

client端

![image-20240922181126678](https://picture.dreambo.cn/2026/10/17/23/wlXZvDgFk7qbfVe-f8b70eda0ed4d402e827e3e829e68e7d.png)

server端

![image-20240922181143780](https://picture.dreambo.cn/2026/10/17/23/j7sEmpL4degqZPV-4c1ce78d64d13e32b18c18a66f87d46d.png)

### 2.保存docker镜像

使用save命令保存镜像

```shell
docker save -o tcpserver.tar tcpserver:1.0
docker save -o tcpclient.tar tcpclient:1.0
```



![image-20240922181425990](https://picture.dreambo.cn/2026/10/17/23/5eXsFQZ3LiAzH6U-79b319781a6ee622f5ff70b7f0fb9786.png)

使用rmi删除docker镜像，方便之后导入

```shell
docker rmi tcpclient:1.0
docker rmi tcpserver:1.0 
```

![image-20240922182203429](https://picture.dreambo.cn/2026/10/17/23/PIpyJlkiK9MeqR1-e76513556b9d1d2fdb007817658d58d0.png)

使用load导入容器

![image-20240922182342756](https://picture.dreambo.cn/2026/10/17/23/1TbBvAPZJSkfLMx-205d40c7116195d16aa8064d4c974f56.png)

后续运行同练习1

### 3.上传至阿里云

创建个人镜像服务

![image-20240922184735336](https://picture.dreambo.cn/2026/10/17/23/s3L2v9qVUtHdDh5-548711c99e91570174563a9a4fecdfc1.png)

创建成功

![image-20240922185039810](https://picture.dreambo.cn/2026/10/17/23/PsGmRNp5tzWSfrU-275864b8fe7e737eaf2cc7d98c94f955.png)

在宿主机中登录阿里云

```shell
docker login --username=雨梦博雅宋 crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com
```

![image-20240922185234072](https://picture.dreambo.cn/2026/10/17/23/y5FPG9E8ROzIcaW-869a2503f574170e167bf3b4bc7cc9e0.png)

推送至云端

```shell
docker tag f409604e8c80 crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com/dreambo_study/docker_dreambo:1.0
docker push crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com/dreambo_study/docker_dreambo:1.0
```



![image-20240922185738387](https://picture.dreambo.cn/2026/10/17/23/O14rwPLz9EG6cib-4d6430364c55880d3d87d318699dba24.png)

阿里云后台

![image-20240922185858218](https://picture.dreambo.cn/2026/10/17/23/y4CHlnFdsZe8BKq-45b65676e45c637231ee4b0eee7f8e33.png)
