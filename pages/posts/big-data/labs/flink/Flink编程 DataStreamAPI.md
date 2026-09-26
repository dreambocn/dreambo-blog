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
---
## 准备工作
创建一个WaterSensor类
![image.png](https://s2.loli.net/2025/06/03/NrUj9y3RdHS84OX.png)

---
## 读取数据
从集合中读取数据
![image.png](https://s2.loli.net/2025/06/03/fDFxdcpGQKkZTqX.png)

运行结果
![image.png](https://s2.loli.net/2025/06/03/OZ6GMiyPhKS7WuU.png)

---

使用source读取
先配置依赖
![image.png](https://s2.loli.net/2025/06/03/vyeAJUa4nok5qxQ.png)

编写程序读取file内容
![image.png](https://s2.loli.net/2025/06/03/gV1o8kK4J75rDsP.png)

运行结果
![image.png](https://s2.loli.net/2025/06/03/fLn2cyxXCVI4lsr.png)

## 三种窗口 TimeWindowDemo

滚动窗口
窗口长度10秒
![image.png](https://s2.loli.net/2025/06/04/J7EYwPOBnNfKSeW.png)

滑动窗口
长度10s，步长5s
![image.png](https://s2.loli.net/2025/06/04/LFgjHJatSbBkuXq.png)

会话窗口
间隔5s
![image.png](https://s2.loli.net/2025/06/04/iWu7rB3QI6PyUgT.png)

动态会话窗口
会话间隔时间随ts值变动。
![image.png](https://s2.loli.net/2025/06/04/lcvOZnkYafDhTUb.png)

完整代码
![image.png](https://s2.loli.net/2025/06/04/u4npkOvqhHC6Q1l.png)


---

## 乱序水位线 WatermarkOutOfOrdernessDemo

我设置的允许乱序时间为4s，也就是说在ts=1n+4时才会统计对应的(10(n-1),10n)区域数据，并不在新接收相关桶内数据。
![image.png](https://s2.loli.net/2025/06/04/7TfVuwKmPXCH2s8.png)

---
## 运行迟到 WatermarkLateDemo
可以看到再叠加允许乱序时间和允许迟到时间后最大的TS是16，经过测试在输入16之前，所有的小于10的数据都正常被收录，但是当输入16后的 songyuanbo,9,9 这一列就无法被收录了随即抛弃不理。
![image.png](https://s2.loli.net/2025/06/04/21YwQreTH7FpGZu.png)

