# 基本

Mermaid 是用文字画图的语法，代码围栏标记为 `mermaid`，阅读模式与 Publish 站点会渲染成图。第一行声明图的类型，之后逐行写内容。

~~~mermaid
flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[执行]
    B -->|否| D[结束]
~~~

注释用 `%%` 开头，独占一行或跟在行尾。

# 流程图 flowchart

第一行 `flowchart` + 方向：`TD`（上到下）、`LR`（左到右）、`BT`、`RL`。旧写法 `graph TD` 等价。

~~~mermaid
flowchart LR
    A[矩形] --> B(圆角矩形)
    B --> C([体育场形])
    C --> D{菱形判断}
    D --> E[(圆柱数据库)]
    E --> F[[子程序]]
    F --> G[/平行四边形/]
~~~

节点形状速查：

| 写法 | 形状 |
|---|---|
| `A[文字]` | 矩形 |
| `A(文字)` | 圆角矩形 |
| `A([文字])` | 体育场形（起止） |
| `A{文字}` | 菱形（判断） |
| `A[(文字)]` | 圆柱（数据库） |
| `A[[文字]]` | 双边矩形（子程序） |
| `A[/文字/]` `A[\文字\]` | 平行四边形（输入/输出） |
| `A((文字))` | 圆形 |

箭头速查：

| 写法 | 效果 |
|---|---|
| `A --> B` | 实线箭头 |
| `A --- B` | 实线无箭头 |
| `A -.-> B` | 虚线箭头 |
| `A ==> B` | 粗线箭头 |
| `A -- 文字 --> B` 或 `A -->|文字| B` | 带标签的箭头 |
| `A ---|文字| B` | 无箭头带标签 |
| `A & B --> C` | 多对一合并写 |

## 子图 subgraph

~~~mermaid
flowchart TD
    subgraph 仓内
        A[收货] --> B[分拣]
    end
    subgraph 仓外
        C[运输]
    end
    B --> C
~~~

# 时序图 sequenceDiagram

~~~mermaid
sequenceDiagram
    participant 客户
    participant 仓库
    participant 司机
    客户->>仓库: 下单
    仓库-->>客户: 确认
    仓库->>司机: 派单
    Note over 司机: 检查车辆
    司机->>客户: 送达
~~~

- `->>` 实线箭头，`-->>` 虚线箭头（常用于返回），`-x` 结尾打叉
- `Note over A: 文字` 注释；`Note right of A` 放右侧
- `alt 条件 / else / end`、`loop 条件 / end`、`opt` 分支与循环块
- `autonumber` 自动给消息编号

# 状态图 stateDiagram-v2

~~~mermaid
stateDiagram-v2
    [*] --> 待发货
    待发货 --> 运输中: 揽收
    运输中 --> 已签收: 送达
    运输中 --> 异常: 破损
    异常 --> 待发货: 退回重发
    已签收 --> [*]
~~~

- `[*]` 是起点/终点
- `状态 --> 状态: 触发事件`

# 甘特图 gantt

~~~mermaid
gantt
    title 项目排期
    dateFormat YYYY-MM-DD
    section 准备
    需求确认    :a1, 2026-10-01, 7d
    section 执行
    开发        :after a1, 14d
    测试        :2026-10-22, 7d
~~~

- `任务名 :id, 开始日期, 时长`
- 时长单位 `d`（天）`h`（小时）；`after a1` 接在某任务之后
- `crit` 标记关键路径，`done` / `active` 标记完成/进行中

# 类图 classDiagram

~~~mermaid
classDiagram
    class 车辆 {
        +String 车牌
        +int 载重
        +出发()
    }
    车辆 <|-- 卡车 : 继承
    车辆 o-- 司机 : 聚合
~~~

- `<|--` 继承，`o--` 聚合，`*--` 组合，`-->` 关联
- `+` 公开 `-` 私有 `#` 保护

# 饼图 pie

~~~mermaid
pie title 货量占比
    "整车" : 45
    "零担" : 35
    "快递" : 20
~~~

# 思维导图 mindmap

~~~mermaid
mindmap
  root((物流))
    仓储
      入库
      出库
    运输
      干线
      配送
~~~

# 此外

- 同一篇笔记里可放多个 `mermaid` 代码块，互不影响
- 节点文字里有括号、引号等特殊字符时，用双引号包住：`A["文字(含括号)"]`
- 节点 id 必须英文/数字，显示文字随便写：`node1[黑川物流]`
- 写错了 Obsidian 会在阅读模式显示语法错误提示，按提示行号改即可
