---
title: Hadoop安装与配置
date: 2022-04-01
updated: 2022-04-01
categories:
  - 云计算与分布式
  - 笔记
tags:
  - Hadoop
  - 部署
description: "整理 Hadoop 的安装与运行配置步骤，介绍环境准备、文件配置和不同运行模式，为 HDFS 与分布式计算实验搭建基础。"
---
## Hadoop安装与配置

## 一、安装Hadoop

### 1.1 修改网络配置

在添加完虚拟主机后发现其网络地址与我的vmware的设置不同于是修改虚拟机的网段为230

1. 运行ip addr指令显示地址

	```
	ip addr
	```

	<img src="https://picture.dreambo.cn/2026/10/17/23/DNAyRGJpqg5fnlO-b7bd60c11ff55566f7793ba5f8dea6d1.png" alt="image-20241121164556147" style="zoom:80%;" />

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

    <img src="https://picture.dreambo.cn/2026/10/17/23/u2WosB6SilF73dX-9dfe661bddf55cec78dfa7400838d46d.png" alt="image-20241121164136790" style="zoom:80%;" />

4. 重启网卡并ping百度检测网络是否修正完成

   ``` shell
   systemctl restart network 
   ping www.baidu.com
   ```

   <img src="https://picture.dreambo.cn/2026/10/17/23/YlsrJ9Rbn2yaSte-85245cabe47f30b9bcf86c35e5549665.png" alt="image-20241121165311962" style="zoom:80%;" />

### 1.2  模板虚拟机环境准备

1. 安装 epel-release

   ```shell 
    yum install -y net-tools  
   ```

   

   <img src="https://picture.dreambo.cn/2026/10/17/23/whpjW2TO3iN4Kmf-fbefc3b4c550b85256191a814ded30a0.png" alt="image-20241121170339182" style="zoom: 67%;" />

2. 安装 net-tools 

      但是无镜像可以，猜测与centos停止维护有关尝试更换为国内镜像源

      <img src="https://picture.dreambo.cn/2026/10/17/23/smEIBxjvnLS6ucf-98d1f2805d311f3f6652774728878e3a.png" alt="image-20241121170818309" style="zoom:67%;" />

      1. 备份yum源文件

         ```shell
         sudo cp /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak
         ```

         <img src="https://picture.dreambo.cn/2026/10/17/23/8fopYOGIEzFxuba-324da81613c8ac1b7eaec8778c1da752.png" alt="image-20241121171152800" style="zoom:67%;" />

      2. 下载国内源

         ```shell
         sudo wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
         ```

         <img src="https://picture.dreambo.cn/2026/10/17/23/6aMrRiPvuV3dACH-b88e1113b52314d829cc7ca50797470d.png" alt="image-20241121171330227" style="zoom:67%;" />

      3. 尝试重新下载

         ```shell
         sudo yum install -y net-tools 
         ```

         <img src="https://picture.dreambo.cn/2026/10/17/23/EaklNAjgV2Lm64c-1b38b112501b6c65cb92b361c515ab9a.png" alt="image-20241121171607547" style="zoom:67%;" />

3. 安装更新vim

      ```shell
      sudo yum install -y vim
      ```

      <img src="https://picture.dreambo.cn/2026/10/17/23/tF2J9pzNxlmH3Kh-e8b08e34464938fe7527926d68ac1742.png" alt="image-20241121171817579" style="zoom:67%;" />

