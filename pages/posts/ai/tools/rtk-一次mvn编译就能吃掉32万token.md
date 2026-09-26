---
title: rtk-一次mvn编译就能吃掉32万token
date: 2026-08-31
updated: 2026-08-31
categories:
  - AI
  - 工具与框架
tags:
  - rtk
  - token
---
# rtk：一次 mvn 编译能吃掉 32 万 token，而你只需要其中 628 个

公司的模型接口切到内部网关之后，额度从"基本不用想"变成了要算着花。这时候值得看一眼额度实际花在哪里——大概率不是花在你写的提示词上，而是花在 Agent 替你跑命令、然后把命令输出整段塞进上下文这件事上。

Java 技术栈在这件事上是重灾区。下面是我在本机 simcenter（7 模块 Maven 工程）上的实测，两个数字放一起看就够了：

|                                                  | 输出体积                  | 约合 token |
| ------------------------------------------------ | ------------------------- | ---------- |
| `mvn -pl simcenter-service -am compile` 原生输出 | 6,377 行 / 1,285,527 字节 | ≈ 321,000  |
| 同一条命令走 `rtk mvn`                           | 26 行 / 2,515 字节        | ≈ 628      |

**一次成功的增量编译，原生输出就超过 32 万 token——比 200K 的上下文窗口还大。** 而这 32 万里，你真正需要的信息是"BUILD SUCCESS，6 个模块，5 秒"。

本文的实测环境：rtk 0.46.0（Homebrew，2026-08-26 发布的稳定版）、Maven 3.x、macOS、Claude Code。数据均为 2026-08-31 本机实跑，命令和原始输出都留了对照。

- 仓库：https://github.com/rtk-ai/rtk
- 协议：Apache-2.0
- Star：77.9k / Fork：4.9k（截至 2026-08-31）
- 主要语言：Rust
- 最新稳定版：v0.46.0（2026-08-26）
- 平台：macOS / Linux / Windows

**一句话定位**：一个装在 Agent 和终端之间的 CLI 代理，把命令输出里 Agent 不需要读的部分过滤掉，再交给模型。它不改变命令行为，也不改变退出码。

---

## 一、那 32 万 token 到底是什么

这个数字大到不太可信，所以先拆开看。6,377 行输出里：

- `[INFO]` 6,364 行
- `[WARNING]` 10 行
- `[ERROR]` 2 行（是两个 `systemPath` 的历史遗留告警，不影响构建）

而 6,364 行 `[INFO]` 里最大的一块是这样的内容：

```
[INFO] Resolved tag [v20211210110741] [PersonIdent[penglai-admin, penglai-admin@tuya.com, Fri Dec 10 03:07:42 2021 +0000]], points at [commit f31942cd...]
[INFO] key [AnyObjectId[4575c027...]], tags => [[DatedRevTag{id=4575c027..., tagName='refs/tags/v20250211161200', date=26年8月31日 CST 上午11:18:48}]]
```

`Resolved tag` 885 行，`key [...] tags =>` 2,945 行，合计占了总输出的六成。来源是 `git-commit-id-plugin:2.2.3`——它在每个模块构建时把仓库里所有 git tag 列一遍，而这个插件是从 `tuya-boot-parent` 继承下来的，也就是说**用了公司 Java 脚手架的工程，默认都带这个行为，模块越多、仓库 tag 越多，输出翻得越快**。simcenter 六个模块，每个模块跑一次，于是 885 个 tag 被打印了六轮。

这是 Java 生态的一个结构性特点，不是某个项目配错了。Maven 的默认日志级别是 INFO，插件生态里又有大量插件把中间状态当 INFO 打，叠加多模块 reactor，输出量就是这个量级。相比之下，`cargo build` 或 `go build` 成功时基本是静默的。

**所以"Java 同学更该装 rtk"不是一句客套，是输出体积上的客观差异。**

---

## 二、过滤掉的和留下的

