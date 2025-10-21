---
title: Spark SQL：领域API编程
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
- 掌握利用Spark IDEA完成Spark SQL API接口编程操作；
- 熟悉如何使用样例类将RDD转换成DataFrame程序；
- 掌握使用SQLContext、Spark DataFrame查询分析数据；
- 掌握在IDEA环境中运行程序，并能在终端界面和HDFS查看程序输出结果。

**2、实验环境**

虚拟机数量：3个 （1个master，2个slave：slave01，slave02）
主从节点信息：
- 操作系统：Cent OS7.5；
- 软件包位置：/home/zkpk/tgz/；
- 数据包位置：/home/zkpk/experiment；
- _已安装软件： Spark版本：Apache Spark  
    2.1.1，Scala版本2.11.11，IDEA版本：ideaIC-2017.2.7。_

**3、实验内容**

- 启动Hadoop集群，准备数据源文件，在Spark集群中利用集成开发环境IDEA创建Spark sql工程，创建单例对象object和样例类，编写main方法，实现将RDD转换成DataFrame，通过DataFrame对象来进行条件数据查询和分析等操作，并在环境中运行程序，在终端界面查看程序输出结果；
- 实验内容流程图。
    ![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/1.png)
    图3-1实验内容流程图

**4、实验关键点**

- 注意有的实验步骤命令是分别在master, slave01,slave02不同虚拟机上操作的；
- 注意创建工程时配置软件包依赖，删除测试环境test中的测试类和main文件夹中包名下的App文件；
- 注意程序中对象、方法关键字大小写敏感；
- 编制程序时注意代码缩进凸显结构清晰，注意创建Spark sql工程和样例对象的名字大小写敏感；
- 注意正确配置运行时参数;
- 每做完一步最好验证一下是否成功以保证后续步骤顺利进行。

**5、实验效果图**

Spark sql 使用领域API查询效果图：
![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/a9cc53ade7f7f3495eca0234a61b426a.png)
图 5-1实验效果图（1）

![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/e04f12151956f0b5797aaf544eadf4bf.png)
图 5-2实验效果图（2）

![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/72e4c0436a7c3493386014a1167682eb.png)
图 5-3实验效果图（3）

**6、实验步骤**