4. 关闭防火墙

   ```shell
   systemctl stop firewalld 
   systemctl disable firewalld.service
   ```

   <img src="https://picture.dreambo.cn/2026/10/17/23/aGrKHqnxWVlfbYk-b7580da4182f23049eaa0b56d52b552a.png" alt="image-20241121172101276" style="zoom:67%;" />

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

   ![image-20241126010546420](https://picture.dreambo.cn/2026/10/17/23/9YQts4IRw3MGkAJ-200dbb081e58ae2b2051c80621c0bddb.png)

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

   <img src="https://picture.dreambo.cn/2026/10/17/23/2bcf8GDsowLUJyF-6817a953896355a827b6588f680eba7c.png" alt="image-20241126102045275" style="zoom: 67%;" />

### 1.4 安装JDK

1. 上传JDK压缩包

2. 将JDK安装包移动到/opt/software

   <img src="https://picture.dreambo.cn/2026/10/17/23/ETY267oDfvgjaZB-1fe2fc03a3dca853c5d2377a27f5ccd5.png" alt="image-20241126102521039" style="zoom:67%;" />

3. 解压JDK到/opt/module

   <img src="https://picture.dreambo.cn/2026/10/17/23/QK9VZLx624Fk3mM-166fa319450d3dbeae6ac3ff1e506023.png" alt="image-20241126102726887" style="zoom:67%;" />

4. 配置JDK环境变量

   <img src="https://picture.dreambo.cn/2026/10/17/23/iMkZ3z8IFBhT54X-1a652012954c97cf60e788159188c6f1.png" alt="image-20241126103252409" style="zoom:67%;" />

5. 测试java安装是否成功

   存在bug在配置完成java环境后依旧不能使用，经排查缺少glibc.i686，安装后即可使用

   ```shell
   sudo yum install glibc.i686
   ```
   
   <img src="https://picture.dreambo.cn/2026/10/17/23/cRkufWG6dNwSqvV-6532e2869409f78f62fa5c5542e34e99.png" alt="image-20241126105602863" style="zoom:67%;" />
   
   <img src="https://picture.dreambo.cn/2026/10/17/23/7Rh4nps9irJUSgF-e9d724851a38c1f7ec7414e261ae85a4.png" alt="image-20241126105758881" style="zoom:67%;" />

### 1.5 安装Hadoop

1. 下载导入

2. 解压安装文件到/opt/module下面

   <img src="https://picture.dreambo.cn/2026/10/17/23/lKxUZ4SmETR2Bcs-c95285f8aae0aec050ca9c6d7fdfeb0e.png" alt="image-20241126113311516" style="zoom:67%;" />

3. 查看是否解压成功

   <img src="https://picture.dreambo.cn/2026/10/17/23/LjcW3C94Yw6IXul-7be0e51859e35ded3b4e676f7f66ae92.png" alt="image-20241126113331819" style="zoom:67%;" />

4. 将Hadoop添加到环境变量

   <img src="https://picture.dreambo.cn/2026/10/17/23/Sab9P74JOHkGRYh-38b280974a650d58ec502547c40e060e.png" alt="image-20241126113552534" style="zoom:67%;" />

   保存好，退出生效

5. 查看是否生效

   <img src="https://picture.dreambo.cn/2026/10/17/23/VhbgyrFn1kYCLIJ-e3957eb3491edde0e96aaec24ba2fd80.png" alt="image-20241126113822603" style="zoom:67%;" />

## 二、 Hadoop运行模式 

### 2.1 本地运行（官方WordCount）

1. 创建在hadoop-3.4.1文件下面创建一个wcinput文件夹

   <img src="https://picture.dreambo.cn/2026/10/17/23/TNFZvl2myqDkJcV-1da5227b6750f25c289661a3ca39a1af.png" alt="image-20241126114502788" style="zoom:67%;" />

2. 在wcinput文件下创建一个word.txt文件 

   <img src="https://picture.dreambo.cn/2026/10/17/23/35uObsVi9ATqUWJ-6162f812afbec2b8c9afc8dc5570d55b.png" alt="image-20241126114621536" style="zoom:67%;" />

3. 编辑word.txt文件

   <img src="https://picture.dreambo.cn/2026/10/17/23/q9pDU54rBYhxWmM-dec0b6fce3ae4e399ac9fe9a8aedbe31.png" alt="image-20241126114551527" style="zoom:80%;" />

4. 执行程序

   <img src="https://picture.dreambo.cn/2026/10/17/23/RzHogdrDw5PyJ8a-9f976bc9fd7675cd0d855aee1ffa721d.png" alt="image-20241126114817692" style="zoom:67%;" />

5. 查看结果

   <img src="https://picture.dreambo.cn/2026/10/17/23/IwKSuyQJUibRhGT-18a8e11c6fdb0481166e34ff544c6a82.png" alt="image-20241126114844284" style="zoom:67%;" />

### 2.2 完全分布式运行模式

#### 2.2.1 虚拟机准备

详见前面

#### 2.2.2 编写集群分发脚本xsync

1. scp 安全拷贝

   - 在hadoop101中将hadoop101中的jdk复制到hadoop102中

     hadoop101中

     <img src="https://picture.dreambo.cn/2026/10/17/23/3DdA2hfitWvrIEN-62c008fd4c9df9d61aa7bcc079c98e2e.png" alt="image-20241126115937138" style="zoom:67%;" />

     hadoop102中

     <img src="https://picture.dreambo.cn/2026/10/17/23/GvaRr1oWOiyUzhZ-84105e039e1de39339aff4f032962055.png" alt="image-20241126120011511" style="zoom:67%;" />

   - 在hadoop103中将hadoop101中的jdk复制到hadoop102中

     <img src="https://picture.dreambo.cn/2026/10/17/23/hrgBsVGkTKltcIZ-159d0a4aa05b370384a7673a22e88272.png" alt="image-20241127103039317" style="zoom:67%;" />

   - 在hadoop102中将hadoop101中的jdk复制到hadoop102中

     <img src="https://picture.dreambo.cn/2026/10/17/23/BvsFcDE8aSw9gWp-a9130fa3836546e305d874ede751e61e.png" alt="image-20241127103200747" style="zoom:67%;" />

2. rsync 远程同步工具

   删除hadoop102中的`/opt/module/hadoop-3.4.1/wcinput`然后从hadoop101同步过去

   <img src="https://picture.dreambo.cn/2026/10/17/23/nbrFIWDBh5HPRKs-c12c59430e486d6f210b0963b88dd579.png" alt="image-20241127103702167" style="zoom:67%;" />

3. xsync 集群分发脚本

 1.  脚本实现

     <img src="https://picture.dreambo.cn/2026/10/17/23/2MEDTopf8ZbyvXn-06421c62b4ac9a2f5cc84a399778654d.png" alt="image-20241127113002037" style="zoom: 50%;" />

 2.  修改xsync的执行权限

     <img src="https://picture.dreambo.cn/2026/10/17/23/vMAaeyJQxizmGDT-ef53742270eef05190172b05a85d8a71.png" alt="image-20241127104857369" style="zoom:67%;" />

 3.  测试脚本

     <img src="https://picture.dreambo.cn/2026/10/17/23/8gfz4jh6VRsJbed-e732f811bb7af475a599e21b676cdcd8.png" alt="image-20241127104954400" style="zoom:67%;" />

 4.  将脚本复制到/bin中，以便于全局调用

     ![image-20241127105022139](https://picture.dreambo.cn/2026/10/17/23/lxgAtpuUsEbNm9w-6036af1136b3a7e681c11f5296421220.png)

 5.  同步环境变量

     <img src="https://picture.dreambo.cn/2026/10/17/23/y6dxCnj9AJPsoqb-79b0208c272c2eeefed0c8c7780d22f5.png" alt="image-20241127105229068" style="zoom:67%;" />

     其他虚拟机生效环境变量

     ```
     [atguigu@hadoop102 ~]$ source /etc/profile 
     [atguigu@hadoop103 ~]$ source /etc/profile
     ```

#### 2.2.3 SSH无密登录配置

首先生成公钥和私钥，然后将公钥copy到需要免密登录的机器上去。

<img src="https://picture.dreambo.cn/2026/10/17/23/6JRVF7oOxn5wKq8-06526e9c4208e331bfb918a80d88ddc7.png" alt="image-20241127110416858" style="zoom: 50%;" />

#### 2.2.4 集群配置

1. 配置集群

   1. 核心配置文件

      配置`core-site.xml`

      ```shell
      cd /opt/module/hadoop-3.4.1/etc/hadoop
      vim core-site.xml
      ```

      内容如下

      <img src="https://picture.dreambo.cn/2026/10/17/23/cVgl4Epz6Ooyvfw-0204046d75a63a6632979eed66dce51c.png" alt="image-20241127112414396" style="zoom:67%;" />

   2. HDFS配置文件

      ```
      vim hdfs-site.xml
      ```

      <img src="https://picture.dreambo.cn/2026/10/17/23/BZQd3icqfz1NYma-4a71bb4508030e86f6e32de35e62b513.png" alt="image-20241127112345020" style="zoom:67%;" />

   3. YRN配置文件

      ```
      vim yarn-site.xml
      ```

      <img src="https://picture.dreambo.cn/2026/10/17/23/zhLvUCpuRq3cG5t-ebf067c69b53931da16d17d0eba2132b.png" alt="image-20241127112545875" style="zoom:67%;" />

   4. MapReduce配置文件

      ```
      vim mapred-site.xml 
      ```

      <img src="https://picture.dreambo.cn/2026/10/17/23/LkhGKNoJgrlfCui-15249a06ead96c65bcd7ad1b74e4d2f5.png" alt="image-20241127112704707" style="zoom:67%;" />

2. 在集群上分发配置好的Hadoop配置文件

   ```
   xsync /opt/module/hadoop-3.4.1/etc/hadoop/
   ```

   <img src="https://picture.dreambo.cn/2026/10/17/23/HizTSWjgxhrseuV-51a98939d4c6449b6498e8bc9d4eb21d.png" alt="image-20241127113329302" style="zoom:67%;" />

3. 去102和103上查看文件分发情况 

   ```
   cat /opt/module/hadoop-3.4.1/etc/hadoop/core-site.xml
   ```

   <img src="https://picture.dreambo.cn/2026/10/17/23/NA5F1mSPpdGVt8X-310c916d6286f71918b999596ad6916b.png" alt="image-20241127113542352" style="zoom:67%;" />

#### 2.2.5 群起集群

1. 配置workers

   编辑workers文件

   ```shell
   vim /opt/module/hadoop-3.4.1/etc/hadoop/workers 
   ```

   <img src="https://picture.dreambo.cn/2026/10/17/23/6jImMLYqXEzaNov-36c827125d1855ad653ed2b0216dac77.png" alt="image-20241127162351966" style="zoom:67%;" />

   同步所以节点配置文件

   <img src="https://picture.dreambo.cn/2026/10/17/23/m3OL4KbF7uTyRIY-48cbc481ab6418d70e05ae2e1f9c27a9.png" alt="image-20241127113947617" style="zoom:67%;" />

2. 启动集群

   1. 格式化namenode

      <img src="https://picture.dreambo.cn/2026/10/17/23/ylwHYQXMRmGiSAZ-590278a05bc07fcd0349e87ab85c6e85.png" alt="image-20241127114518836" style="zoom:67%;" />

   2. 启动HDFS

      <img src="https://picture.dreambo.cn/2026/10/17/23/Pu3UX942Ty6fi1C-7b9b994d01b03e294667a45ec05457f3.png" alt="image-20241127162104517" style="zoom:67%;" />

   3. 在配置了ResourceManager的节点（hadoop102）启动YARN

      ![image-20241127162321847](https://picture.dreambo.cn/2026/10/17/23/AkT32CFx7janSei-944bb9e788aa10825629abca4e0936ce.png)

   4. Web端查看HDFS的NameNode 

      ![image-20241127162014274](https://picture.dreambo.cn/2026/10/17/23/s4AgXIOrn8KuEzl-2fc8a80e38ff4ca31a02b86bb695d4b1.png)

   5. Web端查看YARN的ResourceManager 

      ![image-20241127162638339](https://picture.dreambo.cn/2026/10/17/23/ORB1CjEwu2KLXVq-4d348c0a1d84a1029740a4a342b0ba18.png)

3. 集群基本测试

   1. 上传文件到集群

      上传小文件

      <img src="https://picture.dreambo.cn/2026/10/17/23/WAILhsvl8g35Hyc-8b1f7f75e78edda963fcec4d7d11ff29.png" alt="image-20241127163122006" style="zoom:67%;" />

      <img src="https://picture.dreambo.cn/2026/10/17/23/mylhV29rL3AawWi-17c2d2229e5016abe70cbd4f7007efa5.png" alt="image-20241127163133796" style="zoom:67%;" />

      上传大文件

      <img src="https://picture.dreambo.cn/2026/10/17/23/jiNKIP6CdsEocbY-160fd068c21c02d032be79ca2c5d2e63.png" alt="image-20241127163224581" style="zoom:67%;" />

   2. 查看文件存放位置

      根据block ID找到HDFS文件存储路径

      <img src="https://picture.dreambo.cn/2026/10/17/23/4lMnzarShtEJNTZ-8ac2c855da69f667894c9503d0a1962f.png" alt="image-20241127164257087" style="zoom:50%;" />

      <img src="https://picture.dreambo.cn/2026/10/17/23/dSfxhyiz5kEHRc2-e63c4ffea4eebde2c940e752dd1d73f8.png" alt="image-20241127164426175" style="zoom:67%;" />

      查看HDFS在磁盘存储文件内容 

      <img src="https://picture.dreambo.cn/2026/10/17/23/ijdNmlIUanfEkAS-5eac9ff898fbedc49c5832e223cc8bbe.png" alt="image-20241127164528162" style="zoom:67%;" />

   3. 拼接

      <img src="https://picture.dreambo.cn/2026/10/17/23/rH7YUFuLf8tEmbO-0901e40c35d2c489eff59ab2492358b6.png" alt="image-20241127165002856" style="zoom:67%;" />

   4. 下载

      <img src="https://picture.dreambo.cn/2026/10/17/23/pJOHbgr9iF61my7-12fe3c4f6abf1b92c9b36e51ad021a2a.png" alt="image-20241127164948471" style="zoom:67%;" />

   5. 执行wordcount程序

      <img src="https://picture.dreambo.cn/2026/10/17/23/4tTLXgJiN1vdOeH-cd99b46a56923cb5714b69dbc747ca72.png" alt="image-20241127165143527" style="zoom:67%;" />

      

#### 2.3.6 配置历史服务器

1. 配置mapred-site.xml

   <img src="https://picture.dreambo.cn/2026/10/17/23/BIbNtjeFgpw6JH5-061ef2a988eb10b0431d41062b0276c4.png" alt="image-20241127165943675" style="zoom:67%;" />

2. 分发配置

   <img src="https://picture.dreambo.cn/2026/10/17/23/Y4k6ESuL9m2PdvO-2308ab6e62012e5befe3d23a501e40fe.png" alt="image-20241127165655026" style="zoom:67%;" />

3. 在hadoop102启动历史服务器 

   <img src="https://picture.dreambo.cn/2026/10/17/23/eXG3xvWgSbmDrpJ-b7fb7bd142b0ed596520c76b7d415630.png" alt="image-20241127170014769" style="zoom:67%;" />

4. 查看历史服务器是否启动

   <img src="https://picture.dreambo.cn/2026/10/17/23/eXG3xvWgSbmDrpJ-b7fb7bd142b0ed596520c76b7d415630.png" alt="image-20241127170014769" style="zoom:67%;" />

5. 查看jobhistory

   ![image-20241127170156301](https://picture.dreambo.cn/2026/10/17/23/Xde9xNkJyT8QcRw-dc956fd01a6f983a1ef857cb97e88af2.png)

#### 2.3.7配置日志的聚集

1. 配置yarn-site.xml

   <img src="https://picture.dreambo.cn/2026/10/17/23/1t5Ij8lHvohfayV-3da4b9de304077ad44d9dea354be85ce.png" alt="image-20241127170819501" style="zoom:67%;" />

2. 分发配置

   <img src="https://picture.dreambo.cn/2026/10/17/23/37GrDu6AZBTPwbo-4ff5bb03b21c824625b3329606c5e22c.png" alt="image-20241127170900909" style="zoom:67%;" />

3. 关闭NodeManager 、ResourceManager和HistoryServer

   ![image-20241127171006405](https://picture.dreambo.cn/2026/10/17/23/xyI2v8RbEW15X7m-6bb91378fa63a761f564740a5184a23b.png)

   <img src="https://picture.dreambo.cn/2026/10/17/23/e2zK1UCYi8PLfWO-009a1e6fbe60ec1268c380b82408dec3.png" alt="image-20241127170956869" style="zoom:80%;" />

4. 启动NodeManager 、ResourceManager和HistoryServer

   <img src="https://picture.dreambo.cn/2026/10/17/23/3EoHU5DdaQiCBV1-835e03458df9f22267270dbdbd65dfe3.png" alt="image-20241127171102143" style="zoom:80%;" />

   <img src="https://picture.dreambo.cn/2026/10/17/23/Zg1zXrIc4F3YUql-3813e2c53ea22f9289671f9998df1805.png" alt="image-20241127171051761" style="zoom:67%;" />

5. 删除HDFS上已经存在的输出文件

   <img src="https://picture.dreambo.cn/2026/10/17/23/IPhOZoDVvgNWCq7-442cff1ed12d878513770421c4865c0d.png" alt="image-20241127171137350" style="zoom: 67%;" />

6. 执行WordCount程序

   <img src="https://picture.dreambo.cn/2026/10/17/23/p4N9EOsRd85ljcz-b76b8abaf9a3224324f76980458f83a2.png" alt="image-20241127172010387" style="zoom:67%;" />

7. 查看日志

   ![image-20241127171934685](https://picture.dreambo.cn/2026/10/17/23/dbhfrIKcmDLjUPO-5bf507ab017cf3493fd69d741a4eafc2.png)

![image-20241127172031765](https://picture.dreambo.cn/2026/10/17/23/Tv5LZGbBcn9ywil-637bed233b9a6b5284a8d2c73515e9a8.png)

#### 2.2.8 集群启动/停止方式总结 

1. 各个模块分开启动/停止（配置ssh是前提）常用  

   （1）整体启动/停止HDFS  `start-dfs.sh/stop-dfs.sh`  

   （2）整体启动/停止YARN  `start-yarn.sh/stop-yarn.sh`  

2. 各个服务组件逐一启动/停止  

   （1）分别启动/停止HDFS组件  `hdfs --daemon start/stop namenode/datanode/secondarynamenode`  （2）启动/停止YARN  `yarn --daemon start/stop  resourcemanager/nodemanager`

#### 2.2.9 编写Hadoop集群常用脚本 

1. Hadoop集群启停脚本（包含HDFS，Yarn，Historyserver）：`myhadoop.sh `

<img src="https://picture.dreambo.cn/2026/10/17/23/SHEct2md98KBsW6-64295b8f4137798bf5fd50aac1e3a33e.png" alt="image-20241127172753564" style="zoom:67%;" />

​	保存后退出赋予脚本执行权限

![image-20241127172858582](https://picture.dreambo.cn/2026/10/17/23/BD5I4pVnivZGCx8-6de337be79236ae81e74d2905b641e48.png)

2. 查看三台服务器Java进程脚本：jpsall

   <img src="https://picture.dreambo.cn/2026/10/17/23/X9qj7ORBIiWFoU1-e56b3280e261a8a390bd31dccfb4ebf0.png" alt="image-20241127173114945" style="zoom:80%;" />

   保存后退出赋予脚本执行权限

   ![image-20241127173159592](https://picture.dreambo.cn/2026/10/17/23/8toSCuTQasgXryO-fa84b4793aa708f7cf95a72766e5aca7.png)

3. 分发/home/atguigu/bin目录，保证自定义脚本在三台机器上都可以使用 

   <img src="https://picture.dreambo.cn/2026/10/17/23/r2vOSZ8uIgBFVoU-eec78224a9a619cc1933fcbd9cc8fae2.png" alt="image-20241127173234210" style="zoom:80%;" />

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

      <img src="https://picture.dreambo.cn/2026/10/17/23/Uv4sifk8tp5rHx1-232c47acc6d934519932c05602ae888e.png" alt="image-20241128102831051" style="zoom:67%;" />

   2. 修改hadoop101的ntp.conf 配置文件

      编辑文件` sudo vim /etc/ntp.conf`

      <img src="https://picture.dreambo.cn/2026/10/17/23/v3byKGxMe7QlN1W-1a0b22fa6270889bf53ec22c08299943.png" alt="image-20241128112425376" style="zoom:67%;" />

   3. 修改hadoop101的/etc/sysconfig/ntpd 文件

      编辑文件` sudo vim /etc/sysconfig/ntpd`

      增加内容如下（让硬件时间与系统时间一起同步）

      ![image-20241128103551933](https://picture.dreambo.cn/2026/10/17/23/IZkha4En13X2W6r-1d64402864955846188aab7dcf039f64.png)
   
   4. 重新启动ntpd服务
   
      使用指令`sudo systemctl start ntpd`
   
   5. 设置ntpd服务开机启动 
   
      使用指令`sudo systemctl enable ntpd`
   
      <img src="https://picture.dreambo.cn/2026/10/17/23/rlicas9tYjEmqGz-061921c3fa374327e2430bb9ad1048c0.png" alt="image-20241128103839750" style="zoom:67%;" />
   
      

2. 其他机器配置（必须root用户）

   1. 关闭所有节点上ntp服务和自启动

      ```
      sudo systemctl stop ntpd 
      sudo systemctl disable ntpd 
      sudo systemctl stop ntpd 
      sudo systemctl disable ntpd 
      ```

      <img src="https://picture.dreambo.cn/2026/10/17/23/XUEQBby1fSkc73V-9ff8f780b995b2be03d271a9fed2b553.png" alt="image-20241128104249986" style="zoom:80%;" />

   2. 在其他机器配置1分钟与时间服务器同步一次 

      编写定时文件`sudo crontab -e `

      <img src="https://picture.dreambo.cn/2026/10/17/23/8piRGCqPgBJ3LYf-1591173814902136817201115951e5f1.png" alt="image-20241128104631202" style="zoom: 67%;" />

   3. 修改任意机器时间 

      <img src="https://picture.dreambo.cn/2026/10/17/23/gZUhp54MjeLJIit-0f04dedf52b136a292e77c8453c54e8c.png" alt="image-20241128104723044" style="zoom:80%;" />

   4. 1分钟后查看机器是否与时间服务器同步

      <img src="https://picture.dreambo.cn/2026/10/17/23/NFQBkr8vzTyiqJP-fca757d27db91c50ce2d50fab58b9a70.png" alt="image-20241128104932962" style="zoom:80%;" />
