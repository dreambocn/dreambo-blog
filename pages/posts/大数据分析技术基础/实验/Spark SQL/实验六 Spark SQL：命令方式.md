---
title: Spark SQL：命令方式
date: 2025-05-13
updated: 2025-05-13
categories: 大数据开发 实验 Spark
tags:
  - 大数据开发
  - 实验
  - Spark
---
**1、实验目的**

- 熟悉 Linux操作命令；
- 掌握利用Spark-shell完成Spark SQL命令行操作；
- 熟悉如何加载json数据；
- 掌握使用Spark SQL API查询数据。

**2、实验环境**

虚拟机数量：3个 （1个master，2个slave：slave01，slave02）
主从节点信息：
- 操作系统：Cent OS；
- 软件包位置：/home/zkpk/tgz/；
- 数据包位置：/home/zkpk/experiment；
- _已安装软件：Apache Hadoop 2.7.3，Spark版本：Apache Spark  
    2.1.1，Scala版本2.11.11。_

**3、实验内容**

- 准备数据源，在spark集群中启动spark-shell，加载json数据，使用spark SQL API查询数据;
- 实验内容流程图。
    ![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/81977ae27a1c4c2bb425ce6a679a8c9f/image/1.png)

图3-1实验内容流程图

**4、实验关键点**
- 注意创建json格式文件要正确；
- 注意命令行中的命令符号必须在英文状态下录入；
- 每做完一步最好验证一下是否成功以保证后续步骤顺利进行。

**5、实验效果图**

Spark SQL查询效果如下图所示：
![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/81977ae27a1c4c2bb425ce6a679a8c9f/image/56cfdd2ee2f09d92baa7bec4ae0ef034.png)
图 5-1实验效果图（1）

![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/81977ae27a1c4c2bb425ce6a679a8c9f/image/5b2bc0032174842625e63c7fbfbe59ab.png)
图 5-2实验效果图（2）

![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/81977ae27a1c4c2bb425ce6a679a8c9f/image/0fc4e4b9ec0e94a8e1d73608ac3b71ea.png)
图 5-3实验效果图（3）

**小知识：JSON(JavaScript Object Notation) 是一种轻量级的数据交换格式。  
易于人阅读和编写，同时也易于机器解析和生成。  
JSON采用完全独立于语言的文本格式，但是也使用了类似于C语言家族的习惯，  
这些特性使JSON成为理想的数据交换语言。 JSON建构于两种结构：**

**（1）⽆序的“名称/值”键值对集合，集合以 "{" 开始， "}"  
结束。每⼀个名称（key）后跟⼀个 ":"，再后面是其对应的值，每个键值对之间使⽤ ","  
分隔。**
**（2）值的有序集合。集合以 "[" 开始， "]" 结束。各个值之间使⽤ "," 分隔。**

**6、实验步骤**

**前置实验：Spark On Yarn模式安装部署完成。**

6.1在zkpk用户根目录创建json文件，名为people.json。
6.1.1在json文件中输入以下内容，作为数据源，保存退出。
![image.png](https://s2.loli.net/2025/05/23/b6OghcFTqCJzfBx.png)

6.1.2验证刚才创建的people.json文件并查看其内容。
![image.png|500](https://s2.loli.net/2025/05/23/ZUSizOunadDRfhk.png)

6.2进入spark根目录，运行spark-shell，打开spark命令行模式。

6.2.1为避免现有环境中的依赖问题，执行如下命令（该步骤可能需要几分钟时间）。
6.2.2启动spark shell。
![image.png|500](https://s2.loli.net/2025/05/23/KGAtjkd2n1zHFSl.png)

6.2.4在Spark2.0后只要创建一个SparkSession就够了，SparkConf、SparkContext和SQLContext都已经被封装在SparkSession当中。当我们启动spark  
shell时，默认已经初始化好了一个SparkSession对象 spark。
![image.png|500](https://s2.loli.net/2025/05/23/DsuoNdAwUJZf5OM.png)

6.2.5利用SparkSession对象spark，其读取json数据赋值给一个DataFrames对象df，并解析数据结构。
![image.png|500](https://s2.loli.net/2025/05/23/cFNX86Qwm5CZ2Tt.png)

6.2.5.1DataFrames是一个以命名列方式组织的分布式数据集，等同于关系型数据库中的一个表。

6.2.5.2DataFrames 和 SQL提供了通用的方式来连接多种数据源，支持Hive、Avro、Parquet、ORC、JSON、和JDBC，并且可以在多种数据源之间执行 join操作。

6.2.5.3可以通过SQL的方式操作DataFrames。

6.3DataFrames处理结构化数据的基本操作。

6.3.1调用df对象的show方法，展示所有数据。
![image.png|450](https://s2.loli.net/2025/05/23/Cpvk2GLgQ9E7Ht5.png)

6.3.2只显示数据中的某一列。调用df对象的sql操作语句select，只查询“name”这一列，并调用show方法输出。
![image.png|500](https://s2.loli.net/2025/05/23/OQJPAEKsZaeifUt.png)

6.3.3对Int类型数据做计算。调用df对象的sql操作语句select，选择“name”和“age”这两列，且将“age”值加1，并调用show方法输出。
![image.png|475](https://s2.loli.net/2025/05/23/RGgCn1zA8pl6qEf.png)

6.3.4条件过滤。调用df对象的sql操作语句filter，过滤出“age”值大于21的所有数据，并调用show方法输出。
![image.png|500](https://s2.loli.net/2025/05/23/CPwbeOvgqlQ8cJo.png)

6.3.5groupBy分组操作。调用df对象的sql操作语句groupBy，对“age”进行分组操作，调用count方法计算分组后，每一组值的个数，并调用show方法输出。
![image.png|500](https://s2.loli.net/2025/05/23/RBMrLtPKInk39Sg.png)

6.3.6使用:quit命令退出spark shell模式。
![image.png](https://s2.loli.net/2025/05/23/i6LWwtKU5BoF2OV.png)

**7、思考题**

1. 什么是json数据格式？一个用户名为Tom，年龄23岁，账号为000012，密码为123456，地址为武汉，电话为12312312345，QQ号为31234581，请写出其json数据格式。
	JSON: JavaScript Object Notation JS对象简谱 , 是一种轻量级的数据交换格式.
	
	{"name":"Tom","age":"23","Account":"000012","password":"123456","address":"武汉","phone":"12312312345","qq":"3123458"}


2. 将第1题中的json数据保存为user.json文件， 然后定义一个  
	DataFrame实例df1读取user.json文件，最后调用show( )展示数据？
	![image.png](https://s2.loli.net/2025/05/23/EOblCZJDKHeycwA.png)
	![image.png](https://s2.loli.net/2025/05/23/A89HlThDmaKObfE.png)

测试出来如果用美化后的json不能识别只能是压缩后的json可以识别
精简
{ "name": "Tom", "age": "23", "Account": "000012", "password": "123456", "address": "武汉", "phone": "12312312345", "qq": "3123458" }
美化
{
	"name": "Tom",
	"age": "23",
	"Account": "000012",
	"password": "123456",
	"address": "武汉",
	"phone": "12312312345",
	"qq": "3123458"
}
3. 用什么命令启动和退出spark shell？
打开 spark-shell
退出 :quit