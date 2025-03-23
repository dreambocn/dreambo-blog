---
title: Linux下Kafka的安装与配置
date: 2022-04-01
updated: 2022-04-01
categories: 云计算与分布式 笔记
tags:
  - 云计算与分布式
  - 笔记
top: 1
---
## Linux下Kafka的安装与配置

### 下载与解压

进入[kafka]([阿帕奇卡夫卡 (apache.org)](https://kafka.apache.org/downloads))的官网

找到最新版下载链接

```
wget https://archive.apache.org/dist/kafka/2.8.2/kafka_2.13-2.8.2.tgz
```

![image-20240416101158798](https://s2.loli.net/2024/04/16/cKXsQ7bYCdo4xjT.png)

解压缩

```
tar zxvf kafka_2.12-2.8.2.tgz -C /opt/software/
```



### 配置环境变量

编辑系统环境变量

```
vim /etc/profile
```

添加两行

```
export KAFKA_HOME=/opt/software/kafka_2.13-3.7.0
export PATH=$KAFKA_HOME/bin:$PATH
```

立即生效

```
source /opt/profile
```



### 配置zookeeper和kafka server

修改config/zookeeper.properties配置

* 注：配置中已存在clientPort默认值是2181，这里仅做修改不添加。（不考虑安全应该可以不修改）

```
# 12181, 默认端口为2181
clientPort=12181
```

修改config/server.properties配置

```
broker.id不需要修改
#19093,默认端口为9092，仔细看文件中的提示，按照要求格式修改，可以只修改第一个，也可以修改前两个
port=19093
zookeeper.connect=localhost:12181
```



### 启动

```
# 启动zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties 1>/dev/null 2>&1 &
```

![image-20240418220658299](https://s2.loli.net/2024/04/18/3lFZ5fJvWd76X2w.png)

```
# 启动kafka
bin/kafka-server-start.sh config/server.properties 1>/dev/null 2>&1 &
```

![image-20240418220826759](https://s2.loli.net/2024/04/18/ArHMvnKDXL4Ih26.png)

```
# 创建Topic
bin/kafka-topics.sh --create --zookeeper localhost:12181 --replication-factor 1 --partitions 1 --topic pk1
```

![image-20240418220719511](https://s2.loli.net/2024/04/18/8XThcWy3NmnKzqd.png)

```
# 模拟生产者发送消息
bin/kafka-console-producer.sh --broker-list localhost:19093 --topic pk1
```

![image-20240418220906322](https://s2.loli.net/2024/04/18/4XyzHwg8TU2f9lO.png)

```
# 模拟消费者接受消息
bin/kafka-console-consumer.sh --bootstrap-server localhost:19093 --topic pk1
```

![image-20240418220924148](https://s2.loli.net/2024/04/18/tFREHycTZCgeNjV.png)

·
