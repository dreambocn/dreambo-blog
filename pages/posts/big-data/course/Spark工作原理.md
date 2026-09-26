---
title: Spark工作原理
date: 2025-03-01
updated: 2025-03-01
categories:
  - 大数据开发
  - 课程笔记
tags:
  - Spark
  - 大数据
---
## Spark 介绍

- ==最初是基于内存计算==的批处理系统，用于构建大型的低延迟的数据分析应用
- 逐步发展为==内外存同时使用==的批处理系统
---
## 设计思想
### MapReduce 局限性
MapReduce缺点：
1. 编程容易但是基础算子太少，表达能力有限
2. Map端每次得到的结果要先写磁盘在由Reduce端拉取处理
3. 多作业间衔接涉及IO开销，应用程序延迟高
相比而言Spark优点：支持迭代计算，图形计算，中间结果不需要存盘，但是==Spark的Shuffle是需要存盘的==
### 数据模型 - RDD

RDD：一个数据集可分散在多个机器（分区），有弹性（可容错），不可变，其中元素可并行计算。
1. 弹性
	存储的弹性：内存与磁盘的自动切换；
	容错的弹性：数据丢失可以自动恢复；
	计算的弹性：计算出错重试机制；
	分片的弹性：可根据需要重新分片。
2. 分布式
	数据存储在大数据集群不同节点上
3. 数据集
	RDD封装了计算逻辑，并不保存数据
4. 数据抽象
	RDD是一个抽象类，需要子类具体实现
5. 不可变
	RDD封装了计算逻辑，是不可以改变的，想要改变，只能产生新的RDD，在新的RDD里面封装计算逻辑
6. 可分区、并行计算

RDD特性：
1. 一组分区，即是数据集的基本组成单位
2. 一个计算每个分区的函数
3. RDD之间的依赖关系
4. 一个Partitioner，即RDD的分片函数，控制分区的数据流向(==键值对==)
5. 一个列表，存储存取每个Partition的优先位置移动数据不如移动计算，除非资源不够

