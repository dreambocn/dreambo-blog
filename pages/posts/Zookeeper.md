---
title: Zookeeper实验
date: 2022-04-01
updated: 2022-04-01
categories: 云计算与分布式 笔记
tags:
  - 云计算与分布式
  - 笔记
top: 1
---
# Zookeeper实验

姓名：宋源博 	班级：大数据2201 	学号：2211650123

## 一、Zookeeper安装

### 1.1 本地模式安装部署

#### 1.安装前准备

1. 安装jdk

2. 拷贝zookeeper到linux环境

3. 解压到指定目录

   ![image-20241211132443342](https://s2.loli.net/2024/12/11/uvLkyghKdIH3sil.png)

#### 2. 配置修改

1. 将`/opt/module/zookeeper-3.4.6/conf` 这个路径下的 zoo_sample.cfg 修改为 zoo.cfg；

```
[atguigu@hadoop101 conf]$ mv zoo_sample.cfg zoo.cfg
```

2. 打开zoo.cfg文件，修改dataDir路径：

   ![image-20241211132950936](https://s2.loli.net/2024/12/11/Zc9jdVULo6xRs1f.png)

3. 在/opt/module/zookeeper-3.4.6/这个目录上创建 zkData 文件夹 

   ![image-20241211133040260](https://s2.loli.net/2024/12/11/coiHfrZAFyWbkXI.png)

#### 3. 操作Zookeeper

1. 启动Zookeeper

   ![image-20241211133239241](https://s2.loli.net/2024/12/11/y1Sg5mRYFtphLuz.png)

2. 查看进程是否启动

   ![image-20241211133242502](https://s2.loli.net/2024/12/11/y1Sg5mRYFtphLuz.png)

3. 查看状态： 

   ![image-20241211133329640](https://s2.loli.net/2024/12/11/aFnHqWUdLOu1ReJ.png)

4. 启动客户端：

   ![image-20241211133350733](https://s2.loli.net/2024/12/11/i6ZySvDAwHbzTep.png)

5. 退出客户端：

   ![image-20241211133405292](https://s2.loli.net/2024/12/11/JkBjEGVizRI6YM4.png)

6. 停止Zookeeper

   ![image-20241211133433477](https://s2.loli.net/2024/12/11/uDYFd6n31c7xOqw.png)

## 二、Zookeeper实战

###  2.1 分布式安装部署

1. 集群部署

2. 解压安装

   同步

   ![image-20241211161054480](https://s2.loli.net/2024/12/11/A1vPe3nNaVtRhLI.png)

3. 配置服务器编号 

   在/opt/module/zookeeper-3.4.6/zkData目录下创建一个 myid 的文件 

   编辑myid文件，在文件中添加与server对应的编号

   ![image-20241211161601016](https://s2.loli.net/2024/12/11/p9LrhDk1XFtOsin.png)

   同步到其他机器

   修改其他机器的编号

   ![image-20241211161216472](https://s2.loli.net/2024/12/11/ATO9xlZeJ4iVUNo.png)

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

   ![image-20241211162045169](https://s2.loli.net/2024/12/11/JOy5NoDVQkEcIam.png)

   同步zoo.cfg配置文件 

![image-20241211162116606](https://s2.loli.net/2024/12/11/I9y6RNmDKA23eSs.png)

5. 集群操作 

   分别启动Zookeeper 

   ![image-20241211162618853](https://s2.loli.net/2024/12/11/BvnrPs8FX954wo7.png)

   查看状态

   ![image-20241211162838659](https://s2.loli.net/2024/12/11/dbvxtZFPYAr87oc.png)

### 2.2 客户端命令行操作

1. 启动客户端

   ![image-20241211163604622](https://s2.loli.net/2024/12/11/Wt2TQ6YSLu9Nelx.png)

2. 显示所有操作命令 

   ![image-20241211163743460](https://s2.loli.net/2024/12/11/cZru4KkIXzaSpl8.png)

3. 查看当前znode中所包含的内容

   ![image-20241211163758784](https://s2.loli.net/2024/12/11/OLh6Ykq4cTMKQUx.png)

4. 查看当前节点详细数据

   ![image-20241211163813399](https://s2.loli.net/2024/12/11/aUO28ysE4AmV5Sx.png)

5. 分别创建2个普通节点

   ![image-20241211164544369](https://s2.loli.net/2024/12/11/qTpJfoI4Czxgbsl.png)

6. 获得节点的值 

   ![image-20241211164608649](https://s2.loli.net/2024/12/11/agdnHlDMEmWF19o.png)

7. 创建短暂节点

   使用`-e`参数创建短暂节点，当前客户端可见

   ![image-20241211164734238](https://s2.loli.net/2024/12/11/xKApZM8F6qCRohz.png)

   重启客户端

   ![image-20241211164852236](https://s2.loli.net/2024/12/11/Al1GPB8nED5kmV4.png)

   再次查看，发现短暂节点已被删除

   ![image-20241211165008746](https://s2.loli.net/2024/12/11/nLoYt4Ucml2ifNz.png)

8. 创建带序号的节点

   先创建一个普通的根节点/songyuanbo/normal

   ![image-20241211165713929](https://s2.loli.net/2024/12/11/hMxmafzO4wEPYDV.png)

   创建带序号的节点

   ![image-20241211165834118](https://s2.loli.net/2024/12/11/xNE1XQakp8vwZYT.png)

9. 修改节点数据值

   ![image-20241211165956401](C:\Users\DreamBo\AppData\Roaming\Typora\typora-user-images\image-20241211165956401.png)

10. 节点的值变化监听 

    在hadoop103上注册监听/songyuanbo节点数据的变化

    ![image-20241211170534329](https://s2.loli.net/2024/12/11/UZvVmYszDfk7AcH.png)

    在hadoop102上修改/songyuanbo节点的数据

    ![image-20241211170547249](https://s2.loli.net/2024/12/11/WxfQyk5MEwauTzO.png)

    观察hadoop收到的监听

    ![image-20241211170555718](https://s2.loli.net/2024/12/11/IP7k2p51qJAv9g3.png)

11. 节点的子节点变化监听（路径变化） 

    在hadoop103主机上注册监听/songyuanbo节点的子节点变化

    ![image-20241211170707062](https://s2.loli.net/2024/12/11/pWBHVymRSG9bNEU.png)

    在hadoop102主机/songyuanbo节点上创建子节点

    ![image-20241211170812048](https://s2.loli.net/2024/12/11/i3qkRLd6yzMoeYH.png)

    观察hadoop103主机收到子节点变化的监听

    ![image-20241211170823862](https://s2.loli.net/2024/12/11/cn6VAiG3gfTJC89.png)

12. 删除节点

    ![image-20241211170858038](https://s2.loli.net/2024/12/11/2A8glIqbXx4JTky.png)

13. 递归删除节点

    ![image-20241211170924338](https://s2.loli.net/2024/12/11/4BHWFIwRQDeEdfP.png)

14. 查看节点状态

    ![image-20241211170940298](https://s2.loli.net/2024/12/11/hixS4WsHDVPz8we.png)
