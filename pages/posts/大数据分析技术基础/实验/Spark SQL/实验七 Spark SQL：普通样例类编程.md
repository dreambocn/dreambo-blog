---
title: Spark SQL：普通样例类编程
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
- 掌握使用SQLContext查询分析数据。

**2、实验环境**

虚拟机数量：3个 （1个master，2个slave：slave01，slave02）
主从节点信息：
- 操作系统：Cent OS7.5；
- 软件包位置：/home/zkpk/tgz/；
- 数据包位置：/home/zkpk/experiment；
- _已安装软件： Spark版本：Apache Spark 2.1.1，Scala版本2.11.11，IDEA版本：ideaIC-2017.2.7。_
**3、实验内容**

- 启动Hadoop集群，准备数据源文件，在Spark集群中利用集成开发环境IDEA创建Spark sql工程，创建单例对象Object和样例类，编写main方法，实现将RDD转换成DataFrame，并在环境中运行程序，在终端界面查看程序输出结果，在输出路径查看结果。
- 实验内容流程图。
    ![](http://172-31-151-214.vpn.tiangong.edu.cn:8118/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/1.png)
    图3-1实验内容流程图

**4、实验关键点**

- 注意有的实验步骤命令是分别在master, slave01,slave02不同虚拟机上操作的；
- 注意创建工程时配置软件包依赖，删除测试环境test中的测试类和main文件夹中包名下的App文件；
- 注意程序中对象、方法关键字大小写敏感；
- 编制程序时注意代码缩进凸显结构清晰，注意创建Spark sql工程和样例对象的名字大小写敏感；
- 注意正确配置运行时参数;
- 每做完一步最好验证一下是否成功以保证后续步骤顺利进行。

**5、实验效果图**

Spark SQL使用样例类创建DataFrame操作最终效果图5-1是控制台的输出结果，图5-2是在终端查看的结果文件内容。
![](http://172-31-151-214.vpn.tiangong.edu.cn:8118/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/bdb74079b29bfaf2034c3b49b99cd417.png)
图 5-1实验效果图（1）

![](http://172-31-151-214.vpn.tiangong.edu.cn:8118/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/364079da80c7e79d8a4db3e4b36b347c.png)
图 5-2实验效果图（2）

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

6.4.3右键点击SQL文件夹，依次选择“New”—>“Scala Class”，创建Spark Sql工程代码，命名为SparkSqlDemo01，点击“Kind”右侧三角形，选择“Object”类型，点击“OK”按钮。
![image.png](https://s2.loli.net/2025/05/23/YHmzUA7Togda8eX.png)

6.4.4打开SparkSqlDemo01.scala，创建单例对象object SparkSqlDemo01。
6.4.4.1在object SparkSqlDemo01中创建样例类Person，其构造器包含三个属性，分别是id：String，name：String，age：Int。
![image.png](https://s2.loli.net/2025/05/23/8mhjC6ruM3ARJtI.png)

6.4.4.2在object SparkSqlDemo01中创建main方法。
6.4.4.3在main方法中创建SparkConf对象conf，对Spark运行属性进行配置，调用该对象的setAppName方法设置Spark程序的名称为“SparkSqlDemo01”，调用setMaster方法设置Spark程序运行模式，一般分为两种：本地模式和yarn模式，这里我们采用本地模式，参数为“local”。
![image.png](https://s2.loli.net/2025/05/23/o5ZCQAn8zuxghFJ.png)

6.4.4.4创建SparkContext对象sc，参数为上一步创建的SparkConf对象conf。
6.4.4.5创建SQLContext对象sqlContext，参数为上一步创建的SparkContext对象sc，用于后续的SparkSql操作。
![image.png](https://s2.loli.net/2025/05/23/GiyXPaFljH1RqBc.png)

6.4.4.6调用sc对象的textFile方法，参数为运行时配置的args数组的第一个参数args(0)，其可以按行读取本地或者HDFS上的文件，并赋值给常量lines。
6.4.4.7调用lines的split 方法，将每一行数据以空格切分。
6.4.4.8再对6.4.4.7中的结果调用map方法，将每一行数据存入Person对象中，并且将arr(2)也就是年龄那一列由String类型转换为Int类型。
6.4.4.9将6.4.4.8产生的结果赋予一个RDD对象personRDD，存储的数据类型为Person对象。
![image.png](https://s2.loli.net/2025/05/23/qSvZy5OVhYgejt2.png)

6.4.4.10为了将RDD隐式转换为DataFrame，需要将sqlContext对象的implicits中的成员全部导入。
6.4.4.11调用personRDD对象的toDF方法将RDD隐式转换成为DataFrame对象df。
![image.png](https://s2.loli.net/2025/05/23/NTuq75SILXM9Gs4.png)

6.4.4.12将df对象注册成一张视图，这样方便直接通过DataFrame对象来进行数据查询和分析等操作。
![image.png](https://s2.loli.net/2025/05/23/LObPgizEN4hqH97.png)

6.4.4.13调用sqlContext对象的sql方法，参数为基本的sql语句，这里我们查询：年龄大于等于13且年龄小于等于22对象的name，并赋值给teenagers。
![image.png](https://s2.loli.net/2025/05/23/TtXMfwnu2bNP5QE.png)

6.4.4.14调用teenagers的map方法循环打印“Name：”和查询到的“name”数据。
![image.png](https://s2.loli.net/2025/05/23/vowa6sgGJ8NO4Wu.png)

6.4.4.15调用teenagers的write方法写出数据，并调用format方法，参数为parquet，设置输出数据格式为parquet；并调用save方法，参数为写出路径，这里是运行时程序配置参数args(1)。
![image.png](https://s2.loli.net/2025/05/23/pckD8jltgrPSysv.png)

6.5配置运行参数运行程序，查看结果。
6.5.1点击IDEA菜单栏上的“Run”—>“Run…”。
6.5.2在弹出的对话框中选择“Edit Configurations”
6.5.3在弹出的配置框中，点击图6-40所示左上角“+”号，选择“Application”
6.5.4在图 6-41界面右侧定义运行信息，设置“Name”为SparkSqlDemo01，“Main Class”为SparkSqlDemo01（这里也可通过输入框右侧浏览按键选择）；配置“Program arguments”，首先是数据源输入路径：/home/zkpk/person.txt，然后是结果输出路径：/home/zkpk/teenager，中间需要用空格分隔。

6.5.5配置完成，点击下方“Run”按钮，等待程序运行。
![image.png](https://s2.loli.net/2025/05/23/yneGP5oD1fQFIUt.png)

6.5.6查看控制台结果
![image.png](https://s2.loli.net/2025/05/23/I1NOtrM5eYZdbsf.png)

6.5.7查看输出路径结果。
![image.png](https://s2.loli.net/2025/05/23/WKciMsNODkgf63d.png)

**8、思考题**

1. 本实验中哪句语句是创建样例类的语句，Scala中样例类主要用于什么功能？
	![image.png](https://s2.loli.net/2025/05/23/DaREpjM9ylqAB3t.png)
	用于快速定义一个用于保存数据的类，类似于Java中的POJO类。样例类非常适合用于不可变的数据，提供模式匹配，自动生成实用方法，自动生成伴生对象。

2. main方法中![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/1d19f1d15c75d4b098d860448167ff2d.png)和![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/27622a7d727acf0b43dd3539f25f4148.png)这两句语句中的args(0)和args(1)分别代表哪两个参数？
	分别代表/home/zkpk/person.txt和/home/zkpk/teenager，用于接收传入参数。
3. 在下列查询语句中，表名是什么？![](http://172.31.151.214/tms-module-admin/upload/course/9a6b7d1269ae46808c4a7619031bd217/content/aacbc15d28ef4fa890ba64575aba1fca/image/156c3a1ef817857a48e813a2517425c6.png)
	person