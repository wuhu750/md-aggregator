'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

/**
 * 日志工具对象，提供带颜色的日志输出功能
 * 可以通过设置useLog属性控制是否输出日志
 */
const log = {
    /** 控制是否启用日志输出 */
    useLog: true,
    red: (...args) => {
        log.useLog && console.log(chalk.red(...args));
    },
    blue: (...args) => {
        log.useLog && console.log(chalk.blue(...args));
    },
    green: (...args) => {
        log.useLog && console.log(chalk.green(...args));
    },
    yellow: (...args) => {
        log.useLog && console.log(chalk.yellow(...args));
    },
    gray: (...args) => {
        log.useLog && console.log(chalk.gray(...args));
    },
    log: (...args) => {
        log.useLog && console.log(...args);
    },
};

/**
 * 文件写入类型枚举
 * append: 追加到文件末尾
 * write: 覆盖写入文件
 */
exports.WriteFileType = void 0;
(function (WriteFileType) {
    WriteFileType["append"] = "append";
    WriteFileType["write"] = "write";
})(exports.WriteFileType || (exports.WriteFileType = {}));
/**
 * 文件排序依据枚举
 * name: 按文件名排序
 * modified: 按修改时间排序
 * size: 按文件大小排序
 */
exports.SortBy = void 0;
(function (SortBy) {
    SortBy["name"] = "name";
    SortBy["modified"] = "modified";
    SortBy["size"] = "size";
})(exports.SortBy || (exports.SortBy = {}));
/**
 * 排序模式枚举
 * asc: 升序排列
 * desc: 降序排列
 */
exports.SortPartten = void 0;
(function (SortPartten) {
    SortPartten["asc"] = "asc";
    SortPartten["desc"] = "desc";
})(exports.SortPartten || (exports.SortPartten = {}));

/**
 * 处理器主函数
 * 负责执行文件聚合的整个流程：读取文件、过滤、排序、处理、合并和写入
 * @param mergedOptions 合并后的配置选项
 * @returns 处理结果
 */
function processor(mergedOptions) {
    const { inputDir, outputFile, separator, insertFileName, writeType, titleTemplate, include, exclude, sortBy, sortPartten } = mergedOptions;
    // 1、读取所有文件路径
    const filesPath = getFilesPath(inputDir);
    // 2、过滤文件
    const filterFilePath = filterFileByPattern(filesPath, include, exclude);
    // 3、文件排序
    const sortedFiles = sortFiles(filterFilePath, sortBy, sortPartten);
    // 4、处理单个文件
    const processedFiles = processFiles(sortedFiles, insertFileName, titleTemplate);
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
    };
}
/**
 * 对文件列表进行排序
 * @param filesPath 文件路径列表
 * @param sortBy 排序依据
 * @param sortPartten 排序模式
 * @returns 排序后的文件路径列表
 */