关键问题不是"压缩了多少"，而是"压缩掉的是不是你需要的"。我按四种日常场景实测了一遍。

### 编译成功

留下 26 行：reactor 里 6 个模块各一行 `Building xxx [n/6]`、`BUILD SUCCESS`、耗时、以及那几条 WARNING/ERROR 原文。885 个 git tag 全部消失。

### 编译失败

这是最该保真的场景。造两处错误（类型不兼容 + 未定义变量）：

```
[ERROR] COMPILATION ERROR :
[ERROR] /private/tmp/rtk-demo/src/main/java/demo/App.java:[4,17] 不兼容的类型: java.lang.String无法转换为int
[ERROR] /private/tmp/rtk-demo/src/main/java/demo/App.java:[5,28] 找不到符号
  符号:   变量 y
  位置: 类 demo.App
[INFO] BUILD FAILURE
```

文件路径、行号列号、错误原文一字未改，`符号:` / `位置:` 这两行续行也保留了。中文错误信息没有被编码破坏。

### 测试失败

原生 161 行 / 27,021 字节 ≈ 6,755 token，走 rtk 之后 24 行 / 1,112 字节 ≈ 278 token，降幅 95.9%。省掉的主要是 JUnit 堆栈里那 30 多行 `at org.junit.runners.ParentRunner...` 反射框架帧。留下的是：

```
[ERROR] demo.CalcTest.t1 -- Time elapsed: 0.006 s <<< FAILURE!
java.lang.AssertionError: expected:<3> but was:<-1>
	at demo.CalcTest.t1(CalcTest.java:4)
...
[ERROR] Results:
[ERROR]   CalcTest.t1:4 expected:<3> but was:<-1>
[ERROR]   CalcTest.t3:6 expected:<10> but was:<-2>
[ERROR] Tests run: 3, Failures: 2, Errors: 0, Skipped: 0
```

断言的期望值、实际值、失败所在的测试方法和行号都在，堆栈里指向业务代码的那一帧（`at demo.CalcTest.t1(CalcTest.java:4)`）也保留了，被删掉的是框架内部帧。这是排查时真正会读的部分。

### 退出码

三种情况实测：成功 `exit=0`，编译失败 `exit=1`，测试失败 `exit=1`。退出码原样透传，`&&` 串联和 CI 判断不受影响。

### 不认识的目标：原样透传

`mvn dependency:tree` 实测 586 行 / 42,379 字节，走 rtk 前后**完全一致，降幅 0%**。rtk 对没有专门过滤器的场景不做处理，也不会为了"看起来省了"而乱删。这是个好性质：它不会在你不知道的地方动手。

---

## 三、真正的代价：截断，以及为什么它比省下的 token 更值得关心

上面的降幅很漂亮，但过滤是有损的，而**有损的方式决定了它会不会害你**。

这一节是本文的重点，因为这里藏着一个能让 Agent 得出错误结论的坑。

### 坑长什么样

造 42 个失败的测试，看 rtk 输出的 Results 段：

```
[ERROR] Failures:
[ERROR]   BigTest.t0:4 expected:<10> but was:<-5>
[ERROR]   BigTest.t1:5 expected:<11> but was:<-4>
...（共 10 条）
[ERROR]   BigTest.t17:21 expected:<27> but was:<12>

… +32 more failures
[ERROR] Tests run: 43, Failures: 42, Errors: 0, Skipped: 0
```

**只展示了 10 条，剩下 32 条被折叠。** 如果 Agent 拿这 10 条去回答"哪些测试挂了""是不是都是同一个原因"，答案就是错的——而它自己不知道自己错了，因为 `Tests run: 43, Failures: 42` 这一行读起来足够权威，容易让人（和模型）觉得信息是完整的。

同样的事发生在编译上：60 处编译错误，rtk 输出 124 行 ERROR 后收尾。也发生在 grep 上：`rtk grep -rn 'public' simcenter-service` 末尾是 `+422 more files`。

### rtk 自己给了回捞的口子，但没人告诉 Agent 去用

