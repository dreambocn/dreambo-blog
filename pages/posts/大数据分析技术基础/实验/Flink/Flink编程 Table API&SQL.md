---
title: Flink编程 Table API&SQL
date: 2025-05-26
updated: 2025-05-26
categories: 大数据开发 实验 Flink
tags:
  - 大数据开发
  - 实验
  - Flink
---
添加依赖
![image.png](https://s2.loli.net/2025/06/05/T2NwELM6n9OzBdp.png)

## SqlDemo
两者运行方式
API版
首先创建
![image.png](https://s2.loli.net/2025/06/08/pm2DyakNzb65JfR.png)

然后创建表
![image.png](https://s2.loli.net/2025/06/08/dcvOkjLV9HRSZm8.png)

然后使用api进行查询
![image.png](https://s2.loli.net/2025/06/08/nH4exZ5TdChtPz1.png)

最后执行
![image.png](https://s2.loli.net/2025/06/08/R87x9yWGJpkY5CQ.png)
完整
![image.png](https://s2.loli.net/2025/06/08/kCgiFajxB2RTVLE.png)


前面创建表环境和创建表和api形式一样
![image.png](https://s2.loli.net/2025/06/08/SwDTorC85ZIXB1G.png)

但是查询数据时直接可以使用sql语句查询
![image.png](https://s2.loli.net/2025/06/08/PqezuBnZEjybpOL.png)

执行代码也不一样，用的是executessql，也是执行sql查询语句
![image.png](https://s2.loli.net/2025/06/08/BFsYZEADt2jbzva.png)


完整代码
![image.png](https://s2.loli.net/2025/06/06/qQPv8HyljfztGT5.png)
运行结果
![image.png](https://s2.loli.net/2025/06/06/sBVe8qEJlriF42a.png)

## TableStreamDemo
创建环境
![image.png](https://s2.loli.net/2025/06/08/Z5a7JDjvSV12etz.png)
添加数据
![image.png](https://s2.loli.net/2025/06/08/qRUshBgXfkStlE5.png)

输入流转化成表格，然后进行sql查询，获得筛选表和总和表
![image.png](https://s2.loli.net/2025/06/08/rSOnRus81bPEkat.png)
表转流输出，将刚才sql查询的两个结果表转化成流数据输出
![image.png](https://s2.loli.net/2025/06/08/FWtmYr1BSsQGHAy.png)
因为调用了DataStreamAPI，所以需要execute一下
![image.png](https://s2.loli.net/2025/06/08/Ar4ZkHtzgm8QNsY.png)


代码
![image.png](https://s2.loli.net/2025/06/06/vFZyIWcTdwraXuM.png)
运行结果
![image.png](https://s2.loli.net/2025/06/06/aGjqwuzgU3KsTtZ.png)

## FlinkTableAPIKafka2Kafka
添加依赖
![image.png](https://s2.loli.net/2025/06/06/3ADUFm27zCjyNiX.png)

创建TableEnvironment环境设置并行度为1
![image.png](https://s2.loli.net/2025/06/08/8vyzVWILOQeMAuc.png)
创建kafka的source table表，指定表的结构，表格式化方式是json，还有表数据的来源是kafka的input_topic表
![image.png](https://s2.loli.net/2025/06/08/IOnRHaflY3Ndyme.png)
创建输出表，指定表的格式化方式是csv，表存储在out_topic表里
![image.png](https://s2.loli.net/2025/06/08/ksgpPc2M7lRiDXQ.png)
执行输出，将source表的数据全部读出插入到输出表中，由于两张表的格式化方式不同，会涉及到json转csv。
![image.png](https://s2.loli.net/2025/06/08/xEmvAu642tFhWls.png)


在kafka中创建两张表
![image.png](https://s2.loli.net/2025/06/06/TwdVvyPfksBzEY7.png)

启动生产者与消费者
生产者
![image.png](https://s2.loli.net/2025/06/06/71FzGC8IXNPLpJm.png)

消费者
![image.png](https://s2.loli.net/2025/06/06/OGhtDzYdoBKX6M2.png)

运行程序
![image.png](https://s2.loli.net/2025/06/06/jIQ2Vya3XCn1gNp.png)

输入数据
![image.png](https://s2.loli.net/2025/06/06/ZWuzOK9N3nwI4kD.png)
查看输出结果
![image.png](https://s2.loli.net/2025/06/06/FnzdcGUMaor1CL7.png)

完整代码
![image.png](https://s2.loli.net/2025/06/08/QtgxGOovq8nYTda.png)