6.1打开虚拟机并启动Hadoop集群。
6.1.1在master虚拟机启动Hadoop集群。
![image.png](https://s2.loli.net/2025/05/23/DVMtqpBEC4l6YWH.png)
并取消集群的安全模式：
![image.png](https://s2.loli.net/2025/05/23/DzUeXBmZtMLfW54.png)

6.1.2在master虚拟机上运行jps，确认NameNode, SecondaryNameNode,ResourceManager进程启动。
![image.png|375](https://s2.loli.net/2025/05/23/TKeBAOwY6vFy2ap.png)
6.1.3在slave01虚拟机上运行jps，确认DataNode, NodeManager进程启动。
![image.png](https://s2.loli.net/2025/05/23/lbQefWIyvT1sH52.png)

6.1.4在slave02虚拟机上运行jps，确认DataNode, NodeManager进程启动
![image.png](https://s2.loli.net/2025/05/23/iHAxZ3gTFYtmq2Q.png)

6.2用vim命令在zkpk用户根目录创建txt文件，名为person.txt。
![image.png](https://s2.loli.net/2025/05/23/C5WVIZ34Q98J1hR.png)

6.3打开IDEA，配置软件包依赖，创建工程。
![image.png](https://s2.loli.net/2025/05/23/q9L85cnMECl1GPe.png)

6.3.1进入图6-7界面，点击 “Create New Project”新建一个工程。
6.3.2在图6-8中，按照图标依次点击①②③④，然后点击“Next”按钮。
![image.png](https://s2.loli.net/2025/05/23/KCEFTlH1dJSe78t.png)

6.3.3按照图6-9所示依次输入GroupId和ArtifactId和Version的值，随后点击“Next”按钮。
![image.png](https://s2.loli.net/2025/05/23/emIhsb8KNxMQgkf.png)

6.3.4进入图6-10界面，设置本地Maven工程的setting.xml文件和warehouse仓库文件夹，点击“Next”按钮。

6.3.4.1本地setting.xml文件在/home/zkpk/apache-maven-3.5.0/conf/目录下。

6.3.4.2本地仓库文件夹warehouse在/home/zkpk/apache-maven-3.5.0/目录下。
![image.png](https://s2.loli.net/2025/05/23/BjgXDRoqdcTAZe8.png)

6.3.5进入图6-11界面，输入工程名称spark_test，保存在~/IdeaProjects/目录下，最后点击“Finish”按钮，在弹出的是否创建该目录提示窗口中点击“OK”按钮。
![image.png](https://s2.loli.net/2025/05/23/sJTWqUEFYuhdgmR.png)

6.3.6进入图6-12界面，即表示工程spark_test创建成功。
6.3.7工程创建完成后会自动打开一个名为pom的xml文件，删除如下图红框部分的依赖，如果没有这些依赖，直接进入下一步。
![image.png](https://s2.loli.net/2025/05/23/qMgO9TIc7amfsAt.png)

6.3.8在该xml文件中找到properties配置项，修改scala版本号（此处对应scala安装版本2.11.11），并添加spark版本号（此处对应spark安装版本2.1.1）
![image.png](https://s2.loli.net/2025/05/23/Yvi8qktWLpQ5AeG.png)

6.3.9然后找到dependency配置项，添加图6-15所示红框部分的配置，分别是spark-core_2.11和spark-sql_2.11依赖；{spark.version}表示上述配置的spark.version变量。
![image.png](https://s2.loli.net/2025/05/23/b1w5W9uHGsUPcQy.png)

6.3.10一般修改pom.xml文件后，界面会提示“enable auto-import”，点击即可；如果没有提示，则可以右击工程名，依次选择Maven—>Reimport，即可根据pom.xml文件导入依赖包，这个步骤需要一定时间，不要强行终止，等到全部导入结束后再继续下面步骤。

6.3.11设置语言环境Language level，点击菜单栏中的“File”，选择“Project Structure”。
![image.png](https://s2.loli.net/2025/05/23/tuX3IWH9yOT5KlZ.png)

6.3.13设置Java Compiler环境，点击菜单栏中的“File”，选择“Settings…“。
6.3.14在图6-20界面，依次选择“Build，Execution，Deployment“—>”Compiler“—>”Java Compiler“，设置图中的”Project bytecode version“为1.8，设置图中的”Target bytecode version“为1.8，然后依次点击“Apply“和”OK“按钮。
![image.png](https://s2.loli.net/2025/05/23/D2YRa1rtwhV5KZb.png)

6.3.15如图6-21所示删除测试环境test中的测试类AppTest和MySpec。
6.3.16如图6-22所示删除main文件夹中，包名下的App文件
6.3.17至此，Spark Maven工程创建完毕。
![image.png](https://s2.loli.net/2025/05/23/O2x9f6bVlZWcvGB.png)

6.4.1在main文件夹右击鼠标，依次选择“New”—>“Directory”创建目录SQL，点击“OK”按钮
![image.png](https://s2.loli.net/2025/05/23/QdODwomitJXGKVZ.png)

6.4.2在目录SQL上右击鼠标，依次选择“Mark Directory as”—>“ Sources Root”即可将该文件夹设置为工程目录。
![image.png](https://s2.loli.net/2025/05/23/x7pIsvbiodFMy1z.png)

6.4.3右键点击SQL文件夹，依次选择“New”—>“Scala Class”，创建Spark Sql工程代码，命名为SparkSqlDemo02，点击“Kind”右侧三角形，选择“Object”类型，点击“OK”按钮。
![image.png](https://s2.loli.net/2025/05/23/c7hLEjAnQMZ1SVi.png)

6.4.4打开SparkSqlDemo02.scala，创建单例对象object SparkSqlDemo02。
6.4.4.1在object SparkSqlDemo02中创建样例类Person，其构造器包含三个属性，分别是id：String，name：String，age：Int。
![image.png](https://s2.loli.net/2025/05/23/WGcuDPsxbj5lvtH.png)

6.4.4.2在object SparkSqlDemo02中创建main方法。
6.4.4.3在main方法中创建SparkConf对象，对Spark运行属性进行配置，调用该对象的setAppName方法设置Spark程序的名称为“SparkSqlDemo02”，调用setMaster方法设置Spark程序运行模式，一般分为两种：本地模式和yarn模式，这里我们采用本地模式，参数为“local”，属性设置完成后赋值给常量conf。
![image.png](https://s2.loli.net/2025/05/23/nMZpNUaiBgoGzmf.png)

6.4.4.4创建SparkContext对象sc，参数为上一步创建的SparkConf对象conf。
6.4.4.5调用sc对象的setLogLevel(“ERROR”)方法，ERROR表示除了启动日志和程序输出日志之外，只打印错误日志，这一步的设置可以避免在运行程序时spark的算子过于复杂，执行日志很多导致难以找到程序输出。
![image.png](https://s2.loli.net/2025/05/23/1acJRfBbWFqmLyN.png)

6.4.4.6创建SQLContext对象，并赋值给常量sqlContext，该对象由SparkContext对象sc生成，用于后续的SparkSql操作。
![image.png](https://s2.loli.net/2025/05/23/KenPJzSusXDHO1Z.png)

6.4.4.7调用sc对象的textFile方法，参数为运行时配置的args数组的第一个参数args(0)，其可以按行读取本地或者HDFS上的文件，并赋值给常量lines。
6.4.4.8调用lines的split方法，将每一行数据以空格切分。
6.4.4.9再对6.4.4.8中的结果调用map方法，将每一行数据存入Person对象中，并且将arr(2)也就是年龄那一列由String类型转换为Int类型。
6.4.4.10将6.4.4.9产生的结果，赋予一个RDD对象personRDD，存储的数据类型为Person对象。
![image.png](https://s2.loli.net/2025/05/23/8j3n2zUIdYbwphP.png)

6.4.4.11为了将RDD隐式转换为DataFrame，需要将sqlContext对象的implicits中的成员全部导入。
6.4.4.12调用personRDD对象的toDF方法将RDD隐式转换成为DataFrame对象df。
![image.png](https://s2.loli.net/2025/05/23/PfmlSWq8E2wpDIb.png)

6.4.4.13将df对象注册成一张视图，这样方便直接通过DataFrame对象来进行数据查询和分析等操作。
6.4.4.14调用df的select方法，参数为”name”,”age”，意思是从df数据结构中查询每行数据的name和age列，并赋值给一个新的DataFrame对象nameAgeDF，然后调用nameAgeDF对象的show()方法输出数据。
![image.png](https://s2.loli.net/2025/05/23/4yTshtPHYCg3GBQ.png)

6.4.4.15调用df对象的select方法，参数是”name”，”age”,查询到每行数据的name和age信息，再调用filter方法，输入是select的每条结果，过滤数据，找到name等于”lili”的那一行数据，并赋值给一个名为liliDataSet的DataSet对象，用于存放匹配到的结果行，存储类型为Row。
6.4.4.16调用liliDataSet对象的show( )方法输出数据。
![image.png](https://s2.loli.net/2025/05/23/L4hKk1cQUZ2mGNj.png)

6.4.4.17调用df对象的select方法，参数为“age”，查询出每行数据中的“age”字段，再调用groupBy方法，参数为”age”，该方法类似于普通SQL中group  
by，将select获取到的数据按照“age”进行分组，并赋值给新的DataFrame对象groupedDF
6.4.4.18以下两种代码实现效果一致，调用对象groupedDF的count()方法，计算分组后的每组值总数，再调用show( )方法输出数据。
![image.png](https://s2.loli.net/2025/05/23/182DzyxVcF3M5oj.png)

6.4.4.19调用df对象的select方法，参数为”name”,”age”，查询出每行数据的”name”和”age”字段，并且在select方法中对”age”字段加1，并赋值给新的DataFrame对象agePlusOne。
6.4.4.20调用agePlusone对象的show( )方法输出数据。
![image.png](https://s2.loli.net/2025/05/23/ytaPoul1SqOicYM.png)

6.4.4.21调用df对象的select方法，参数为”name”，”age”，查询出所有数据中的”name”和”age”字段，并且在select方法中利用字段名称的as方法起别名，as方法包含一个参数，该参数即原字段的别名（这里我们将”name”字段取别名为”n”，”age”字段取别名为”a”），并赋值给一个新的DataFrame对象alias。
6.4.4.22调用alias对象的write方法写出数据；并调用format方法，参数为json，设置输出数据格式为json；并调用save方法，参数为写出路径，这里是运行时程序配置参数args(1)。
![image.png](https://s2.loli.net/2025/05/23/qfbtUzcnu7AE4g9.png)

6.4.4.23调用sc对象的stop方法，释放SparkContext占用的资源。
![image.png](https://s2.loli.net/2025/05/23/QU6cTrpKd2JCSgF.png)

6.5配置运行参数并运行程序，查看结果。
6.5.1点击IDEA菜单栏上的“Run”—>“Run…”。
6.5.2在弹出的对话框中选择“Edit Configurations”
6.5.3在弹出的配置框中，点击图6-43所示左上角“+”号，选择“Application”。
6.5.4在图 6-44界面右侧定义运行信息，设置“Name”为SparkSqlDemo02，“Main Class”为SparkSqlDemo02（这里也可通过输入框右侧浏览按键选择）；配置“Program arguments”，首先是数据源输入路径：/home/zkpk/person.txt，然后是结果输出路径：/home/zkpk/alias，中间需要用空格分隔。
![image.png](https://s2.loli.net/2025/05/23/FGpqlD23JYbRwkZ.png)

6.5.5配置完成，点击下方“Run”按钮，等待程序运行。
![image.png](https://s2.loli.net/2025/05/23/5KDTNO9qrvI13RU.png)

6.7查看输出路径结果。
![image.png](https://s2.loli.net/2025/05/23/ImxRjtfKCp7slv5.png)


1.将RDD隐式转换成为DataFrame的方法是什么？
![image.png](https://s2.loli.net/2025/05/23/FeVYcXlhsz9G3nK.png)
主要使用toDF()实现转换

2.将原实验![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/c7f337fcf82305d23ab89660f54d23a3.png)
这句语句中的过滤条件变为筛选age等于24岁的，显示其name和age，应该如何改写代码，并展示运行结果？
![image.png](https://s2.loli.net/2025/05/23/t3FNIx4kovsgwAJ.png)

3.将原实验
![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/101896cfedd1404887b58c8d9e886666/image/3f1bcad626a10a9e96aa41aa650c2c31.png)
这句语句改为仅对name为”lili”的age加1，显示name和age，应该如何改写代码，并展示运行结果？
![image.png](https://s2.loli.net/2025/05/23/p1nobdITMiX8mUu.png)