好消息是这些截断**不是不可恢复的**。rtk 有一个 tee 机制：命令失败时把未过滤的原始输出完整写到磁盘，并在输出末尾附上路径：

```
[full output: "$HOME/Library/Application Support/rtk/tee/1788146999_mvn_test.log"]
```

实测这个 tee 日志里 42 条失败一条不少（40 条在 Results 段 + 详细段），完整堆栈 40 帧全在，共 1,609 行，且日志本身没有任何截断标记。**信息是在的，只是不在上下文里。**

问题出在这里：rtk 官方注入给 Agent 的指令文件（`RTK.md`，v0.46.0 里 `rtk init -g` 生成的那份）通篇讲的是"哪些命令省多少 token"，**一个字都没提截断和 tee 回捞**。我把官方模板全文过了一遍，`truncat` / `tee` / `full output` 三个关键词零命中。

于是默认状态下的行为是：rtk 折叠了 32 条失败，把回捞路径打在输出末尾，而 Agent 没有被告知那行字是什么意思、也没有被要求去读它。它会直接基于 10 条下结论。

### 还有一类是真的捞不回来

更需要警惕的是几个**不提供 tee 路径**的过滤器，损失既不可见也不可恢复：

- `rtk json`：200 元素的数组只留第 1 个，14,125 字节 → 118 字节，末尾一句 `... +199 more]`，无回捞路径。用它分析数据会直接导出错误结论。
- `rtk log`：500 条 INFO 全部丢弃，只留 ERROR。排查某个 reqId 的链路流转时用它，等于什么都没看到。

这两个的正确用法是绕开它们：JSON 用 `jq` 做收敛查询（让聚合在管道里完成，只让标量结果进上下文），日志用 `rg` 精确筛选或 `rtk proxy tail -n 500`。

### 一个次要但会咬人的细节：head 被改写了语义

Claude Code 的 hook 会把 `head -3 file` 改写成 `rtk read file --max-lines 3`。这两条命令**不等价**：

```
真实前 3 行：            rtk read --max-lines 3：
package demo;            package demo;
public class App {           }
  public static void...   [5 more lines]
```

`--max-lines` 是头尾采样，不是取前 N 行，而且实际给出的行数和 N 不是线性关系（实测 8 行文件：`--max-lines 3` 出 2 行、`4` 出 3 行、`6` 出 4 行）。如果 Agent 用它去读文件开头判断 package/import，会拿到拼接过的内容。

顺带一个实测结论：`exclude_commands` 拦不住这个改写。配 `["head"]`、`["read"]`、`["head","read"]` 三种写法，`head` 都照样被改写成 `rtk read`；但对 `git` / `curl` / `mvn` / `grep` 是生效的（配上之后不再改写）。**能被排除的只有那些"命令名 = rtk 子命令名"的场景，映射类改写（head→read、tail→read）绕不过去。** 需要真实的 `head` 行为时用 `rtk run 'head -3 file'`（`rtk run` 是原样执行、不过滤不追踪）。

另一头，`rtk read` 读完整文件是无损的：19,999 行 / 1,566,669 字节的文件，进出字节数完全一致，抽查第 10,000 行逐字符相同。所以"读整个文件"这条路径可以放心。

### 还有一个 tee 自身的上限

tee 日志默认 `max_file_size = 1048576`（1 MB）。simcenter 那个 1.28 MB 的输出被 tee 下来是 1,048,612 字节，末尾一行 `--- truncated at 1048576 bytes ---`，**连 `BUILD SUCCESS` 那几行都在被截掉的部分里**。所以对超大输出，tee 也不是完整的原文备份。真要拿全量，只有 `rtk proxy <原命令>` 重跑。

---

## 四、把这个坑堵上：提示文档 + hook 两层告知

上面这些不是不能解决，而是**默认没人告诉 Agent**。补两层就够了。

### 第一层：在 RTK.md 里写一段可信度守则

