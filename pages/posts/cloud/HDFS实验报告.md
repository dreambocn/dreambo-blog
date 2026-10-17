---
title: 分布式文件系统HDFS
date: 2022-04-01
updated: 2022-04-01
categories:
  - 云计算与分布式
  - 笔记
tags:
  - HDFS
  - Hadoop
  - 实验
description: "通过 HDFS 实验学习分布式文件系统，记录基本文件操作与工作原理分析，结合实际步骤理解 Hadoop 数据存储流程。"
---
## 分布式文件系统HDFS

## **一、	实验目的**

掌握HDFS的基本命令，理解HDFS工作原理和元数据管理方式。

## **二、	实验内容**

HDFS的基本命令练习

检测HDFS元数据与真正文件数据的管理方式

## **三、	实验方法和步骤**

### 1 HDFS基本操作

在自己的HDFS系统中中建立姓名拼音全拼的文件夹，例如张三，建立zhangsan，路径不限制。

在个人文件夹下，建立一个文件名为个人学号的文件，文件内容不限制。

创建文件夹

```shell
hadoop fs -mkdir /songyuanbo
```

![image-20241202151324624](https://picture.dreambo.cn/2026/10/17/23/gTqnxB8jOEMZkQt-795c4e5d99a83a5679cd5ecd81c4d240.png)

1. 向HDFS中上传任意文本文件，如果指定的文件在HDFS中已经存在，由用户指定是追加到原有文件末尾还是覆盖原有的文件；

   ```shell
   if $(hadoop fs -test -e /songyuanbo/2211650123.txt);
   then $(hadoop fs -appendToFile 2211650123.txt /songyuanbo/2211650123.txt);
   else $(hadoop fs -copyFromLocal -f 2211650123.txt /songyuanbo/2211650123.txt);
   fi
   ```
   
   ![image-20241202155126698](https://picture.dreambo.cn/2026/10/17/23/7sPedMbzXg3FpD6-be9b0be1324d97fc0ca4ce95787c8668.png)
   
2. 从HDFS中下载指定文件，如果本地文件与要下载的文件名称相同，则自动对下载的文件重命名；

   下载

   ```shell
   if $(hadoop fs -test -e file:///home/atguigu/2211650123.txt); 
   then $(hadoop fs -copyToLocal /songyuanbo/2211650123.txt ./22116501232.txt); 
   else $(hadoop fs -copyToLocal /songyuanbo/2211650123.txt ./2211650123.txt);
   fi
   ```

   ![image-20241202155051913](https://picture.dreambo.cn/2026/10/17/23/KI8cjJQi5AhNPsZ-59d02a6297a60ee223736be0af0305d2.png)

3. 将HDFS中指定文件的内容输出到终端中；

   查看文件内容

   ```shell
   hadoop fs -cat /songyuanbo/2211650123.txt
   ```

   ![image-20241202152728966](https://picture.dreambo.cn/2026/10/17/23/9RtVJxOr45ySa6k-2bf242e0e5aaa23af7cc9869c8e23b95.png)

4. 显示HDFS中指定的文件的读写权限、大小、创建时间、路径等信息；

   查看信息指令
   
   ```shell
   hadoop fs -ls /songyuanbo/2211650123.txt
   ```
   
   ![image-20241202153033356](https://picture.dreambo.cn/2026/10/17/23/AcbNsmD2pUEOnBf-b2968932590cccf28b23fb1092185e09.png)

5. 给定HDFS中某一个目录，输出该目录下的所有文件的读写权限、大小、创建时间、路径等信息，如果该文件是目录，则递归输出该目录下所有文件相关信息；

   查看信息指令

   ```shell
   hadoop fs -ls /songyuanbo
   ```

   ![image-20241202152836829](https://picture.dreambo.cn/2026/10/17/23/8kcnSu3tFJPIwTr-338446116a152b320215495444ac4eba.png)

6. 提供一个HDFS内的文件的路径，对该文件进行创建和删除操作。如果文件所在目录不存在，则自动创建目录；

   ```shell
   if $(hadoop fs -test -d /test/syb);
   then $(hadoop fs -touchz /test/syb/test.txt); 
   else $(hadoop fs -mkdir -p /test/syb && hadoop fs -touchz /test/syb/test.txt); 
   fi
   ```

   ![image-20241202155755647](https://picture.dreambo.cn/2026/10/17/23/qHCuFe2SgbXZJOW-fdbe216900396364d402f07b5cc9abaa.png)

   ![image-20241202155741665](https://picture.dreambo.cn/2026/10/17/23/VNjIdkQWSlZKGYM-46ae90d374e948ded1c16d9c4fc31d1b.png)

7. 提供一个HDFS的目录的路径，对该目录进行创建和删除操作。创建目录时，如果目录文件所在目录不存在则自动创建相应目录；删除目录时，由用户指定当该目录不为空时是否还删除该目录；

   ```shell
   hadoop fs -mkdir -p /test/test # 创建目录
   hadoop fs -rmdir  /test/test # 目录非空则会提示not empty，不执行删除
   hadoop fs -rm -r /test/test # 强制删除目录
   ```

   ![image-20241202160220395](https://picture.dreambo.cn/2026/10/17/23/RD7iHxBLyr81AMs-f0080915c8f516bceb2dcd0e5d8eadc9.png)

   ![image-20241202160511122](https://picture.dreambo.cn/2026/10/17/23/PgTACcb8EKmJOtN-09e3c06137ad61eb0846dbef61f80855.png)

8. 删除HDFS中指定的文件；

   ```shell
   hadoop fs -rm /test/syb/test.txt
   ```

   ![image-20241202160432141](https://picture.dreambo.cn/2026/10/17/23/vtsBfXZ95p7UcSx-162ef7338d447967584fb368546285e9.png)

9. 删除HDFS中指定的目录，由用户指定目录中如果存在文件时是否删除目录；

   ```shell
   hadoop fs -rmdir  /test/syb # 目录非空则会提示not empty，不执行删除
   hadoop fs -rm -r /test/syb # 强制删除目录
   ```

   ![image-20241202160801350](https://picture.dreambo.cn/2026/10/17/23/bSEyKHarRBxq9e8-2ced175ef372fa6070c623daae6f0b53.png)

10. 在HDFS中，将文件从源路径移动到目的路径

    ```shell
    hadoop fs -mv /songyuanbo/2211650123.txt /songyuanbo/2211650123.backup
    ```

    ![image-20241202161014215](https://picture.dreambo.cn/2026/10/17/23/4jWRFqupwi3cJys-c7beb50de58c09a1175fde744055870a.png)



### 2. 分析HDFS工作原理

分析HDFS的元数据，找出上述文件夹和文件的相关元数据

```shell
hdfs oiv -p XML -i fsimage_0000000000000000284 -o /home/atguigu/fsimage.xml 
#查看Fsimage 文件
hdfs oev -p XML -i 
#查看Edits文件 
```

导出文件

![image-20241202161854749](https://picture.dreambo.cn/2026/10/17/23/ZAprMoa9FEfPKwY-4838ba3c1f4a78398a763b84f6a4186f.png)

fsimage.xml

![image-20241202162027543](https://picture.dreambo.cn/2026/10/17/23/kqPFvILDmO3Yc92-d944da991828e2469d5ff69b289277fd.png)

edits.xml

![image-20241202162052633](https://picture.dreambo.cn/2026/10/17/23/svqenB16xZWm4LU-3fb70fd8c8051d4379f85007b74bb366.png)
