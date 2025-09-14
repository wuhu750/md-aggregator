import { writeFileSync, appendFileSync, mkdirSync, mkdir, readFileSync, statSync, existsSync, readdirSync } from 'fs'
import path from 'path';
import { Options, WriteFileType, ProcessedFiles, SortBy, SortPartten, Result } from './types';
import { log } from './utils';

/**
 * 处理器主函数
 * 负责执行文件聚合的整个流程：读取文件、过滤、排序、处理、合并和写入
 * @param mergedOptions 合并后的配置选项
 * @returns 处理结果
 */
function processor(mergedOptions: Options): Result {
    const { inputDir, outputFile, separator, insertFileName, writeType, titleTemplate, include, exclude, sortBy, sortPartten } = mergedOptions;

    // 1、读取所有文件路径
    const filesPath = getFilesPath(inputDir);

    // 2、过滤文件
    const filterFilePath = filterFileByPattern(filesPath, include, exclude);

    // 3、文件排序
    const sortedFiles = sortFiles(filterFilePath, sortBy, sortPartten);

    // 4、处理单个文件
    const processedFiles: ProcessedFiles[] = processFiles(sortedFiles, insertFileName, titleTemplate);

    // 5、合并文件内容
    const mergedContent = mergeContent(processedFiles, separator);

    // 6、写入新文件
    writeFileByOption(outputFile, mergedContent, writeType);

    return {
        success: true,
        files: processedFiles.map(f => ({ fileName: f.fileName, filePath: f.filePath })),
        outputFile,
        inputDir,
        filesProcessed: processedFiles.length,
    }
}

/**
 * 对文件列表进行排序
 * @param filesPath 文件路径列表
 * @param sortBy 排序依据
 * @param sortPartten 排序模式
 * @returns 排序后的文件路径列表
 */
function sortFiles(filesPath: string[], sortBy: SortBy, sortPartten: SortPartten) {
    try {
        const compareFn = (a: string, b: string) => {
            let result = 0;

            switch (sortBy) {
                case SortBy.name:
                    result = a.localeCompare(b);
                    break;

                case SortBy.modified:
                case SortBy.size:
                    const statA = statSync(a);
                    const statB = statSync(b);

                    if (sortBy === SortBy.modified) {
                        result = statA.mtimeMs - statB.mtimeMs;
                    } else {
                        result = statA.size - statB.size;
                    }
                    break;
            }

            return sortPartten === SortPartten.asc ? result : -result;
        };

        return filesPath.sort(compareFn);
    } catch (error) {
        return filesPath;
    }
}

/**
 * 根据包含和排除模式过滤文件
 * @param filesPath 文件路径列表
 * @param include 包含模式列表
 * @param exclude 排除模式列表
 * @returns 过滤后的文件路径列表
 */
function filterFileByPattern(filesPath: string[], include: string[], exclude: string[]) {
    return filesPath.filter(filePath => {
        for (const pattern of exclude) {
            if (matchesPattern(filePath, pattern)) {
                return false;
            }
        }

        if (include.length > 0) {
            return include.some(pattern => matchesPattern(filePath, pattern));
        }

        return true;
    });
}

/**
 * 处理文件列表中的每个文件
 * @param filesPath 文件路径列表
 * @param insertFileName 是否插入文件名作为标题
 * @param titleTemplate 标题模板
 * @returns 处理后的文件信息列表
 */
function processFiles(filesPath: string[], insertFileName: boolean, titleTemplate: string) {
    const files: ProcessedFiles[] = [];

    if (filesPath.length === 0) {
        return files;
    }

    filesPath.forEach(filePath => {
        try {
            const content = readFileSync(filePath, 'utf-8');
            const fileName = path.parse(filePath).name;

            let processedContent = content.trim();

            if (insertFileName) {
                processedContent = adjustTitleLevels(content, 1);
                const contentTitle = titleTemplate.replace('{fileName}', fileName)
                processedContent = contentTitle + '\n\n' + processedContent;
            }

            files.push({
                fileName,
                originalContent: content,
                processedContent,
                filePath,
            });
        } catch (error) {
            log.red(`process file error, filePath: ${filePath}, error: ${error.message}`);
        }
    });

    return files;
}

/**
 * 调整Markdown标题级别
 * @param content 原始内容
 * @param adjustment 调整级别数（正数增加级别，负数减少级别）
 * @returns 调整后的文本内容
 */
function adjustTitleLevels(content: string, adjustment: number) {
    if (!content) {
        return '';
    }

    if (adjustment === 0) {
        return content;
    }

    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        const atxMatch = line.match(/^(#{1,6})\s+(.*)$/);
        if (atxMatch) {
            const currentLevel = atxMatch[1].length;
            const newLevel = Math.max(1, Math.min(6, currentLevel + adjustment));
            const newHashes = '#'.repeat(newLevel);
            return `${newHashes} ${atxMatch[2]}`;
        }

        return line;
    })

    return processedLines.join('\n');
}

/**
 * 合并处理后的内容
 * @param processedFiles 处理后的文件列表
 * @param separator 分隔符
 * @returns 合并后的内容
 */
function mergeContent(processedFiles: ProcessedFiles[], separator: string) {
    const contents = processedFiles.map(content => content.processedContent).filter(v => Boolean(v));
    return contents.join(separator);
}

/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名（小写）
 */
function getFileExtension(filePath: string) {
    return path.extname(filePath).toLowerCase();
}

/**
 * 判断是否为Markdown文件
 * @param filePath 文件路径
 * @returns 是否为Markdown文件
 */
function isMarkdownFile(filePath: string) {
    const extension = getFileExtension(filePath);
    return extension === '.md' || extension === '.markdown';
}

/**
 * 递归获取目录下所有Markdown文件路径
 * @param inputDir 输入目录
 * @returns Markdown文件路径列表
 */
function getFilesPath(inputDir: string) {
    const files = readdirSync(inputDir);

    const filesPath = [];

    files.forEach(file => {
        const absolutePath = path.resolve(inputDir, file);

        if (statSync(absolutePath).isDirectory()) {
            filesPath.push(...getFilesPath(absolutePath));
        } else {
            if (isMarkdownFile(absolutePath)) {
                filesPath.push(absolutePath);
            }
        }
    })

    return filesPath;
}

/**
 * 检查文件路径是否匹配给定模式
 * @param filePath 文件路径
 * @param pattern 匹配模式（正则表达式）
 * @returns 是否匹配
 */
function matchesPattern(filePath: string, pattern: string) {
    return new RegExp(pattern).test(filePath);
}

/**
 * 根据选项写入文件
 * @param outputPath 输出路径
 * @param mergedContent 合并后的内容
 * @param writeType 写入类型
 */
function writeFileByOption(outputPath: string, mergedContent: string, writeType: WriteFileType) {
    const dir = path.dirname(outputPath);
    mkdirSync(dir, { recursive: true })

    if (writeType === WriteFileType.append) {
        appendFileSync(outputPath, mergedContent);
    } else {
        writeFileSync(outputPath, mergedContent);
    }
}

export default processor;