官方模板只讲省了多少，需要自己补上"什么时候不能信"。我在 `~/.claude/RTK.md` 里加的是这样一段（照抄可用）：

```markdown
## 结果可信度守则

实测无损、可放心用：rtk read（读完整文件字节级一致）、rtk mvn（编译/测试错误
原文完整保留 + 退出码正确）、rtk grep -c（计数不受展示截断影响）、rtk git status。

以下三条是真实的信息损失点，必须遵守：

1. 看到 `+N more` / `… +N more failures` / `(N lines truncated)` 时，禁止基于
   已展示内容下「全部 / 都是 / 没有 / 一共」类结论。要么按提示的 tee 路径回捞，
   要么 rtk proxy <原命令> 重跑取全量。

2. 禁止用 rtk json 分析数据。它对数组只保留第 1 个元素，且不提供 tee 回捞路径
   ——损失既不可见也不可恢复。改用 jq 的收敛查询。

3. 排查链路 / 时序 / 某个 reqId 的流转时禁止用 rtk log。它只保留 ERROR，
   INFO 全部丢弃且无回捞路径。改用 rg 精确筛选，或 rtk proxy tail -n 500 <file>。

## 回捞 tee 日志的正确姿势

tee 路径里的 $HOME 是字面量，不是展开后的路径。用 Read 工具会报文件不存在，
必须走 Bash 让 shell 展开：
  rtk run 'grep -nE "ERROR|FAIL|Tests run" "$HOME/Library/.../xxx.log"'
```

最后那条容易被忽略：rtk 打出来的路径是 `"$HOME/Library/Application Support/rtk/tee/..."` 字面量，Agent 如果直接把它喂给 Read 工具会拿到"文件不存在"，然后可能就放弃回捞了。

### 第二层：用 PostToolUse hook 在截断发生时主动提醒

提示文档是静态的，模型可能读了不照做。更硬的做法是在**截断实际发生的那一刻**把提醒推到上下文里。Claude Code 的 `PostToolUse` hook 支持 `additionalContext`，正好能干这个。

脚本（已实测通过，四类场景都覆盖）：

```bash
#!/usr/bin/env bash
# PostToolUse(Bash)：检测 rtk 截断标记，提醒 agent 可回捞完整输出
set -uo pipefail
payload=$(cat)
out=$(printf '%s' "$payload" | python3 -c 'import json,sys; d=json.load(sys.stdin); r=d.get("tool_response") or {}; print(r.get("stdout","") if isinstance(r,dict) else str(r))' 2>/dev/null) || exit 0

# 1) 带 tee 回捞路径的截断（可恢复）
tee_path=$(printf '%s' "$out" | sed -n 's/.*\[full output: "\{0,1\}\([^]"]*\)"\{0,1\}\].*/\1/p' | tail -1)
[ -z "$tee_path" ] && tee_path=$(printf '%s' "$out" | sed -n 's/.*see remaining: tail -n +[0-9]* "\{0,1\}\([^]"]*\)"\{0,1\}\].*/\1/p' | tail -1)

# 2) 无回捞路径的有损过滤器（不可恢复）
lossy=$(printf '%s' "$out" | grep -cE '\.\.\. \+[0-9]+ more\]|info messages$' || true)

msg=""
if [ -n "$tee_path" ]; then
  msg="rtk 截断了本次输出。完整原文在 tee 日志：$tee_path
禁止基于已展示片段下「全部/都是/没有/一共」类结论。要回捞请用 Bash（不要用 Read 工具，路径里的 \$HOME 需要 shell 展开）：
  rtk run 'grep -nE \"ERROR|FAIL|Tests run\" \"$tee_path\"'
  rtk run 'sed -n \"1,200p\" \"$tee_path\"'"
elif [ "$lossy" -gt 0 ]; then
  msg="本次输出经过了无 tee 回捞的有损过滤（rtk json 只留数组首元素 / rtk log 只留 ERROR）。
不要据此下全量结论。改用收敛查询：rtk jq '[.result[]|select(...)]|length' file，或 rtk proxy <原命令> 重跑取全量。"
fi

[ -z "$msg" ] && exit 0
python3 -c '
import json,sys
print(json.dumps({"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":sys.argv[1]}}))
' "$msg"
```

