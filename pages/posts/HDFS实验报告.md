---
title: 分布式文件系统HDFS
date: 2022-04-01
updated: 2022-04-01
categories: 云计算与分布式 笔记
tags:
  - 云计算与分布式
  - 笔记
top: 1
---
# 分布式文件系统HDFS

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

![image-20241202151324624](https://s2.loli.net/2024/12/02/gTqnxB8jOEMZkQt.png)

1. 向HDFS中上传任意文本文件，如果指定的文件在HDFS中已经存在，由用户指定是追加到原有文件末尾还是覆盖原有的文件；

   ```shell
   if $(hadoop fs -test -e /songyuanbo/2211650123.txt);
   then $(hadoop fs -appendToFile 2211650123.txt /songyuanbo/2211650123.txt);
   else $(hadoop fs -copyFromLocal -f 2211650123.txt /songyuanbo/2211650123.txt);
   fi
   ```
   
   ![image-20241202155126698](https://s2.loli.net/2024/12/02/7sPedMbzXg3FpD6.png)
   
2. 从HDFS中下载指定文件，如果本地文件与要下载的文件名称相同，则自动对下载的文件重命名；

   下载

   ```shell
   if $(hadoop fs -test -e file:///home/atguigu/2211650123.txt); 
   then $(hadoop fs -copyToLocal /songyuanbo/2211650123.txt ./22116501232.txt); 
   else $(hadoop fs -copyToLocal /songyuanbo/2211650123.txt ./2211650123.txt);
   fi
   ```

   ![image-20241202155051913](https://s2.loli.net/2024/12/02/KI8cjJQi5AhNPsZ.png)

3. 将HDFS中指定文件的内容输出到终端中；

   查看文件内容

   ```shell
   hadoop fs -cat /songyuanbo/2211650123.txt
   ```

   ![image-20241202152728966](https://s2.loli.net/2024/12/02/9RtVJxOr45ySa6k.png)

4. 显示HDFS中指定的文件的读写权限、大小、创建时间、路径等信息；

   查看信息指令
   
   ```shell
   hadoop fs -ls /songyuanbo/2211650123.txt
   ```
   
   ![image-20241202153033356](https://s2.loli.net/2024/12/02/AcbNsmD2pUEOnBf.png)

5. 给定HDFS中某一个目录，输出该目录下的所有文件的读写权限、大小、创建时间、路径等信息，如果该文件是目录，则递归输出该目录下所有文件相关信息；

   查看信息指令

   ```shell
   hadoop fs -ls /songyuanbo
   ```

   ![image-20241202152836829](https://s2.loli.net/2024/12/02/8kcnSu3tFJPIwTr.png)

6. 提供一个HDFS内的文件的路径，对该文件进行创建和删除操作。如果文件所在目录不存在，则自动创建目录；

   ```shell
   if $(hadoop fs -test -d /test/syb);
   then $(hadoop fs -touchz /test/syb/test.txt); 
   else $(hadoop fs -mkdir -p /test/syb && hadoop fs -touchz /test/syb/test.txt); 
   fi
   ```

   ![image-20241202155755647](https://s2.loli.net/2024/12/02/qHCuFe2SgbXZJOW.png)

   ![image-20241202155741665](https://s2.loli.net/2024/12/02/VNjIdkQWSlZKGYM.png)

7. 提供一个HDFS的目录的路径，对该目录进行创建和删除操作。创建目录时，如果目录文件所在目录不存在则自动创建相应目录；删除目录时，由用户指定当该目录不为空时是否还删除该目录；

   ```shell
   hadoop fs -mkdir -p /test/test # 创建目录
   hadoop fs -rmdir  /test/test # 目录非空则会提示not empty，不执行删除
   hadoop fs -rm -r /test/test # 强制删除目录
   ```

   ![image-20241202160220395](https://s2.loli.net/2024/12/02/RD7iHxBLyr81AMs.png)

   ![image-20241202160511122](https://s2.loli.net/2024/12/02/PgTACcb8EKmJOtN.png)

8. 删除HDFS中指定的文件；

   ```shell
   hadoop fs -rm /test/syb/test.txt
   ```

   ![image-20241202160432141](https://s2.loli.net/2024/12/02/vtsBfXZ95p7UcSx.png)

9. 删除HDFS中指定的目录，由用户指定目录中如果存在文件时是否删除目录；

   ```shell
   hadoop fs -rmdir  /test/syb # 目录非空则会提示not empty，不执行删除
   hadoop fs -rm -r /test/syb # 强制删除目录
   ```

   ![image-20241202160801350](https://s2.loli.net/2024/12/02/bSEyKHarRBxq9e8.png)

10. 在HDFS中，将文件从源路径移动到目的路径

    ```shell
    hadoop fs -mv /songyuanbo/2211650123.txt /songyuanbo/2211650123.backup
    ```

    ![image-20241202161014215](https://s2.loli.net/2024/12/02/4jWRFqupwi3cJys.png)



### 2. 分析HDFS工作原理

分析HDFS的元数据，找出上述文件夹和文件的相关元数据

```shell
hdfs oiv -p XML -i fsimage_0000000000000000284 -o /home/atguigu/fsimage.xml 
#查看Fsimage 文件
hdfs oev -p XML -i 
#查看Edits文件 
```

导出文件

![image-20241202161854749](https://s2.loli.net/2024/12/02/ZAprMoa9FEfPKwY.png)

fsimage.xml

![image-20241202162027543](https://s2.loli.net/2024/12/02/kqPFvILDmO3Yc92.png)

edits.xml

![image-20241202162052633](https://s2.loli.net/2024/12/02/svqenB16xZWm4LU.png)
