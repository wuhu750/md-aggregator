# md-aggregator

## Project Introduction

md-aggregator is a command-line tool for aggregating Markdown file contents. It can recursively search for Markdown files in directories, process them according to configuration options, and merge all file contents into a single output file.

## Features

- Recursively search for Markdown files in directories
- Support including and excluding specific files or directories
- Configurable file sorting (by name, modification time, file size)
- Customizable title levels and templates
- Support multiple write modes (overwrite or append)
- Configurable file separators
- Detailed log output

## Installation

Make sure you have Node.js and pnpm installed, then run:

```bash
pnpm install -g md-aggregator
```

Or you can directly use npx to run:

```bash
npx md-aggregator [options]
```

## Usage

### Basic Usage

```bash
md-aggregator [input directory] [output file]
```

Examples:

```bash
# Aggregate all Markdown files in the current directory, output to output.md
md-aggregator . output.md

# Aggregate Markdown files in a specific directory
md-aggregator ./docs ./docs/aggregated.md
```

### Command Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-w, --writeType <type>` | Write type (append or write) | write |
| `-s, --separator <separator>` | File separator | `\n\n----\n\n` |
| `-t, --titleLevel <level>` | Title level (1-6) | 1 |
| `-T, --titleTemplate <template>` | Title template | `# {fileName}` |
| `--insertFileName` | Insert filename as title | false |
| `-i, --include <files>` | Include file patterns (regex) | [] |
| `-e, --exclude <files>` | Exclude file patterns (regex) | [] |
| `-b, --sortBy <sortBy>` | Sort by (name, modified, size) | name |
| `-p, --sortPartten <sortPartten>` | Sort pattern (asc, desc) | asc |
| `-l, --useLog` | Enable log output | false |

## Usage Examples

### 1. Basic Aggregation

```bash
# Aggregate all Markdown files in the current directory
md-aggregator . output.md
```

### 2. Insert Filename as Title

```bash
# Add filename as title for each file content
md-aggregator . output.md --insertFileName --titleLevel 2
```

### 3. Including and Excluding Specific Files

```bash
# Only include files starting with "doc"
md-aggregator . output.md --include "^doc.*\.md$"

# Exclude files starting with "test"
md-aggregator . output.md --exclude "^test.*\.md$"
```

### 4. File Sorting

```bash
# Sort by modification time (newest first)
md-aggregator . output.md --sortBy modified --sortPartten desc

# Sort by file size (largest first)
md-aggregator . output.md --sortBy size --sortPartten desc
```

### 5. Custom Separator and Title Template

```bash
# Use custom separator and title template
md-aggregator . output.md --separator "\n\n---\n\n" --titleTemplate "## {fileName} (Document)"
```

## API Usage

In addition to the command-line tool, you can also use md-aggregator in your code:

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
  console.log(`Aggregation successful, output file: ${result.outputFile}`);
} else {
  console.error(`Aggregation failed: ${result.errorMsg}`);
}
```
