---
title: 复杂的多表查询SQL
date: 2022-04-01
updated: 2022-04-01
categories: SQL 笔记
tags:
  - SQL
  - 笔记
top: 1
---
# 复杂的多表查询SQL

楔子：突然有一天老师叫我写一个复杂的SQL多表查询语句，可能是因为我之前在他底下做了一个项目，所有觉得我的项目内本来就有复杂的SQL语句，但是真的做项目的时候前期根本没有精打细算，所以写的SQL都是简单的查询根本没有往复杂里写，所以就有了今天的问题*一个复杂的多表查询SQL*。

## 表结构展示

![tg_project](https://s2.loli.net/2024/09/25/7rJ2ctYkSmBqfE5.png)

## SQL查询语句展示

```mysql
-- 定义一个公用表表达式 (CTE) 用于计算各专业的学分
WITH CourseCredits AS (
    SELECT
        mi.major_id,  -- 专业ID
        mi.major_CN_name AS major_name,  -- 专业名称
        c.college_name,  -- 学院名称
        -- 计算通识必修课A的总学分，排除“中共党史”课程
        SUM(IF(co.course_type = '通识必修课A' AND co.course_name NOT LIKE '中共党史', co.credits, 0)) AS 通识必修课A,
        -- 计算学科基础课B的总学分
        SUM(IF(co.course_type = '学科基础课B', co.credits, 0)) AS 学科基础课B,
        -- 计算专业基础课C的总学分
        SUM(IF(co.course_type = '专业基础课C', co.credits, 0)) AS 专业基础课C,
        -- 计算专业方向课Z的总学分
        SUM(IF(co.course_type = '专业方向课Z', co.credits, 0)) AS 专业方向课Z,
        -- 计算独立实践环节的总学分
        (SELECT SUM(p.credit)
            FROM practice p
            WHERE p.major_id = mi.major_id
            AND p.enrollment_year = mi.enrollment_year) AS 独立实践环节D
    FROM
        major_info mi  -- 主要信息表
    JOIN
        college c ON mi.major_id = c.major_id  -- 连接学院信息
    JOIN
        course co ON mi.major_id = co.major_id  -- 连接课程信息
    WHERE
        c.college_name = '计算机科学与技术学院'  -- 只选择计算机科学与技术学院
        AND co.enrollment_year = mi.enrollment_year  -- 确保年度匹配
    GROUP BY
        mi.major_id, mi.major_CN_name, c.college_name  -- 按专业和学院分组
)

-- 主查询，选择所需字段并计算状态和合计
SELECT
    cc.major_id AS 专业编号,  -- 专业编号
    cc.major_name AS 专业名称,  -- 专业名称
    cc.college_name AS 学院名称,  -- 学院名称
    ui.user_name AS 负责人,  -- 负责人姓名
    -- 根据合计值与170的差的绝对值判断状态
    IF(ABS(
               COALESCE(cc.通识必修课A, 0) +
               COALESCE(cc.学科基础课B, 0) +
               COALESCE(cc.专业基础课C, 0) +
               COALESCE(cc.专业方向课Z, 0) +
               COALESCE(cc.独立实践环节D, 0) +
               10 + 10 - 170
       ) > 4, '不符合', '符合') AS 状态,  -- 状态：符合或不符合
    -- 计算合计
    COALESCE(cc.通识必修课A, 0) +
    COALESCE(cc.学科基础课B, 0) +
    COALESCE(cc.专业基础课C, 0) +
    COALESCE(cc.专业方向课Z, 0) +
    COALESCE(cc.独立实践环节D, 0) +
    10 + 10 AS 合计,  -- 总学分
    -- 详细的学分信息
    cc.通识必修课A,
    cc.学科基础课B,
    cc.专业基础课C,
    cc.专业方向课Z,
    cc.独立实践环节D,
    10 AS 专业选修课E,  -- 专业选修课固定值
    10 AS 通识选修课F   -- 通识选修课固定值
FROM
    CourseCredits cc  -- 从之前定义的CTE获取数据
LEFT JOIN
    user_info ui ON cc.major_id = ui.major_id  -- 连接用户信息
JOIN
    user_state us ON ui.employee_id = us.employee_id  -- 连接用户状态
WHERE
    us.is_submit = 1;  -- 只选择已提交的记录
```

## 代码解释

最后跨了六张表，分别是`major_info`，`college`，`course`，`practice`，`user_info`，`user_state`。

### 数据表的解释

- `major_info`：存储专业信息。
- `college`：存储学院信息。
- `course`：存储课程信息
- `practice`：存储实训信息
- `user_info`：存储用户信息
- `user_state`：存储用户提交状态

### 查询目的

该查询旨在计算和展示学生应修各类课程学分统计表，并根据特定条件判断是否合规状态。

![image-20240925194740718](https://s2.loli.net/2024/09/25/3UiCWjAI5Oyftpa.png)

此为学生应修各类课程学分统计表效果图，我们的项目最终会生成的其中一张表。

### 主要步骤

1. **定义公用表表达式 (CTE)**:
   - 使用 `WITH` 子句定义 `CourseCredits`，汇总每个专业的课程学分信息。
   - 从 `major_info` 表获取专业基本信息，并连接到 `college` 和 `course` 表以获取相应的课程学分数据。
2. **汇总学分信息**:
   - 使用 `SUM` 和 `IF` 函数分别计算不同课程类型（通识必修课A、学科基础课B、专业基础课C、专业方向课Z）对应的总学分。
   - 通过子查询计算独立实践环节的学分。
3. **主查询**:
   - 从 `CourseCredits` CTE 获取汇总的学分信息，并连接 `user_info` 表以获取负责人的姓名。
   - 连接 `user_state` 表，以确认每个用户的提交状态（`is_submit`）。
4. **状态计算**:
   - 计算合计学分，并与170的差值取绝对值，如果大于4，则标记为“不符合”，否则标记为“符合”。
5. **结果输出**:
   - 最终输出包括专业编号、专业名称、学院名称、负责人、合计学分和状态等信息。

### 结果演示

![image-20240925195950696](https://s2.loli.net/2024/09/25/gBJ5VYZb93tXPyz.png)
