---
title: Spark SQL
date: 2025-03-01
updated: 2025-03-01
categories: 大数据开发 笔记
tags:
  - 大数据开发
  - 笔记
---
## 关于Spark SQL

为了再不像Shark一样受Hive的制约，Spark生态转向单独开发Spark SQL
Spark SQL在Hive兼容层面仅依赖HiveQL解析、Hive元数据。
且Spark SQL增加了DataFrame，使用户可以在Spark SQL中使用SQL和更多的外部数据源

Spark SQL特点
（1）容易整合（集成）。Spark SQL可以将SQL查询 和Spark程序无缝集成，允许我们使用SQL或熟悉的 DataFrameAPl在Spark程序中查询结构化数据， 
（2）统一的数据访问方式。SparkSQL可以以相同方 式连接到任何数据源，DataFrame和SQL提供了访问各 种数据源的方法，包括Hive、Avro、Parquet、ORC、 JSON和JDBC。 
（3）兼容Hive。Spark SQL支持HiveQL语法以及Hive SerDes和UDF（用户自定义函数），允许我们访问现 有的Hive仓库。 
（4）标准的数据库连接。SparkSQL支持JDBC或 ODBC连接。

## DataFrame
### 关于DataFrame
RDD是分布式的Java对象的集合，但是，对象内部结构对于RDD而言却是不可知的，而DataFrame是一种以RDD为基础的分布式数据集，提供了详细的结构信息。

使用DataFrame作为数据抽象，可以带来很多好处，比如，可以在Spark组件间获得更好的性能和更优的空间效率。DataFrame的突出优点是表达能力强、简洁、易组合、风格一致。下面用一个实例来展示DataFrame强大的表达能力和组合能力。

### DataFrame 创建存储

DataFrame支持多种存储方式
-  Parquet
-  JSON
-  CSV
- 数据库和Hive

 >[!TIP]
 >Parguet是Spark的默认数据源，很多大数据处理框架和平台都支持
 >Parguet格式，它是一种开源的列式存储文件格式，提供多种l/O优化措施

DataFrame与Hive
- Spark with Hive
	Spark 仅仅是把 Hive 当成是一种元信息的管理工具
- Hive on Spark
	Hive 采用 Spark 作为底层的计算引擎

### DataFrame 的基本操作

DataFrame 支持两种操作风格
- DSL语法风格
	DSL（Domain Specific Language）意为“领域专用语言”，DSL语法类似于RDD中的操作，允许开发者通过调用方法对DataFrame内部的数据进行分析。
- SQL语法风格
	熟练使用SQL语法的开发者，可以直接使用SQL语句进行数据操作。相比于DSL语法风格，在执行SQL语句之前，需要通过DataFrame实例创建临时视图。创建临时视图的方法是调用DataFrame实例的

## DataSet

### DataFrame、DataSet和RDD的区别
![image.png](https://s2.loli.net/2025/04/27/95HrCmUlRhtwNGa.png)

![image.png](https://s2.loli.net/2025/04/27/Qg9spL6CYxKuldi.png)


RDD的优点是：
（1）相比于传统的MapReduce框架，Spark在RDD中内置了很多函数操作（比如map、filter、sort等），方便处理结构化或非结构化数据；
（2）面向对象编程，直接存储Java对象，类型转化比较安全。

RDD的缺点是：
（1）没有针对特殊场景进行优化，比如对于结构化数据处理相对于SQL来比显得非常麻烦；
（2）默认采用的是Java序列化方式，序列化结果比较大，而且数据存储在Java堆内存中，导致垃圾回收比较频繁。

DataFrame的优点是：
（1）结构化数据处理非常方便支持Avro、CSV、Elasticsearch、Cassandra等类型数据，也支持Hive、MySQL等传统数据表；
（2）可以进行有针对性的优化，比如采用Kryo序列化，由于Spark中已经保存了数据结构元信息，因此，序列化时就不需要带上元信息，这就大大减少了序列化开销，而且数据保存在堆外内存中，减少了垃圾回收次数，所以运行更快。

DataFrame的缺点是：
（1）不支持编译时类型安全，运行时才能确定是否有问题；
（2）对于对象支持不友好，RDD内部数据直接以Java对象存储，而DataFrame内存存储的是Row对象，而不是自定义对象。

DataSet整合了RDD和DataFrame的优点，支持结构化和非结构化数据；和RDD一样，DataSet支持自定义对象存储；和DataFrame一样，DataSet支持结构化数据的SQL查询；Dataset采用堆外内存存储，垃圾回收比较高效。

DataFrame是DataSet的特例

### DataFrame、DataSet和RDD相互转换

![image.png](https://s2.loli.net/2025/04/27/5dkb7lH3Ix4EzO8.png)

## Spark SQL 中join操作实现

- 嵌套循环连接(NLJ， Nested Loop Join )
- 排序归并连接妾（SMJ，Shuffle SortMerge Join）
- 哈希连接（HJ，Hash Join)

分布式计算环境中，数据在网络中的分发主要有2种方式
- Shuffle
- 广播

Spark SQL 支持 5 种分布式 Join 策略
![image.png](https://s2.loli.net/2025/04/27/DLH1SpgJa8nf92B.png)

Shuffle分发方式
![image.png](https://s2.loli.net/2025/04/27/jcC3gexIiyZJz72.png)

广播分发方式
![image.png](https://s2.loli.net/2025/04/27/vqSpYoJjCztfyr1.png)