### 计算模型
[[数据处理的一般模式#Spark编程模式]]
RDD操作算子
创建：从本地内存或外部数据源创建RDD提供了数据输入的功能

| 操作算子                                                                      | 含义                                     |
| ------------------------------------------------------------------------- | -------------------------------------- |
| parallelize                                              | 从内存集合创建RDD                            |
| textFile                                            | 读取HDFS兼容的文件系统下的文件来创建RDD              |
| wholeTextFiles                                      | 读取HDFS兼容的文件系统下的文件夹中的所有文件来创建RDD        |
| hadoopFile | 读取HDFS兼容的文件系统下拥有任意inputFormat的文件来创建RDD |

转换：描述RDD的转换逻辑，提供对RDD进行变换的功能

| 转换操作      | 含义                                                         |
| ------------- | ------------------------------------------------------------ |
| map           | 对RDD中的每个记录都使用func进行转换，返回一个新的RDD         |
| filter        | 过滤出对RDD中的每个记录都使用func后返回值为true的记录        |
| flatMap       | 与map类似，但是对RDD中的每个记录可以映射成0个或多个新的记录  |
| mapPartitions | 与map类似，但是mapPartitions中的func是对每个分区进行操作     |
| union         | 两个RDD取并集得到一个新的RDD                                 |
| intersect     | 两个RDD取交集得到一个新的RDD                                 |
| groupByKey    | 将[K，V]键值对按键分组，返回一个[K,Iterable]对组成的新的RDD |
| reduceByKey   | 将键值对按键聚合，在每一个键的所有值上<br/>使用func，返回一个[K，V]对组成的新的RDD |
| sortByKey     | 将键值对按键进行排序，返回一个新的RDD                        |
| join          | [K，V1]和[K，V2]分别属于两个RDD，<br/>返回一个[K，（V1，V2)]组成的RDD |
| cogroup       | [K，V1]和[K，V2]分别属于两个RDD，返回一个<br/>[K,（Iterable，Iterable）]组成的RDD |

行动(Action)：标志转换结束，触发DAG生成

| 转换           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| reduce         | 对RDD中的记录按func聚合，这个func必须满足交换律和结合律      |
| collect()      | 收集RDD中的所有记录到driver中，返回一个Array                 |
| count()        | 返回RDD中记录的个数                                          |
| first()        | 返回RDD中的第一个记录                                        |
| take(n)        | 返回RDD中的前n个记录                                         |
| saveAsTextFile | 将RDD中的记录以文本文件的形式写入本地文件系统、HDFS或任何其他Hadoop支持的文件系统中的给定目录中 |
| countByKey     | 按key统计计数，返回一个由[K，Long]组成的Map                  |
| foreach        | 对RDD中的每个记录都使用func                                  |

逻辑计算模型：Operator DAG
- 从算子操作的角度来描述计算的过程
![image.png](https://s2.loli.net/2025/04/16/wQiq8rohy9AzlJe.png)
- 从RDD变换的角度来描述计算过程
![image.png](https://s2.loli.net/2025/04/16/4iJxLVdHce2lpbN.png)
RDD Lineage(DAG拓扑结构）
- RDD读入外部数据源进行创建
- RDD经过一系列的转换（Transformation）操作，每一次都会产生不同的RDD，供给下一个
转换操作使用
- 最后一个RDD经过“动作"操作进行转换，并输出到外部数据源
Spark系统保留RDDLineage的信息
为了进行容错恢复和执行优化

RDD通过toDebugString查看RDD Lineage

RDD只读不可变
只读：本质上一个只读的对象集合，RDD经创建后，不能进行修改
不可变：通过在其他RDD上执行确定的转换操作（如map、join和group by）而得到新的RDD，而不是改变原有的RDD

物理计算模型：Operator DAG
- 分布式架构中，DAG中的操作算子实际上由若干个实例任务(Task)来实现
- 每个Task通常负责处理RDD的一个分区
---
## 体系架构 
### 抽象架构图
![image.png](https://s2.loli.net/2025/04/16/LxSKwuV3zhBU1kA.png)

- Cluster Manager
	集群管理器：负责管理整个系统的资源监控工作节点
- Executor
	执行器：负责任务执行Executor是运行在工作节点上的一个进程，它启动若干个线程Task或线程组TaskSet来进行执行任务
-  Driver
	驱动器：负责启动应用程序的主方法并管理作业运行

### Standalone 架构图
![image.png](https://s2.loli.net/2025/04/16/LXc39Oj84qikWgr.png)

Driver逻辑上独立于主节点、从节点以及客户端，但是根据应用程序的client和cluster方式运行时，Driver的运行方式不同
- Client方式：Driver和客户端以同一个进程存在
- Cluster方式：系统将由某一Worker启动一个进程作为Driver
### 应用执行流程
1. 启动Driver，以Standalone模式为例
	如果使用Client部署方式，客户端直接启动Driver，并向Master注册
	如果使用Cluster部署方式，客户端将应用程序提交给Master，由Master选择一个Worker启动Driver进程(DriverWrapper)
2. 构建基本运行环境，即由Driver创建SparkContext，向Cluster Manager进行资源申请，并由Driver进行任务分配和监控
3. ClusterManager通知工作节点启动Executor进程，该进程内部以多线程方式运行任务
4. Executor进程向Driver注册
5. SparkContext构建DAG并进行任务划分从而交给Executor进程中的线程来执行任务
---
## 工作原理
Driver内部工作原理
![image.png](https://s2.loli.net/2025/04/16/3e1SobFgv2pqANE.png)

### Stage 划分

RDD依赖关系
- 窄依赖表现为一个父RDD的分区对应于一个子RDD的分区或多个父RDD的分区对应于一个子RDD的分区
- 宽依赖则表现为存在一个父RDD的-个分区对应一个子RDD的多个分区
>[!TIP]
>通过dependencis方法查看RDD依赖

通过依赖关系进行Stage划分
- 分析各个RDD的偏序关系生成DAG，再通过分析各个RDD中的分区之间的依赖关系来决定如何划分Stage
- 具体划分方法：
	在DAG中进行反向解析，遇到宽依赖就断开
	遇到窄依赖就把当前的RDD加入到Stage中为
	什么将窄依赖尽可能划分在同一个Stage?
	减少数据Shuffle开销、提高流水线化执行效率、减少任务调度开销、优化资源利用率
### Stage 类型
 - ShuffleMapStage
	输入/输出
	- 输入可以是从外部获取数据，也可以是另一个ShuffleMapStage的输出
	- 以Shuffle为输出，作为另一个Stage开始
	特点
	- 不是最终的Stage，在它之后还有其他Stage
	- 它的输出一定需要经过Shuffle过程，并作为后续Stage的输入
	- 在一个DAG里可能有该类型的Stage，也可能没有该类型Stage

- ResultStage
	输入/输出
	- 其输入可以是从外部获取数据，也可以是另一个ShuffleMapStage的输出
	- 输出直接产生结果或存储
	特点
	- 最终的Stage
	- 在一个DAG里必定有该类型Stage
	因此，一个DAG含有一个或多个Stage,其中至少含有一个ResultStage

## Stage 内部
所有依赖关系都是窄依赖，可以实现流水线方式进行数据传输
## Stage 之间
所有依赖关系都是宽依赖不可以实现pipeline方式进行数据传输只能Shuffle
- Stage之间的数据传输需要进行Shuffle，该过程与MapReduce中的Shuffle类似
## 应用与作业
- Application：用户编写的Spark应用程序
- Job：一个Job包含多个RDD及作用于相应RDD转换操作，其其中最后一个为action
- MapReduce vs. Spark
	MapReduce中一个应用就是一个作业
	Spark中的一个应用可以由多个作业来构成
- Stage：一个Job会分为多组Task，每组Task被称为Stage，或者也被称为TaskSet
	Job的基本调度单位
	代表了一组关联的、相互之间没有Shuffle依赖关系的任务组成的任务集
- Task：运行在Executor上的工作单元

逻辑执行角度
	
- 一个Application=一个或多个DAG
- 一个DAG=一个或多个Stage
- 一个Stage=若干窄依赖的RDD操作

物理执行角度

- 一个Application=一个或多个Job
- 一个Job=一个或多个TaskSet
- 一个TaskSet=多个没有Shuffle关系的Task

---
# 容错机制
## 故障类型
Master故障：ZooKeeper配置多个Master
Worker故障
Executor故障
Driver故障：重启
## RDD持久化
由于计算过程中会不断地产生新的RDD，所以系统不能将所有的RDD都存在内存一旦达到相应存储空间的阀值，Spark会使用置换算法（例如，LRU）将部分RDD的内存空间腾出

RDD提供的持久化接口
- persist(StorageLevel)
	- 接受StorageLevel类型参数，可配置各种级别
	- 持久化后的RDD将会保留在工作节点的中，可重复使用
- cache()：缓存
	- 相当于persist(MEMORY_ONLY)

*StorageLevel*
MEMORY_ONLY:
	在JVM中缓存Java的对象。如果内存不足，直接丢弃某些partition
MEMORY_AND_DISK:
	在JVM中缓存Java的对象。如果内存不足，则将某些partitions写入到磁盘中
MEMORY_ONLY_SER:
	在内存为每个partition存储一个byte数组，数组内容为当前partition中Java对象的序列化结果
MEMORY_AND_DISK_SER:
	与MEMORY_AND_DISK类似，但每个分区存储的是Java对象序列化后组成的byte数组
DISK_ONLY:
	将每个分区的数据序列化到磁盘中

## 故障恢复
基于RDDLineage恢复
- 利用RDDLineage的故障恢复
	重新计算丢失分区
	重算过程在不同节点之间可以并行
- 与数据库恢复的比较
	RDDLineage：记录粗粒度的操作
	数据复制或者日志：记录细粒度的操作
### 检查点
- 前述机制的不足之处
	Lineage可能非常长
	RDD持久化机制保存到集群内机器的磁盘，并不完全可靠
- 检查点机制将RDD写入外部可靠的(本身具有容错机制)分布式文件系统，例如HDFS
	在实现层面，写检查点的过程是一个独立的作业，在用户作业结束后运行