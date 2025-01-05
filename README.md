# Mermaid 图表生成工具

这是一个用于生成 Mermaid 图表的命令行工具。您可以通过配置文件定义图表，并使用各种参数来自定义图表的样式和输出。

## 使用方法

1. 创建配置文件
   - 复制 `config_template.yaml` 为 `config.yaml`
   - 在配置文件中定义您的图表
   - 每个图表需要指定名称和 Mermaid 代码

2. 运行命令生成图表
```bash
# 基本用法
python main.py --diagram <图表名称> --output <输出文件路径>

# 示例：生成序列图
python main.py --diagram sequence_diagram --output ./images/api_flow.png

# 使用自定义主题
python main.py --diagram flow_diagram --output ./images/flow.png --theme forest

# 使用深色主题
python main.py --diagram class_diagram --output ./images/arch.png --theme dark --bg-color "#2b2b2b" --text-color "#ffffff"
```

## 支持的参数

- `--config`: 配置文件路径（默认：config.yaml）
- `--diagram`: 要生成的图表名称
- `--output`: 输出图片路径
- `--scale`: 图片缩放比例（默认：6.0）
- `--bg-color`: 背景颜色（默认：white）
- `--theme`: 主题样式（可选：default/forest/dark/neutral）
- `--font-size`: 字体大小（默认：24px）
- `--font-family`: 字体系列（默认：arial）
- `--line-width`: 线条宽度（默认：3px）
- `--arrow-width`: 箭头宽度（默认：3）
- `--padding`: 内边距（默认：20）
- `--text-color`: 文本颜色（默认：#1f2020）

## 配置文件示例

```yaml
diagrams:
  sequence_diagram:
    name: "API调用流程"
    code: |
      sequenceDiagram
        participant A as 客户端
        participant B as 服务器
        A->>B: 请求数据
        B-->>A: 返回结果

  flow_diagram:
    name: "业务流程"
    code: |
      graph TD
        A[开始] --> B[处理]
        B --> C{判断}
        C -->|条件1| D[结果1]
        C -->|条件2| E[结果2]
```

## 支持的图表类型

1. 序列图（Sequence Diagram）
2. 流程图（Flowchart）
3. 类图（Class Diagram）
4. 状态图（State Diagram）
5. 实体关系图（ER Diagram）
6. 甘特图（Gantt Chart）
7. 饼图（Pie Chart）
8. 用户旅程图（User Journey）

更多图表类型和语法请参考 [Mermaid 官方文档](https://mermaid.js.org/) 