/**
 * 文件写入类型枚举
 * append: 追加到文件末尾
 * write: 覆盖写入文件
 */
export enum WriteFileType {
    append = "append",
    write = "write"
}

/**
 * 文件排序依据枚举
 * name: 按文件名排序
 * modified: 按修改时间排序
 * size: 按文件大小排序
 */
export enum SortBy {
    name = "name",
    modified = "modified",
    size = "size"
}

/**
 * 排序模式枚举
 * asc: 升序排列
 * desc: 降序排列
 */
export enum SortPartten {
    asc = "asc",
    desc = "desc"
}

/**
 * 可为空的字符串类型别名
 * 表示一个可能为null、undefined或string类型的值
 */
export type hasDefaultString = string | null | undefined;

/**
 * 聚合选项配置接口
 * 定义了文件聚合过程中的各种配置参数
 */
export interface Options {
    /** 输入目录路径 */
    inputDir?: hasDefaultString;
    
    /** 输出文件路径 */
    outputFile?: hasDefaultString;
    
    /** 文件写入类型 */
    writeType?: WriteFileType;
    
    /** 文件内容分隔符 */
    separator?: string;
    
    /** 标题层级 */
    titleLevel?: number;
    
    /** 标题模板 */
    titleTemplate?: string;
    
    /** 是否插入文件名作为标题 */
    insertFileName?: boolean;
    
    /** 包含文件的模式列表 */
    include?: string[];
    
    /** 排除文件的模式列表 */
    exclude?: string[];
    
    /** 排序依据 */
    sortBy?: SortBy;
    
    /** 排序模式 */
    sortPartten?: SortPartten,
    
    /** 是否启用日志 */
    useLog?: boolean;
}

/**
 * 处理后的文件信息接口
 * 包含文件的原始内容和处理后的内容
 */
export interface ProcessedFiles {
    /** 文件名（不含扩展名） */
    fileName: string,
    
    /** 文件原始内容 */
    originalContent: string,
    
    /** 文件处理后的内容 */
    processedContent: string,
    
    /** 文件完整路径 */
    filePath: string
}

/**
 * 聚合结果接口
 * 定义了聚合操作的返回结果格式
 */
export interface Result {
    /** 操作是否成功 */
    success: boolean,
    
    /** 处理的文件列表 */
    files?: Array<Record<string, string>>,
    
    /** 输出文件路径 */
    outputFile?: string,
    
    /** 输入目录路径 */
    inputDir?: string,
    
    /** 处理的文件数量 */
    filesProcessed?: number,
    
    /** 错误信息 */
    errorMsg?: string
}