function sortFiles(filesPath, sortBy, sortPartten) {
    try {
        const compareFn = (a, b) => {
            let result = 0;
            switch (sortBy) {
                case exports.SortBy.name:
                    result = a.localeCompare(b);
                    break;
                case exports.SortBy.modified:
                case exports.SortBy.size:
                    const statA = fs.statSync(a);
                    const statB = fs.statSync(b);
                    if (sortBy === exports.SortBy.modified) {
                        result = statA.mtimeMs - statB.mtimeMs;
                    }
                    else {
                        result = statA.size - statB.size;
                    }
                    break;
            }
            return sortPartten === exports.SortPartten.asc ? result : -result;
        };
        return filesPath.sort(compareFn);
    }
    catch (error) {
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
function filterFileByPattern(filesPath, include, exclude) {
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
function processFiles(filesPath, insertFileName, titleTemplate) {
    const files = [];
    if (filesPath.length === 0) {
        return files;
    }
    filesPath.forEach(filePath => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const fileName = path.parse(filePath).name;
            let processedContent = content.trim();
            if (insertFileName) {
                processedContent = adjustTitleLevels(content, 1);
                const contentTitle = titleTemplate.replace('{fileName}', fileName);
                processedContent = contentTitle + '\n\n' + processedContent;
            }
            files.push({
                fileName,
                originalContent: content,
                processedContent,
                filePath,
            });
        }
        catch (error) {
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
function adjustTitleLevels(content, adjustment) {
    if (!content) {
        return '';
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
    });
    return processedLines.join('\n');
}
/**
 * 合并处理后的内容
 * @param processedFiles 处理后的文件列表
 * @param separator 分隔符
 * @returns 合并后的内容
 */
function mergeContent(processedFiles, separator) {
    const contents = processedFiles.map(content => content.processedContent).filter(v => Boolean(v));
    return contents.join(separator);
}
/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名（小写）
 */
function getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}
/**
 * 判断是否为Markdown文件
 * @param filePath 文件路径
 * @returns 是否为Markdown文件
 */
function isMarkdownFile(filePath) {
    const extension = getFileExtension(filePath);
    return extension === '.md' || extension === '.markdown';
}
/**
 * 递归获取目录下所有Markdown文件路径
 * @param inputDir 输入目录
 * @returns Markdown文件路径列表
 */
function getFilesPath(inputDir) {
    const files = fs.readdirSync(inputDir);
    const filesPath = [];
    files.forEach(file => {
        const absolutePath = path.resolve(inputDir, file);
        if (fs.statSync(absolutePath).isDirectory()) {
            filesPath.push(...getFilesPath(absolutePath));
        }
        else {
            if (isMarkdownFile(absolutePath)) {
                filesPath.push(absolutePath);
            }
        }
    });
    return filesPath;
}
/**
 * 检查文件路径是否匹配给定模式
 * @param filePath 文件路径
 * @param pattern 匹配模式（正则表达式）
 * @returns 是否匹配
 */
function matchesPattern(filePath, pattern) {
    return new RegExp(pattern).test(filePath);
}
/**
 * 根据选项写入文件
 * @param outputPath 输出路径
 * @param mergedContent 合并后的内容
 * @param writeType 写入类型
 */
function writeFileByOption(outputPath, mergedContent, writeType) {
    const dir = path.dirname(outputPath);
    fs.mkdirSync(dir, { recursive: true });
    if (writeType === exports.WriteFileType.append) {
        fs.appendFileSync(outputPath, mergedContent);
    }
    else {
        fs.writeFileSync(outputPath, mergedContent);
    }
}

/**
 * 聚合Markdown文件的主函数
 *
 * 该函数会读取指定目录下的所有Markdown文件，根据配置选项进行处理，
 * 最终将所有文件内容合并为一个输出文件。
 *
 * @param options 聚合选项配置
 * @returns 聚合结果
 */
function aggregate(options) {
    try {
        log.useLog = (options === null || options === void 0 ? void 0 : options.useLog) !== false;
        log.log("================== aggregate start ==================");
        log.blue("-- process options --");
        log.log(`options is: ${JSON.stringify(options)}`);
        const mergedOptions = mergeOptions(options);
        log.log(`merged options is: ${JSON.stringify(mergedOptions)}`);
        if (!validate(mergedOptions)) {
            log.red("-- validate error --");
            return {
                success: false,
                errorMsg: "validate error",
            };
        }
        log.blue("-- validate success --");
        const result = processor(mergedOptions);
        log.log("================== aggregate end ==================");
        return result;
    }
    catch (error) {
        return {
            success: false,
            errorMsg: error.message,
        };
    }
}
/**
 * 验证输入选项的有效性
 * 主要验证输入目录是否存在以及是否为目录
 *
 * @param options 合并后的选项配置
 * @returns 验证是否通过
 */
function validate(options) {
    const { inputDir } = options;
    // validate inputDir
    if (fs.existsSync(inputDir)) {
        const stat = fs.statSync(inputDir);
        if (stat.isDirectory()) {
            return true;
        }
        else {
            log.red(`${inputDir} is not a directory`);
            return false;
        }
    }
    else {
        log.red(`${inputDir} not exists`);
        return false;
    }
}
/**
 * 合并默认选项和用户选项
 * 为未指定的选项设置默认值
 *
 * @param options 用户提供的选项
 * @returns 合并后的选项
 */
function mergeOptions(options) {
    const { inputDir, outputFile } = options || {};
    if (!inputDir) {
        log.yellow(`inputDir is null, use ./ as default input path`);
        options.inputDir = './';
    }
    if (!outputFile) {
        log.yellow(`outputFile is null, use ./aggregate.md as default output path`);
        options.outputFile = 'output.md';
    }
    options.inputDir = path.resolve(inputDir);
    options.outputFile = path.resolve(outputFile);
    options.separator = options.separator || '\n\n----\n\n';
    // insert file name into title
    const titleLevel = options.titleLevel;
    options.titleLevel = titleLevel && typeof titleLevel === 'number' ? titleLevel : 1;
    const titleLeveHash = '#'.repeat(options.titleLevel);
    options.titleTemplate = options.titleTemplate || `${titleLeveHash} {fileName}`;
    options.insertFileName = options.insertFileName || false;
    options.include = Array.isArray(options.include) ? options.include : [];
    options.exclude = Array.isArray(options.exclude) ? options.exclude : [];
    return options;
}

exports.default = aggregate;
exports.log = log;
