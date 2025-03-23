---
title: Hadoop安装与配置
date: 2022-04-01
updated: 2022-04-01
categories: 云计算与分布式 笔记
tags:
  - 云计算与分布式
  - 笔记
top: 1
---
# Hadoop安装与配置

## 一、安装Hadoop

### 1.1 修改网络配置

在添加完虚拟主机后发现其网络地址与我的vmware的设置不同于是修改虚拟机的网段为230

1. 运行ip addr指令显示地址

	```
	ip addr
	```

	<img src="https://s2.loli.net/2024/11/21/DNAyRGJpqg5fnlO.png" alt="image-20241121164556147" style="zoom:80%;" />

2. 切换到/etc/sysconfig/network-scripts目录下

   ```
   cd /etc/sysconfig/network-scripts
   ```

3. 然后编辑ifcfg-ens33用于修改IP地址

    ```
    IPADDR=192.168.230.100
    GATEWAY 192.168.230.2
    DNS1=192.168.230.2
    ```

    <img src="https://s2.loli.net/2024/11/21/u2WosB6SilF73dX.png" alt="image-20241121164136790" style="zoom:80%;" />

4. 重启网卡并ping百度检测网络是否修正完成

   ``` shell
   systemctl restart network 
   ping www.baidu.com
   ```

   <img src="https://s2.loli.net/2024/11/21/YlsrJ9Rbn2yaSte.png" alt="image-20241121165311962" style="zoom:80%;" />

### 1.2  模板虚拟机环境准备

1. 安装 epel-release

   ```shell 
    yum install -y net-tools  
   ```

   

   <img src="https://s2.loli.net/2024/11/21/whpjW2TO3iN4Kmf.png" alt="image-20241121170339182" style="zoom: 67%;" />

2. 安装 net-tools 

      但是无镜像可以，猜测与centos停止维护有关尝试更换为国内镜像源

      <img src="https://s2.loli.net/2024/11/21/smEIBxjvnLS6ucf.png" alt="image-20241121170818309" style="zoom:67%;" />

      1. 备份yum源文件

         ```shell
         sudo cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
         ```

         <img src="https://s2.loli.net/2024/11/21/8fopYOGIEzFxuba.png" alt="image-20241121171152800" style="zoom:67%;" />

      2. 下载国内源

         ```shell
         sudo wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
         ```

         <img src="https://s2.loli.net/2024/11/21/6aMrRiPvuV3dACH.png" alt="image-20241121171330227" style="zoom:67%;" />

      3. 尝试重新下载

         ```shell
         sudo yum install -y net-tools 
         ```

         <img src="https://s2.loli.net/2024/11/21/EaklNAjgV2Lm64c.png" alt="image-20241121171607547" style="zoom:67%;" />

3. 安装更新vim

      ```shell
      sudo yum install -y vim
      ```

      <img src="https://s2.loli.net/2024/11/21/tF2J9pzNxlmH3Kh.png" alt="image-20241121171817579" style="zoom:67%;" />

4. 关闭防火墙

   ```shell
   systemctl stop firewalld 
   systemctl disable firewalld.service
   ```

   <img src="https://s2.loli.net/2024/11/21/aGrKHqnxWVlfbYk.png" alt="image-20241121172101276" style="zoom:67%;" />

5. 创建atguigu用户，并修改atguigu用户的密码 

   ```shell
   [root@hadoop100 ~]# useradd atguigu 
   [root@hadoop100 ~]# passwd atguigu 
   ```

6. 配置atguigu用户具有root权限，方便后期加sudo执行root权限的命令

   ```
   vim /etc/sudoers
   ```

    修改/etc/sudoers 文件，在%wheel这行下面添加一行，如下所示：  

   ```
   ## Allow root to run any commands anywhere  root     ALL=(ALL)      ALL  ## Allows people in group wheel to run all commands  %wheel  ALL=(ALL)        ALL
   ```

