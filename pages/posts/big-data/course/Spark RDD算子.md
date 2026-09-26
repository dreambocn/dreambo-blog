---
title: Spark RDD算子
date: 2025-03-01
updated: 2025-03-01
categories:
  - 大数据开发
  - 课程笔记
tags:
  - Spark
  - 大数据
---
1. Map算子：f 为一个函数执行map时,遍历数据并使用 f 产生新RDD
2. MapPartition：一次处理一个分区数据
3. MappationWithIndex：比MapPartition多一个参数表示分包号
4. flatMap：类似Map, f 返回一个集合并将其中元素拆分出来放新RDD中
5. glom：将RDD中每一个分区变成一个数组并放置于新RDD,元素类型一致
6. groupby：按传入参数返回值分组,相同的key对应值放入迭代器
7. filter：接收一个返回bool的函数，RDD调用filter，对每个元素调用f，若为twue则添加到新RDD
8. sample：从大量数据中采样
9. distinct：去重内部元素
10. coalesce：缩减分区数，用于大数据集过滤后，提高小数据效率
11. repartition：内执行coalesce shuffle 默认true
12. sortBY：排序默认正序
13. union：对源RDD和参RDD求并集
14. subtract：去除两个RDD相同的元素，保留不同的
15. intersection：求交集
16. zip：两RDD从键值对形式合并
17. Partition：将RDD[K,V]中的K按指定Partitioner重分区，与源一致的不改动
18. ReduceByKey：将RDD[K,V]按相同的K对V聚合
19. groupByKey：对K操作 生成一个seq 不聚合
20. aggregateByKey：对K初值逐步迭代，合并结果
21. foldByKey：aggregateByKey的简化操作版
22. CombineByKey：针对相同K，将V合并成一个集合。
23. sortByKey：返回按照key进行排序的(K,V)的RDD
24. mapValues：针对于(K,V)形式的类型只对V进行操作
25. join：在类型为(K,V)和(K,W)的RDD上调用，返回一个相同key对应的所有元素对在一起的(K,(V,W))的RDD
26. cogroup：在类型为(K,V)和(K,W)的RDD上调用，返回一个(K,Iterable&lt;V&gt;，Iterable&lt;W&gt;))类型的RDD
27. foreach：遍历RDD中元素，并依次应用 f

共享变量
广播变量：分布式共享只读变量
	广播变量用来把变量在所有节点的内存之间进行共享
累加器：分布式共享只写变量
	累加器则支持在所有不同节点之间进行累加计算 (比如计数或者求和)

