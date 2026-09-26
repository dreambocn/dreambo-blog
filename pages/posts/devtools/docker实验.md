---
title: docker实验
date: 2022-04-01
updated: 2022-04-01
categories:
  - 开发工具
  - 工具推荐
tags:
  - Docker
---
# docker实验

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

![image-20240922160213935](https://s2.loli.net/2024/09/22/pDIkXzeHWsZ2lFQ.png)

### 2. 安装docker

```shell
sudo apt install docker-ce docker-ce-cli containerd.io
```

查看docker版本

```shell
sudo docker version
```

![image-20240922160645116](https://s2.loli.net/2024/09/22/mRrTpI8WgYwfM6B.png)

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

![image-20240922162709405](https://s2.loli.net/2024/09/22/rWwAfGo7pXOPKR1.png)

```shell
# 查看镜像文件
docker images
```
![image-20240922162731739](https://s2.loli.net/2024/09/22/lbs1na7KUqTHAd3.png)

### 2.修改镜像的标记

执行以下命令

```shell
docker tag registry.cn-hangzhou.aliyuncs.com/hhit/java8:min
java8:1.0
```

运行结果

![image-20240922163053603](https://s2.loli.net/2024/09/22/qdxw61LhT9bRk8e.png)

## 三、容器运行

运行容器

```shell
docker run -it java8:1.0
```

进入容器查看java版本和网络配置，由于ubuntu24已删除ipconfig，故使用新版的ipaddr

![image-20240922163340937](https://s2.loli.net/2024/09/22/O17wTFzbEehCtWl.png)

查看当前运行的所有容器

开启第二个终端执行命令

```shell
docker ps
```

运行结果

![image-20240922163523373](https://s2.loli.net/2024/09/22/lJfZNnEbYMqxmrL.png)

退出当前docker

```shell
exit
```

挂载宿主机的⽬录到容器 /home/user --> /host 可以利⽤ host ⽬录共享数据

```shell
 docker run -it -v /home/user:/host java8:1.0
```

![image-20240922163823334](https://s2.loli.net/2024/09/22/keBbS1g4LMxKl32.png)

查看当前所有的docker容器

```shell
docker ps -a
```

![image-20240922163937980](https://s2.loli.net/2024/09/22/bnK2PtEQX6l831F.png)

docker常用命令

```shell
docker start 351d17349b5f #启动一个已停止的容器
docker stop 351d17349b5f #停止容器
docker rm 351d17349b5f #删除容器
```

![image-20240922164247957](https://s2.loli.net/2024/09/22/7exfyTnYLdlAWGz.png)

## 四、制作镜像

制作包含TCP服务器端的镜像

编译java文件

```shell
javac -source 1.8 -target 1.8 ./Downloads/TCPServer.java
```

创建Dockerfile

![image-20240922172547628](https://s2.loli.net/2024/09/22/8kVTybhepUwHDtr.png)

运行

```shell
docker build -t tcpserver:1.0 .
```

运行结果

![image-20240922172639813](https://s2.loli.net/2024/09/22/lAG2dsR9H6Ktc17.png)

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

![image-20240922173457705](https://s2.loli.net/2024/09/22/cbLS9saXMfneGQ4.png)

在容器内部运⾏TCP服务器端

```shell
cd /opt
java TCPserver
```

![image-20240922173837448](https://s2.loli.net/2024/09/22/E3pNbQzVglX8R19.png)

打开一个新的终端 在宿主机中运行TCP客户端

运行程序并发送信息

![image-20240922174408555](https://s2.loli.net/2024/09/22/Onc7pvrfQ6Sksgh.png)

在docker中收到

![image-20240922174444711](https://s2.loli.net/2024/09/22/rl4WiGSo5EJTtUx.png)

## 六、练习

### 1.制作客户端的镜像

Dockerfile内容如下

![image-20240922175158376](https://s2.loli.net/2024/09/22/HLmoWA9F5cdknue.png)

建立镜像并查看

![image-20240922175402309](https://s2.loli.net/2024/09/22/IKNw2qbMWr1FZLx.png)

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

![image-20240922181126678](https://s2.loli.net/2024/09/22/wlXZvDgFk7qbfVe.png)

server端

![image-20240922181143780](https://s2.loli.net/2024/09/22/j7sEmpL4degqZPV.png)

### 2.保存docker镜像

使用save命令保存镜像

```shell
docker save -o tcpserver.tar tcpserver:1.0
docker save -o tcpclient.tar tcpclient:1.0
```



![image-20240922181425990](https://s2.loli.net/2024/09/22/5eXsFQZ3LiAzH6U.png)

使用rmi删除docker镜像，方便之后导入

```shell
docker rmi tcpclient:1.0
docker rmi tcpserver:1.0 
```

![image-20240922182203429](https://s2.loli.net/2024/09/22/PIpyJlkiK9MeqR1.png)

使用load导入容器

![image-20240922182342756](https://s2.loli.net/2024/09/22/1TbBvAPZJSkfLMx.png)

后续运行同练习1

### 3.上传至阿里云

创建个人镜像服务

![image-20240922184735336](https://s2.loli.net/2024/09/22/s3L2v9qVUtHdDh5.png)

创建成功

![image-20240922185039810](https://s2.loli.net/2024/09/22/PsGmRNp5tzWSfrU.png)

在宿主机中登录阿里云

```shell
docker login --username=雨梦博雅宋 crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com
```

![image-20240922185234072](https://s2.loli.net/2024/09/22/y5FPG9E8ROzIcaW.png)

推送至云端

```shell
docker tag f409604e8c80 crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com/dreambo_study/docker_dreambo:1.0
docker push crpi-agzizsnyuwuno8ds.cn-hangzhou.personal.cr.aliyuncs.com/dreambo_study/docker_dreambo:1.0
```



![image-20240922185738387](https://s2.loli.net/2024/09/22/O14rwPLz9EG6cib.png)

阿里云后台

![image-20240922185858218](https://s2.loli.net/2024/09/22/y4CHlnFdsZe8BKq.png)