7. 在/opt目录下创建文件夹，并修改所属主和所属组

      1. 在/opt目录下创建module、software文件夹 
      2. 修改module、software 文件夹的所有者和所属组均为atguigu用户
      3. 查看module、software 文件夹的所有者和所属组

8. 卸载虚拟机自带的JDK

      ```shell 
      root@hadoop100 ~]# rpm -qa | grep -i java | xargs -n1 rpm -e --nodeps 
      ```

9. 重启虚拟机

      ```shell
      reboot
      ```

### 1.3. 克隆虚拟机

1. 使用模板主机克隆出三台虚拟机

   ![image-20241126010546420](https://s2.loli.net/2024/11/26/9YQts4IRw3MGkAJ.png)

2. 逐一修改克隆机的IP

   ```shell
   vim /etc/sysconfig/network-scripts/ifcfg-ens33
   ```

   ```
   192.168.10.100 hadoop100 
   192.168.10.101 hadoop101 
   192.168.10.102 hadoop102 
   192.168.10.103 hadoop103 
   ```

3. 修改hosts文件，将刚才的ip添加进去。

   <img src="https://s2.loli.net/2024/11/26/2bcf8GDsowLUJyF.png" alt="image-20241126102045275" style="zoom: 67%;" />

### 1.4 安装JDK

1. 上传JDK压缩包

2. 将JDK安装包移动到/opt/software

   <img src="https://s2.loli.net/2024/11/26/ETY267oDfvgjaZB.png" alt="image-20241126102521039" style="zoom:67%;" />

3. 解压JDK到/opt/module

   <img src="https://s2.loli.net/2024/11/26/QK9VZLx624Fk3mM.png" alt="image-20241126102726887" style="zoom:67%;" />

4. 配置JDK环境变量

   <img src="https://s2.loli.net/2024/11/26/iMkZ3z8IFBhT54X.png" alt="image-20241126103252409" style="zoom:67%;" />

5. 测试java安装是否成功

   存在bug在配置完成java环境后依旧不能使用，经排查缺少glibc.i686，安装后即可使用

   ```shell
   sudo yum install glibc.i686
   ```
   
   <img src="https://s2.loli.net/2024/11/26/cRkufWG6dNwSqvV.png" alt="image-20241126105602863" style="zoom:67%;" />
   
   <img src="https://s2.loli.net/2024/11/26/7Rh4nps9irJUSgF.png" alt="image-20241126105758881" style="zoom:67%;" />

### 1.5 安装Hadoop

1. 下载导入

2. 解压安装文件到/opt/module下面

   <img src="https://s2.loli.net/2024/11/26/lKxUZ4SmETR2Bcs.png" alt="image-20241126113311516" style="zoom:67%;" />

3. 查看是否解压成功

   <img src="https://s2.loli.net/2024/11/26/LjcW3C94Yw6IXul.png" alt="image-20241126113331819" style="zoom:67%;" />

4. 将Hadoop添加到环境变量

   <img src="https://s2.loli.net/2024/11/26/Sab9P74JOHkGRYh.png" alt="image-20241126113552534" style="zoom:67%;" />

   保存好，退出生效

5. 查看是否生效

   <img src="https://s2.loli.net/2024/11/26/VhbgyrFn1kYCLIJ.png" alt="image-20241126113822603" style="zoom:67%;" />

## 二、 Hadoop运行模式 

### 2.1 本地运行（官方WordCount）

1. 创建在hadoop-3.4.1文件下面创建一个wcinput文件夹

   <img src="https://s2.loli.net/2024/11/26/TNFZvl2myqDkJcV.png" alt="image-20241126114502788" style="zoom:67%;" />

2. 在wcinput文件下创建一个word.txt文件 

   <img src="https://s2.loli.net/2024/11/26/35uObsVi9ATqUWJ.png" alt="image-20241126114621536" style="zoom:67%;" />

3. 编辑word.txt文件

   <img src="https://s2.loli.net/2024/11/26/q9pDU54rBYhxWmM.png" alt="image-20241126114551527" style="zoom:80%;" />

4. 执行程序

   <img src="https://s2.loli.net/2024/11/26/RzHogdrDw5PyJ8a.png" alt="image-20241126114817692" style="zoom:67%;" />

5. 查看结果

   <img src="https://s2.loli.net/2024/11/26/IwKSuyQJUibRhGT.png" alt="image-20241126114844284" style="zoom:67%;" />

### 2.2 完全分布式运行模式

#### 2.2.1 虚拟机准备

详见前面

#### 2.2.2 编写集群分发脚本xsync

1. scp 安全拷贝

   - 在hadoop101中将hadoop101中的jdk复制到hadoop102中

     hadoop101中

     <img src="https://s2.loli.net/2024/11/26/3DdA2hfitWvrIEN.png" alt="image-20241126115937138" style="zoom:67%;" />

     hadoop102中

     <img src="https://s2.loli.net/2024/11/26/GvaRr1oWOiyUzhZ.png" alt="image-20241126120011511" style="zoom:67%;" />

   - 在hadoop103中将hadoop101中的jdk复制到hadoop102中

     <img src="https://s2.loli.net/2024/11/27/hrgBsVGkTKltcIZ.png" alt="image-20241127103039317" style="zoom:67%;" />

   - 在hadoop102中将hadoop101中的jdk复制到hadoop102中

     <img src="https://s2.loli.net/2024/11/27/BvsFcDE8aSw9gWp.png" alt="image-20241127103200747" style="zoom:67%;" />

2. rsync 远程同步工具

   删除hadoop102中的`/opt/module/hadoop-3.4.1/wcinput`然后从hadoop101同步过去

   <img src="https://s2.loli.net/2024/11/27/nbrFIWDBh5HPRKs.png" alt="image-20241127103702167" style="zoom:67%;" />

3. xsync 集群分发脚本

 1.  脚本实现

     <img src="https://s2.loli.net/2024/11/27/2MEDTopf8ZbyvXn.png" alt="image-20241127113002037" style="zoom: 50%;" />

 2.  修改xsync的执行权限

     <img src="https://s2.loli.net/2024/11/27/vMAaeyJQxizmGDT.png" alt="image-20241127104857369" style="zoom:67%;" />

 3.  测试脚本

     <img src="https://s2.loli.net/2024/11/27/8gfz4jh6VRsJbed.png" alt="image-20241127104954400" style="zoom:67%;" />

 4.  将脚本复制到/bin中，以便于全局调用

     ![image-20241127105022139](https://s2.loli.net/2024/11/27/lxgAtpuUsEbNm9w.png)

 5.  同步环境变量

     <img src="https://s2.loli.net/2024/11/27/y6dxCnj9AJPsoqb.png" alt="image-20241127105229068" style="zoom:67%;" />

     其他虚拟机生效环境变量

     ```
     [atguigu@hadoop102 ~]$ source /etc/profile 
     [atguigu@hadoop103 ~]$ source /etc/profile
     ```

#### 2.2.3 SSH无密登录配置

首先生成公钥和私钥，然后将公钥copy到需要免密登录的机器上去。

<img src="https://s2.loli.net/2024/11/27/6JRVF7oOxn5wKq8.png" alt="image-20241127110416858" style="zoom: 50%;" />

#### 2.2.4 集群配置

1. 配置集群

   1. 核心配置文件

      配置`core-site.xml`

      ```shell
      cd /opt/module/hadoop-3.4.1/etc/hadoop
      vim core-site.xml
      ```

      内容如下

      <img src="https://s2.loli.net/2024/11/27/cVgl4Epz6Ooyvfw.png" alt="image-20241127112414396" style="zoom:67%;" />

   2. HDFS配置文件

      ```
      vim hdfs-site.xml
      ```

      <img src="https://s2.loli.net/2024/11/27/BZQd3icqfz1NYma.png" alt="image-20241127112345020" style="zoom:67%;" />

   3. YRN配置文件

      ```
      vim yarn-site.xml
      ```

      <img src="https://s2.loli.net/2024/11/27/zhLvUCpuRq3cG5t.png" alt="image-20241127112545875" style="zoom:67%;" />

   4. MapReduce配置文件

      ```
      vim mapred-site.xml 
      ```

      <img src="https://s2.loli.net/2024/11/27/LkhGKNoJgrlfCui.png" alt="image-20241127112704707" style="zoom:67%;" />

2. 在集群上分发配置好的Hadoop配置文件

   ```
   xsync /opt/module/hadoop-3.4.1/etc/hadoop/
   ```

   <img src="https://s2.loli.net/2024/11/27/HizTSWjgxhrseuV.png" alt="image-20241127113329302" style="zoom:67%;" />

3. 去102和103上查看文件分发情况 

   ```
   cat /opt/module/hadoop-3.4.1/etc/hadoop/core-site.xml
   ```

   <img src="https://s2.loli.net/2024/11/27/NA5F1mSPpdGVt8X.png" alt="image-20241127113542352" style="zoom:67%;" />

#### 2.2.5 群起集群

1. 配置workers

   编辑workers文件

   ```shell
   vim /opt/module/hadoop-3.4.1/etc/hadoop/workers 
   ```

   <img src="https://s2.loli.net/2024/11/27/6jImMLYqXEzaNov.png" alt="image-20241127162351966" style="zoom:67%;" />

   同步所以节点配置文件

   <img src="https://s2.loli.net/2024/11/27/m3OL4KbF7uTyRIY.png" alt="image-20241127113947617" style="zoom:67%;" />

2. 启动集群

   1. 格式化namenode

      <img src="https://s2.loli.net/2024/11/27/ylwHYQXMRmGiSAZ.png" alt="image-20241127114518836" style="zoom:67%;" />

   2. 启动HDFS

      <img src="https://s2.loli.net/2024/11/27/Pu3UX942Ty6fi1C.png" alt="image-20241127162104517" style="zoom:67%;" />

   3. 在配置了ResourceManager的节点（hadoop102）启动YARN

      ![image-20241127162321847](https://s2.loli.net/2024/11/27/AkT32CFx7janSei.png)

   4. Web端查看HDFS的NameNode 

      ![image-20241127162014274](https://s2.loli.net/2024/11/27/s4AgXIOrn8KuEzl.png)

   5. Web端查看YARN的ResourceManager 

      ![image-20241127162638339](https://s2.loli.net/2024/11/27/ORB1CjEwu2KLXVq.png)

3. 集群基本测试

   1. 上传文件到集群

      上传小文件

      <img src="https://s2.loli.net/2024/11/27/WAILhsvl8g35Hyc.png" alt="image-20241127163122006" style="zoom:67%;" />

      <img src="https://s2.loli.net/2024/11/27/mylhV29rL3AawWi.png" alt="image-20241127163133796" style="zoom:67%;" />

      上传大文件

      <img src="https://s2.loli.net/2024/11/27/jiNKIP6CdsEocbY.png" alt="image-20241127163224581" style="zoom:67%;" />

   2. 查看文件存放位置

      根据block ID找到HDFS文件存储路径

      <img src="https://s2.loli.net/2024/11/27/4lMnzarShtEJNTZ.png" alt="image-20241127164257087" style="zoom:50%;" />

      <img src="https://s2.loli.net/2024/11/27/dSfxhyiz5kEHRc2.png" alt="image-20241127164426175" style="zoom:67%;" />

      查看HDFS在磁盘存储文件内容 

      <img src="https://s2.loli.net/2024/11/27/ijdNmlIUanfEkAS.png" alt="image-20241127164528162" style="zoom:67%;" />

   3. 拼接

      <img src="https://s2.loli.net/2024/11/27/rH7YUFuLf8tEmbO.png" alt="image-20241127165002856" style="zoom:67%;" />

   4. 下载

      <img src="https://s2.loli.net/2024/11/27/pJOHbgr9iF61my7.png" alt="image-20241127164948471" style="zoom:67%;" />

   5. 执行wordcount程序

      <img src="https://s2.loli.net/2024/11/27/4tTLXgJiN1vdOeH.png" alt="image-20241127165143527" style="zoom:67%;" />

      

#### 2.3.6 配置历史服务器

1. 配置mapred-site.xml

   <img src="https://s2.loli.net/2024/11/27/BIbNtjeFgpw6JH5.png" alt="image-20241127165943675" style="zoom:67%;" />

2. 分发配置

   <img src="https://s2.loli.net/2024/11/27/Y4k6ESuL9m2PdvO.png" alt="image-20241127165655026" style="zoom:67%;" />

3. 在hadoop102启动历史服务器 

   <img src="https://s2.loli.net/2024/11/27/eXG3xvWgSbmDrpJ.png" alt="image-20241127170014769" style="zoom:67%;" />

4. 查看历史服务器是否启动

   <img src="https://s2.loli.net/2024/11/27/eXG3xvWgSbmDrpJ.png" alt="image-20241127170014769" style="zoom:67%;" />

5. 查看jobhistory

   ![image-20241127170156301](https://s2.loli.net/2024/11/27/Xde9xNkJyT8QcRw.png)

#### 2.3.7配置日志的聚集

1. 配置yarn-site.xml

   <img src="https://s2.loli.net/2024/11/27/1t5Ij8lHvohfayV.png" alt="image-20241127170819501" style="zoom:67%;" />

2. 分发配置

   <img src="https://s2.loli.net/2024/11/27/37GrDu6AZBTPwbo.png" alt="image-20241127170900909" style="zoom:67%;" />

3. 关闭NodeManager 、ResourceManager和HistoryServer

   ![image-20241127171006405](https://s2.loli.net/2024/11/27/xyI2v8RbEW15X7m.png)

   <img src="https://s2.loli.net/2024/11/27/e2zK1UCYi8PLfWO.png" alt="image-20241127170956869" style="zoom:80%;" />

4. 启动NodeManager 、ResourceManager和HistoryServer

   <img src="https://s2.loli.net/2024/11/27/3EoHU5DdaQiCBV1.png" alt="image-20241127171102143" style="zoom:80%;" />

   <img src="https://s2.loli.net/2024/11/27/Zg1zXrIc4F3YUql.png" alt="image-20241127171051761" style="zoom:67%;" />

5. 删除HDFS上已经存在的输出文件

   <img src="https://s2.loli.net/2024/11/27/IPhOZoDVvgNWCq7.png" alt="image-20241127171137350" style="zoom: 67%;" />

6. 执行WordCount程序

   <img src="https://s2.loli.net/2024/11/27/p4N9EOsRd85ljcz.png" alt="image-20241127172010387" style="zoom:67%;" />

7. 查看日志

   ![image-20241127171934685](https://s2.loli.net/2024/11/27/dbhfrIKcmDLjUPO.png)

![image-20241127172031765](https://s2.loli.net/2024/11/27/Tv5LZGbBcn9ywil.png)

#### 2.2.8 集群启动/停止方式总结 

1. 各个模块分开启动/停止（配置ssh是前提）常用  

   （1）整体启动/停止HDFS  `start-dfs.sh/stop-dfs.sh`  

   （2）整体启动/停止YARN  `start-yarn.sh/stop-yarn.sh`  

2. 各个服务组件逐一启动/停止  

   （1）分别启动/停止HDFS组件  `hdfs --daemon start/stop namenode/datanode/secondarynamenode`  （2）启动/停止YARN  `yarn --daemon start/stop  resourcemanager/nodemanager`

#### 2.2.9 编写Hadoop集群常用脚本 

1. Hadoop集群启停脚本（包含HDFS，Yarn，Historyserver）：`myhadoop.sh `

<img src="https://s2.loli.net/2024/11/27/SHEct2md98KBsW6.png" alt="image-20241127172753564" style="zoom:67%;" />

​	保存后退出赋予脚本执行权限

![image-20241127172858582](https://s2.loli.net/2025/03/24/BD5I4pVnivZGCx8.png)

2. 查看三台服务器Java进程脚本：jpsall

   <img src="https://s2.loli.net/2024/11/27/X9qj7ORBIiWFoU1.png" alt="image-20241127173114945" style="zoom:80%;" />

   保存后退出赋予脚本执行权限

   ![image-20241127173159592](https://s2.loli.net/2024/11/27/8toSCuTQasgXryO.png)

3. 分发/home/atguigu/bin目录，保证自定义脚本在三台机器上都可以使用 

   <img src="https://s2.loli.net/2024/11/27/r2vOSZ8uIgBFVoU.png" alt="image-20241127173234210" style="zoom:80%;" />

#### 2.2.10 常用端口号说明

| 端口名称                  | Hadoop2.x   | Hadoop3.x        |
| ------------------------- | ----------- | ---------------- |
| NameNode内部通信端口      | 8020 / 9000 | 8020 / 9000/9820 |
| NameNode HTTP UI          | 50070       | 9870             |
| MapReduce查看执行任务端口 | 8088        | 8088             |
| 历史服务器通信端口        | 19888       | 19888            |

#### 2.2.11 集群时间同步

1. 时间服务器配置（必须root用户） 

   1. 查看所有节点ntpd服务状态和开机自启动状态

      <img src="https://s2.loli.net/2024/11/28/Uv4sifk8tp5rHx1.png" alt="image-20241128102831051" style="zoom:67%;" />

   2. 修改hadoop101的ntp.conf 配置文件

      编辑文件` sudo vim /etc/ntp.conf`

      <img src="https://s2.loli.net/2025/03/24/v3byKGxMe7QlN1W.png" alt="image-20241128112425376" style="zoom:67%;" />

   3. 修改hadoop101的/etc/sysconfig/ntpd 文件

      编辑文件` sudo vim /etc/sysconfig/ntpd`

      增加内容如下（让硬件时间与系统时间一起同步）

      ![image-20241128103551933](https://s2.loli.net/2024/11/28/IZkha4En13X2W6r.png)
   
   4. 重新启动ntpd服务
   
      使用指令`sudo systemctl start ntpd`
   
   5. 设置ntpd服务开机启动 
   
      使用指令`sudo systemctl enable ntpd`
   
      <img src="https://s2.loli.net/2024/11/28/rlicas9tYjEmqGz.png" alt="image-20241128103839750" style="zoom:67%;" />
   
      

2. 其他机器配置（必须root用户）

   1. 关闭所有节点上ntp服务和自启动

      ```
      sudo systemctl stop ntpd 
      sudo systemctl disable ntpd 
      sudo systemctl stop ntpd 
      sudo systemctl disable ntpd 
      ```

      <img src="https://s2.loli.net/2024/11/28/XUEQBby1fSkc73V.png" alt="image-20241128104249986" style="zoom:80%;" />

   2. 在其他机器配置1分钟与时间服务器同步一次 

      编写定时文件`sudo crontab -e `

      <img src="https://s2.loli.net/2024/11/28/8piRGCqPgBJ3LYf.png" alt="image-20241128104631202" style="zoom: 67%;" />

   3. 修改任意机器时间 

      <img src="https://s2.loli.net/2024/11/28/gZUhp54MjeLJIit.png" alt="image-20241128104723044" style="zoom:80%;" />

   4. 1分钟后查看机器是否与时间服务器同步

      <img src="https://s2.loli.net/2024/11/28/NFQBkr8vzTyiqJP.png" alt="image-20241128104932962" style="zoom:80%;" />