挂到 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$HOME/.claude/hooks/rtk-truncation-notice.sh"
          }
        ]
      }
    ]
  }
}
```

实测行为：42 个测试失败的场景触发提醒并给出 tee 路径；`rtk json` / `rtk log` 触发"不可恢复"分支；成功构建（无截断）不触发，一个多余 token 都不加。

这个设计的取舍值得说清楚：**它只在真的发生截断时才花 token**。让 Agent 无条件先读 tee 日志，就把省下来的又还回去了；反过来完全不提醒，就会得出错误结论。在"截断发生的那一刻"给一句话，是成本和可靠性之间的平衡点。

---

## 五、装它、和看它省了多少

安装：

```bash
# macOS / Linux
brew install rtk
# 或（官方安装脚本）
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Windows：仓库 Releases 页有 msvc zip
```

接入 Claude Code（会装一个 PreToolUse hook + 一份 RTK.md）：

```bash
rtk init -g
# 之后重启 Claude Code
```

hook 装好后是完全透明的：你写 `mvn -pl outdoors-service -am test`，hook 把它改写成 `rtk mvn -pl outdoors-service -am test` 再执行。实测改写延迟在 10ms 量级，Agent 侧零感知、零额外 token。

装完先验一下没装错——crates.io 上有个同名的 `rtk`（Rust Type Kit），装错了 `rtk gain` 会报 command not found：

```bash
rtk --version   # 应输出 rtk 0.46.0
rtk gain        # 应能跑
```

`rtk gain` 是它最值得一看的命令，直接告诉你省了多少。我本机累计：

```
Total commands:    11,299
Tokens saved:      13.0M (66.6%)
Total exec time:   95m30s (avg 507ms)

 1.  rtk mvn -pl simcenter...     15    4.9M   99.8%
 2.  rtk read                   2374    2.4M   13.1%
 4.  rtk grep                   2006  584.9K   26.7%
