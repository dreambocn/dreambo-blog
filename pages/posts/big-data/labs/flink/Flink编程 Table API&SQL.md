---
title: Flink编程 Table API&SQL
date: 2025-05-26
updated: 2025-05-26
categories:
  - 大数据开发
  - 实验
tags:
  - Flink
  - SQL
  - 实验
description: "通过示例比较 Flink Table API 与 SQL 查询，演示数据流和表的互相转换，以及 Kafka 数据读取、计算与写出的流程。"
---
添加依赖
![image.png](https://picture.dreambo.cn/2026/10/17/23/T2NwELM6n9OzBdp-114dc55b1226e8521dad53fad8a63afc.png)

## SqlDemo
两者运行方式
API版
首先创建
![image.png](https://picture.dreambo.cn/2026/10/17/23/pm2DyakNzb65JfR-fe23e7cc29d56aeea4646b0e1d86e897.png)

然后创建表
![image.png](https://picture.dreambo.cn/2026/10/17/23/dcvOkjLV9HRSZm8-89a1834694488d573cf3c01b5e18f9e6.png)

然后使用api进行查询
![image.png](https://picture.dreambo.cn/2026/10/17/23/nH4exZ5TdChtPz1-02a4203be7980ca859584e68e37f7b06.png)

最后执行
![image.png](https://picture.dreambo.cn/2026/10/17/23/R87x9yWGJpkY5CQ-8cddd48f92b91ca80fae22f655e5b14a.png)
完整
![image.png](https://picture.dreambo.cn/2026/10/17/23/kCgiFajxB2RTVLE-7985deff53ac3b4833ffb92c8e4c23f1.png)


前面创建表环境和创建表和api形式一样
![image.png](https://picture.dreambo.cn/2026/10/17/23/SwDTorC85ZIXB1G-7efc3b8f31844499872ec3c7e75c6ffe.png)

但是查询数据时直接可以使用sql语句查询
![image.png](https://picture.dreambo.cn/2026/10/17/23/PqezuBnZEjybpOL-091c87ccbf6429e9e6ea79adc8af4e15.png)

执行代码也不一样，用的是executessql，也是执行sql查询语句
![image.png](https://picture.dreambo.cn/2026/10/17/23/BFsYZEADt2jbzva-0439ba4fa9eadc9abc8bd835a3c9bced.png)


完整代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/qQPv8HyljfztGT5-4e10a442501fe16d2230ed88160e4ed9.png)
运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/sBVe8qEJlriF42a-29eedee78aee87ecde46ede90fe5d03c.png)

## TableStreamDemo
创建环境
![image.png](https://picture.dreambo.cn/2026/10/17/23/Z5a7JDjvSV12etz-a6e9d63a36afe4b45bb32684269d0e49.png)
添加数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/qRUshBgXfkStlE5-5e4f19a61032e91076453ae930cb4d33.png)

输入流转化成表格，然后进行sql查询，获得筛选表和总和表
![image.png](https://picture.dreambo.cn/2026/10/17/23/rSOnRus81bPEkat-7bb493bfa5148ba05fdacc6d3cc0782e.png)
表转流输出，将刚才sql查询的两个结果表转化成流数据输出
![image.png](https://picture.dreambo.cn/2026/10/17/23/FWtmYr1BSsQGHAy-8c59ee2fe3c7ff7b34e56914d92242cb.png)
因为调用了DataStreamAPI，所以需要execute一下
![image.png](https://picture.dreambo.cn/2026/10/17/23/Ar4ZkHtzgm8QNsY-5c182aba18e59fa36e90d4ef28358458.png)


代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/vFZyIWcTdwraXuM-341f3b0bbbb61a2fb61c98a24d342135.png)
运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/aGjqwuzgU3KsTtZ-f972e362b3208fde2b2012788ff0f40d.png)

## FlinkTableAPIKafka2Kafka
添加依赖
![image.png](https://picture.dreambo.cn/2026/10/17/23/3ADUFm27zCjyNiX-9839f595e615c3368e6333e0c9713a21.png)

创建TableEnvironment环境设置并行度为1
![image.png](https://picture.dreambo.cn/2026/10/17/23/8vyzVWILOQeMAuc-eef92b913e2862df5f5777a9db62a474.png)
创建kafka的source table表，指定表的结构，表格式化方式是json，还有表数据的来源是kafka的input_topic表
![image.png](https://picture.dreambo.cn/2026/10/17/23/IOnRHaflY3Ndyme-e97da14ff6877f2f7db3e3b55fdca7f7.png)
创建输出表，指定表的格式化方式是csv，表存储在out_topic表里
![image.png](https://picture.dreambo.cn/2026/10/17/23/ksgpPc2M7lRiDXQ-8c3a38f796a78fe5250f368d2757dce5.png)
执行输出，将source表的数据全部读出插入到输出表中，由于两张表的格式化方式不同，会涉及到json转csv。
![image.png](https://picture.dreambo.cn/2026/10/17/23/xEmvAu642tFhWls-6112f1912e7d01944a6399c0e0e9e193.png)


在kafka中创建两张表
![image.png](https://picture.dreambo.cn/2026/10/17/23/TwdVvyPfksBzEY7-696d13c118e561b54af5a77dbfdd84ff.png)

启动生产者与消费者
生产者
![image.png](https://picture.dreambo.cn/2026/10/17/23/71FzGC8IXNPLpJm-576f163bbae4927e5c82e8178558b805.png)

消费者
![image.png](https://picture.dreambo.cn/2026/10/17/23/OGhtDzYdoBKX6M2-5580137c96d4f0519a8257f52001afa7.png)

运行程序
![image.png](https://picture.dreambo.cn/2026/10/17/23/jIQ2Vya3XCn1gNp-a987fa306d6edfc2266dfe90faf998d4.png)

输入数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/ZWuzOK9N3nwI4kD-fbf15815035b6293db8a3c81a2144a5c.png)
查看输出结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/FnzdcGUMaor1CL7-ee18961ae31c21600d86f8dea327f7fd.png)

完整代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/QtgxGOovq8nYTda-6ffacfae6850c4958d05df7924142536.png)
