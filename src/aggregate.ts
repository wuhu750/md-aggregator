import { statSync, existsSync } from 'fs'
import path from 'path';
import { Options, Result } from "./types";
import { log } from "./utils";
import processor from "./processor";

/**
 * 聚合Markdown文件的主函数
 * 
 * 该函数会读取指定目录下的所有Markdown文件，根据配置选项进行处理，
 * 最终将所有文件内容合并为一个输出文件。
 * 
 * @param options 聚合选项配置
 * @returns 聚合结果
 */
export function aggregate(options: Options): Result {
  try {
    log.useLog = options?.useLog !== false;
    log.log("================== aggregate start ==================")

    log.blue("-- process options --")
    log.log(`options is: ${JSON.stringify(options)}`)

    const mergedOptions = mergeOptions(options) as Options;

    log.log(`merged options is: ${JSON.stringify(mergedOptions)}`)

    if (!validate(mergedOptions)) {
      log.red("-- validate error --")
      return {
        success: false,
        errorMsg: "validate error",
      };
    }
    log.blue("-- validate success --")

    const result = processor(mergedOptions);
    log.log("================== aggregate end ==================")
    return result;
  } catch (error) {
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
function validate(options: Options) {
  const { inputDir } = options;

  // validate inputDir
  if (existsSync(inputDir)) {
    const stat = statSync(inputDir);
    if (stat.isDirectory()) {
      return true;
    } else {
      log.red(`${inputDir} is not a directory`);
      return false;
    }
  } else {
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
function mergeOptions(options: Options) {
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

export default aggregate;