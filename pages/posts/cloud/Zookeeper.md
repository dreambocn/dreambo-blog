---
title: Zookeeper实验
date: 2022-04-01
updated: 2022-04-01
categories:
  - 云计算与分布式
  - 笔记
tags:
  - Zookeeper
description: "记录 ZooKeeper 本地与分布式部署实验，涵盖运行环境、配置修改、集群启动和客户端命令行操作的实践步骤。"
---
## Zookeeper实验

姓名：宋源博 	班级：大数据2201 	学号：2211650123

## 一、Zookeeper安装

### 1.1 本地模式安装部署

#### 1.安装前准备

1. 安装jdk

2. 拷贝zookeeper到linux环境

3. 解压到指定目录

   ![image-20241211132443342](https://picture.dreambo.cn/2026/10/17/23/uvLkyghKdIH3sil-821ec560d6278d351634baba3e09bb62.png)

#### 2. 配置修改

1. 将`/opt/module/zookeeper-3.4.6/conf` 这个路径下的 zoo_sample.cfg 修改为 zoo.cfg；

```
[atguigu@hadoop101 conf]$ mv zoo_sample.cfg zoo.cfg
```

2. 打开zoo.cfg文件，修改dataDir路径：

   ![image-20241211132950936](https://picture.dreambo.cn/2026/10/17/23/Zc9jdVULo6xRs1f-afd5121328ee451a3175a7eebb55bc64.png)

3. 在/opt/module/zookeeper-3.4.6/这个目录上创建 zkData 文件夹 

   ![image-20241211133040260](https://picture.dreambo.cn/2026/10/17/23/coiHfrZAFyWbkXI-aec832126e0d5a04859af2c55e538246.png)

#### 3. 操作Zookeeper

1. 启动Zookeeper

   ![image-20241211133239241](https://picture.dreambo.cn/2026/10/17/23/y1Sg5mRYFtphLuz-e45bf0b139dc63a61673de38323a2e2d.png)

2. 查看进程是否启动

   ![image-20241211133242502](https://picture.dreambo.cn/2026/10/17/23/y1Sg5mRYFtphLuz-e45bf0b139dc63a61673de38323a2e2d.png)

3. 查看状态： 

   ![image-20241211133329640](https://picture.dreambo.cn/2026/10/17/23/aFnHqWUdLOu1ReJ-806759cc12b7557c8a037fde6455f9a0.png)

4. 启动客户端：

   ![image-20241211133350733](https://picture.dreambo.cn/2026/10/17/23/i6ZySvDAwHbzTep-95ca784676c4c4bfc93c83e2d1d4209f.png)

5. 退出客户端：

   ![image-20241211133405292](https://picture.dreambo.cn/2026/10/17/23/JkBjEGVizRI6YM4-f80420885ef1e92d8e016a9f6e08c628.png)

6. 停止Zookeeper

   ![image-20241211133433477](https://picture.dreambo.cn/2026/10/17/23/uDYFd6n31c7xOqw-e1e33dcc614651139f7c2c27213bb2c6.png)

## 二、Zookeeper实战

###  2.1 分布式安装部署

1. 集群部署

2. 解压安装

   同步

   ![image-20241211161054480](https://picture.dreambo.cn/2026/10/17/23/A1vPe3nNaVtRhLI-957d68b7a133b38c1fe2011b7f087469.png)

3. 配置服务器编号 

   在/opt/module/zookeeper-3.4.6/zkData目录下创建一个 myid 的文件 

   编辑myid文件，在文件中添加与server对应的编号

   ![image-20241211161601016](https://picture.dreambo.cn/2026/10/17/23/p9LrhDk1XFtOsin-9ab2d8e823c41c942e1abb5c1757d5a7.png)

   同步到其他机器

   修改其他机器的编号

   ![image-20241211161216472](https://picture.dreambo.cn/2026/10/17/23/ATO9xlZeJ4iVUNo-869ebba17d568b00ff8a73f32d43e0dd.png)

4. 配置zoo.cfg文件

   重命名/opt/module/zookeeper-3.4.6/conf 这个目录下的 zoo_sample.cfg 为 zoo.cfg 

   ` mv zoo_sample.cfg zoo.cfg`

   打开zoo.cfg文件

    `vim zoo.cfg `

   修改数据存储路径配置 

   `dataDir=/opt/module/zookeeper-3.4.6/zkData`

   增加如下配置 

   ```
   #######################cluster##########################  
   server.1=hadoop101:2888:3888  
   server.2=hadoop102:2888:3888  
   server.3=hadoop103:2888:3888
   ```

   ![image-20241211162045169](https://picture.dreambo.cn/2026/10/17/23/JOy5NoDVQkEcIam-6e18dc237efe117348b1f4e8f4099f21.png)

   同步zoo.cfg配置文件 

![image-20241211162116606](https://picture.dreambo.cn/2026/10/17/23/I9y6RNmDKA23eSs-af72bdfaaa2f94caa905edee53d4bb39.png)

5. 集群操作 

   分别启动Zookeeper 

   ![image-20241211162618853](https://picture.dreambo.cn/2026/10/17/23/BvnrPs8FX954wo7-85d624686d74aff2ece02a7fd3d187f5.png)

   查看状态

   ![image-20241211162838659](https://picture.dreambo.cn/2026/10/17/23/dbvxtZFPYAr87oc-8a3bded77a0f7d09d9f53280110f9d12.png)

### 2.2 客户端命令行操作

1. 启动客户端

   ![image-20241211163604622](https://picture.dreambo.cn/2026/10/17/23/Wt2TQ6YSLu9Nelx-60700d5150d3a5a88678859a94733661.png)

2. 显示所有操作命令 

   ![image-20241211163743460](https://picture.dreambo.cn/2026/10/17/23/cZru4KkIXzaSpl8-d62a6e553671ca1955e1dd67c9af2f44.png)

3. 查看当前znode中所包含的内容

   ![image-20241211163758784](https://picture.dreambo.cn/2026/10/17/23/OLh6Ykq4cTMKQUx-0b363d974ba4a48800a3a03e16c4daf0.png)

4. 查看当前节点详细数据

   ![image-20241211163813399](https://picture.dreambo.cn/2026/10/17/23/aUO28ysE4AmV5Sx-3f412cf754dc7a5a21b088c18df723c9.png)

5. 分别创建2个普通节点

   ![image-20241211164544369](https://picture.dreambo.cn/2026/10/17/23/qTpJfoI4Czxgbsl-29904c14ea4e681776f14ded908f2c35.png)

6. 获得节点的值 

   ![image-20241211164608649](https://picture.dreambo.cn/2026/10/17/23/agdnHlDMEmWF19o-d3249c51d42b60870fb014831aa783e9.png)

7. 创建短暂节点

   使用`-e`参数创建短暂节点，当前客户端可见

   ![image-20241211164734238](https://picture.dreambo.cn/2026/10/17/23/xKApZM8F6qCRohz-eda6124f9ca3f965e04477349aec6aab.png)

   重启客户端

   ![image-20241211164852236](https://picture.dreambo.cn/2026/10/17/23/Al1GPB8nED5kmV4-1609d04cb061bef75708172d91752eb5.png)

   再次查看，发现短暂节点已被删除

   ![image-20241211165008746](https://picture.dreambo.cn/2026/10/17/23/nLoYt4Ucml2ifNz-85ae5f8c6c2190f2f7921900f4f89430.png)

8. 创建带序号的节点

   先创建一个普通的根节点/songyuanbo/normal

   ![image-20241211165713929](https://picture.dreambo.cn/2026/10/17/23/hMxmafzO4wEPYDV-a96fd528e572f60ff910159084f92b6c.png)

   创建带序号的节点

   ![image-20241211165834118](https://picture.dreambo.cn/2026/10/17/23/xNE1XQakp8vwZYT-51eff71a831f61ed0a187ccaefb14ce2.png)

9. 修改节点数据值

   ![image-20241211165956401](https://picture.dreambo.cn/2026/10/17/23/drwz7yPJcZuWake-d1a2792e5efaf499dccc9aa57326b1ad.png)

10. 节点的值变化监听 

    在hadoop103上注册监听/songyuanbo节点数据的变化

    ![image-20241211170534329](https://picture.dreambo.cn/2026/10/17/23/UZvVmYszDfk7AcH-07af7e324b8be909e8634eeff2cb8713.png)

    在hadoop102上修改/songyuanbo节点的数据

    ![image-20241211170547249](https://picture.dreambo.cn/2026/10/17/23/WxfQyk5MEwauTzO-1f0d2395e753543a7b741ae06e51c6fd.png)

    观察hadoop收到的监听

    ![image-20241211170555718](https://picture.dreambo.cn/2026/10/17/23/IP7k2p51qJAv9g3-01e466534479a70f7c8e9f940d02c139.png)

11. 节点的子节点变化监听（路径变化） 

    在hadoop103主机上注册监听/songyuanbo节点的子节点变化

    ![image-20241211170707062](https://picture.dreambo.cn/2026/10/17/23/pWBHVymRSG9bNEU-5f5bfce7ae8d1bc65d4a4c2e295db418.png)

    在hadoop102主机/songyuanbo节点上创建子节点

    ![image-20241211170812048](https://picture.dreambo.cn/2026/10/17/23/i3qkRLd6yzMoeYH-1e13183681e83127c52b93635f4a7c8e.png)

    观察hadoop103主机收到子节点变化的监听

    ![image-20241211170823862](https://picture.dreambo.cn/2026/10/17/23/cn6VAiG3gfTJC89-556b227adaffde5d3b0f05840d06edbb.png)

12. 删除节点

    ![image-20241211170858038](https://picture.dreambo.cn/2026/10/17/23/2A8glIqbXx4JTky-3ddc8bfefd3c41f9933c9890f7884d58.png)

13. 递归删除节点

    ![image-20241211170924338](https://picture.dreambo.cn/2026/10/17/23/4BHWFIwRQDeEdfP-37268c6f84d489862070561d86787bda.png)

14. 查看节点状态

    ![image-20241211170940298](https://picture.dreambo.cn/2026/10/17/23/hixS4WsHDVPz8we-609cf62d0e0dff46d38561303bcfda38.png)