```

**排第一的是 15 次 mvn 调用，省下 490 万 token——占总节省量的 38%。** 而 `rtk read` 调用了 2,374 次才省下 240 万。这个对比就是"Java 同学优先装"的全部理由：Maven 的单次收益是其他命令的三个数量级。

另外两个命令值得跑：

```bash
rtk discover   # 扫 Claude Code 历史，找出还没走 rtk 的命令
rtk session    # 看各会话的 rtk 覆盖率
```

我本机 `rtk discover` 的结果是：过去 30 天 1,900 条 Bash 命令里，519 条本来可以走 rtk 但没走，折合约 18 万 token。`rtk session` 显示平均覆盖率 45%。**装了 hook 不等于全覆盖**——Claude Code 的内置 Read / Grep / Glob 工具不经过 Bash，因此绕过了 hook；要吃到收益得显式用 `rtk read` / `rtk grep`，或在 RTK.md 里写清楚优先用哪个。

---

## 六、边界与代价

说完好处，把代价列清楚：

- **过滤是有损的，且部分损失无回捞路径**。`rtk json` / `rtk log` 是明确不该用于分析的，见第三节。这是本文花最多篇幅的部分，也是引入 rtk 最需要配套的东西。
- **tee 有 1 MB 上限**。超大输出的 tee 日志本身会被截断，末尾的 `BUILD SUCCESS` 都可能丢。要全量只能 `rtk proxy` 重跑。
- **`head` / `tail` 的语义被改写且无法排除**。需要真实行为时走 `rtk run '...'`。
- **节省数字是"输出字节的降幅"，不是"账单的降幅"**。rtk 自己在 README 里也这么讲：token 数是按 `bytes / 4` 估的，没有内置 tokenizer；而且过滤掉的内容如果本来会命中 prompt cache，实际省下的钱少于字节降幅。把它当"上下文占用降幅"看更准确。
- **多了一个进程和一个 hook**。实测平均 507ms（大头是 mvn 本身的执行时间，hook 改写在 10ms 量级），可以忽略；但它确实是链路上多出来的一环，出问题时要多想一层"是不是 rtk 过滤掉了"。`rtk proxy <原命令>` 是排查这个的第一步。
- **项目健康度是"活跃但迭代快"**。77.9k star、Apache-2.0、Rust 单二进制无运行时依赖，Homebrew 近 30 天 18,204 次安装。但它 2026-01 才建仓，稳定版从 v0.43 到 v0.46 只隔了两个月，develop 分支上跑着 `dev-0.47.0-rc.378` 这种量级的预发布号。**迭代快意味着过滤器行为可能变**，所以第三节那些实测结论标了版本号（0.46.0），升级后值得抽两条重新验一遍。

---

## 七、适用场景

### 优先装

- **Java / Maven 多模块工程**：这是收益最大的场景，没有并列第二。单次 compile 三个数量级的降幅，来自 Maven INFO 日志 + 多模块 reactor + 插件生态的叠加，属于结构性的，不会因为你改了配置就消失。用了公司 `tuya-boot-parent` 脚手架的工程尤其明显（`git-commit-id-plugin` 会把全部 git tag 按模块打一遍）。
- **额度紧、上下文频繁被压缩的**：如果你常看到会话被自动压缩、或者一个构建输出就把窗口占掉一半，rtk 直接解决的是这个。
- **跑测试频繁的**：JUnit 堆栈里的框架帧占比极高，实测 95.9% 降幅，且断言值和业务代码那一帧完整保留。

### 收益一般

- **Go / Rust 工程**：`cargo build` / `go build` 成功时本来就基本静默，rtk 的过滤器对它们仍有效，但绝对量远小于 Maven。
- **前端工程**：`tsc` / `eslint` / `vitest` 有专门过滤器，但这类工具本身的输出已经比 Maven 克制得多。

### 不建议直接用

- **需要逐条核对全量输出的场合**：链路排查、数据分析、审计比对。这些场景要么走 `rtk proxy` 重跑，要么用 `jq` / `rg` 做收敛查询，不要指望截断后的展示。
- **没有配套告知机制的团队**：只装 rtk、不补第四节那两层告知，Agent 会在截断上得出错误结论。**这种情况下省下的 token 是负收益**——重新排查一次错误结论的成本，远高于那 32 万 token。

---

## 结论

如果你写 Java、用 Maven、并且最近感觉到额度在收紧，rtk 值得装，而且应该排在其他省 token 的手段前面——因为你的单次构建输出量级本来就是别人的一千倍，收益完全不成比例。

但**别只装二进制**。rtk 官方注入的指令文件通篇在讲省了多少，一句没讲什么时候不能信；截断的信息其实躺在 tee 日志里，只是没人告诉 Agent 去捞。把第四节那两层（RTK.md 的可信度守则 + PostToolUse 的截断提醒）一起配上，才是完整的引入方式。少了这一步，你省下的是 token，赔进去的是结论的可靠性。

---

## 参考

- [rtk-ai/rtk - GitHub](https://github.com/rtk-ai/rtk)
- [rtk 官方文档与配置指南](https://www.rtk-ai.app/guide/getting-started/configuration)
- [How RTK Reduces LLM Token Usage for AI Coding Agents - dev.to](https://dev.to/arshtechpro/how-rtk-reduces-llm-token-usage-for-ai-coding-agents-2kfd)
- [I saved 10M tokens (89%) on my Claude Code sessions - r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1r2tt7q/i_saved_10m_tokens_89_on_my_claude_code_sessions/)
- [Claude Code Hooks 官方文档](https://docs.claude.com/en/docs/claude-code/hooks)
- [git-commit-id-plugin - GitHub](https://github.com/git-commit-id/git-commit-id-maven-plugin)
