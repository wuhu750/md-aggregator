# md-aggregator

## 项目简介

md-aggregator 是一个用于聚合 Markdown 文件内容的命令行工具。它能够递归搜索目录中的 Markdown 文件，根据配置选项进行处理，并将所有文件内容合并为一个输出文件。

## 功能特性

- 递归搜索目录中的 Markdown 文件
- 支持包含和排除特定文件或目录
- 可配置的文件排序（按名称、修改时间、文件大小）
- 可自定义的标题级别和模板
- 支持多种写入模式（覆盖或追加）
- 可配置的文件分隔符
- 详细的日志输出

## 安装

确保您已经安装了 Node.js 和 pnpm，然后运行：

```bash
pnpm install -g md-aggregator
```

或者，您可以直接使用 npx 运行：

```bash
npx md-aggregator [options]
```

## 使用方法

### 基本用法

```bash
md-aggregator [输入目录] [输出文件]
```

示例：

```bash
# 聚合当前目录中的所有 Markdown 文件，输出到 output.md
md-aggregator . output.md

# 聚合指定目录中的 Markdown 文件
md-aggregator ./docs ./docs/aggregated.md
```

### 命令行选项

| 选项 | 描述 | 默认值 |
|------|------|--------|
| `-w, --writeType <type>` | 写入类型 (append 或 write) | write |
| `-s, --separator <separator>` | 文件分隔符 | `\n\n----\n\n` |
| `-t, --titleLevel <level>` | 标题级别 (1-6) | 1 |
| `-T, --titleTemplate <template>` | 标题模板 | `# {fileName}` |
| `--insertFileName` | 插入文件名作为标题 | false |
| `-i, --include <files>` | 包含文件模式 (正则表达式) | [] |
| `-e, --exclude <files>` | 排除文件模式 (正则表达式) | [] |
| `-b, --sortBy <sortBy>` | 排序依据 (name, modified, size) | name |
| `-p, --sortPartten <sortPartten>` | 排序模式 (asc, desc) | asc |
| `-l, --useLog` | 启用日志输出 | false |

## 使用示例

### 1. 基本聚合

```bash
# 聚合当前目录中的所有 Markdown 文件
md-aggregator . output.md
```

### 2. 插入文件名作为标题

```bash
# 为每个文件内容添加文件名作为标题
md-aggregator . output.md --insertFileName --titleLevel 2
```

### 3. 包含和排除特定文件

```bash
# 只包含以 "doc" 开头的文件
md-aggregator . output.md --include "^doc.*\.md$"

# 排除以 "test" 开头的文件
md-aggregator . output.md --exclude "^test.*\.md$"
```

### 4. 文件排序

```bash
# 按修改时间排序（最新优先）
md-aggregator . output.md --sortBy modified --sortPartten desc

# 按文件大小排序（最大优先）
md-aggregator . output.md --sortBy size --sortPartten desc
```

### 5. 自定义分隔符和标题模板

```bash
# 使用自定义分隔符和标题模板
md-aggregator . output.md --separator "\n\n---\n\n" --titleTemplate "## {fileName} (文档)"
```

## API 使用

除了命令行工具，您也可以在代码中使用 md-aggregator：

```javascript
import aggregate from 'md-aggregator';

const result = aggregate({
  inputDir: './docs',
  outputFile: './docs/output.md',
  insertFileName: true,
  titleLevel: 2,
  sortBy: 'modified',
  sortPartten: 'desc',
  useLog: true
});

if (result.success) {
  console.log(`聚合成功，输出文件: ${result.outputFile}`);
} else {
  console.error(`聚合失败: ${result.errorMsg}`);
}
```
