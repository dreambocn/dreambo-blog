---
title: Flink编程 DataStreamAPl
date: 2025-05-26
updated: 2025-05-26
categories:
  - 大数据开发
  - 实验
tags:
  - Flink
  - DataStream
  - 实验
description: "通过 Java 示例学习 Flink DataStream API，覆盖数据读取、滚动与滑动窗口、会话窗口、乱序水位线和迟到数据处理。"
---
## 准备工作
创建一个WaterSensor类
![image.png](https://picture.dreambo.cn/2026/10/17/23/NrUj9y3RdHS84OX-4b99174eee79b9ab57a25550139c52b3.png)

---
## 读取数据
从集合中读取数据
![image.png](https://picture.dreambo.cn/2026/10/17/23/fDFxdcpGQKkZTqX-dc613880d847540adc7e2ad51abff869.png)

运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/OZ6GMiyPhKS7WuU-232cbe5da682cbd37c5ab874d080b14b.png)

---

使用source读取
先配置依赖
![image.png](https://picture.dreambo.cn/2026/10/17/23/vyeAJUa4nok5qxQ-0c7a64bf824352ac4e9805cf6fc88f56.png)

编写程序读取file内容
![image.png](https://picture.dreambo.cn/2026/10/17/23/gV1o8kK4J75rDsP-7a93a712fd4717083600a7117a45d2ba.png)

运行结果
![image.png](https://picture.dreambo.cn/2026/10/17/23/fLn2cyxXCVI4lsr-1a92103a7b830f1ef206c9eaf5e046c4.png)

## 三种窗口 TimeWindowDemo

滚动窗口
窗口长度10秒
![image.png](https://picture.dreambo.cn/2026/10/17/23/J7EYwPOBnNfKSeW-ecbc955a11119b6ea9c399ff13857611.png)

滑动窗口
长度10s，步长5s
![image.png](https://picture.dreambo.cn/2026/10/17/23/LFgjHJatSbBkuXq-3e957d25c56e5afcebb7a6ba60a87b0b.png)

会话窗口
间隔5s
![image.png](https://picture.dreambo.cn/2026/10/17/23/iWu7rB3QI6PyUgT-da531d684453e8878e570a6866d7e806.png)

动态会话窗口
会话间隔时间随ts值变动。
![image.png](https://picture.dreambo.cn/2026/10/17/23/lcvOZnkYafDhTUb-d05f9a281d258a76b12c4bf73b38fc34.png)

完整代码
![image.png](https://picture.dreambo.cn/2026/10/17/23/u4npkOvqhHC6Q1l-f1ae44d3cc43862e6eaeb576745ce5bd.png)


---

## 乱序水位线 WatermarkOutOfOrdernessDemo

我设置的允许乱序时间为4s，也就是说在ts=1n+4时才会统计对应的(10(n-1),10n)区域数据，并不在新接收相关桶内数据。
![image.png](https://picture.dreambo.cn/2026/10/17/23/7TfVuwKmPXCH2s8-acd2aea3c1c2224ac9cad7f4ddbbd8f7.png)

---
## 运行迟到 WatermarkLateDemo
可以看到再叠加允许乱序时间和允许迟到时间后最大的TS是16，经过测试在输入16之前，所有的小于10的数据都正常被收录，但是当输入16后的 songyuanbo,9,9 这一列就无法被收录了随即抛弃不理。
![image.png](https://picture.dreambo.cn/2026/10/17/23/21YwQreTH7FpGZu-bf615ba1c433cd8bb261bd138e1fa31d.png)

