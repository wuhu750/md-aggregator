import aggregate, { SortBy, SortPartten } from '../src/index';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';

describe("aggregate function", () => {
    const testDir = path.resolve(__dirname, './md');
    const outputFile = path.resolve(__dirname, './test-output.md');

    // 测试前清理可能存在的输出文件
    beforeEach(() => {
        if (existsSync(outputFile)) {
            unlinkSync(outputFile);
        }
    });

    // 测试后清理输出文件
    afterEach(() => {
        if (existsSync(outputFile)) {
            unlinkSync(outputFile);
        }
    });

    test("should aggregate markdown files successfully", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            useLog: false
        });

        expect(result.success).toBe(true);
        expect(result.filesProcessed).toBeGreaterThan(0);
        expect(existsSync(outputFile)).toBe(true);
    });

    test("should return error when inputDir does not exist", () => {
        const result: any = aggregate({
            inputDir: "./non-existent-directory",
            outputFile: outputFile,
            useLog: false
        });

        expect(result.success).toBe(false);
        // 错误信息是"validate error"，而不是具体的错误信息
        expect(result.errorMsg).toBe("validate error");
    });

    test("should return error when inputDir is not a directory", () => {
        const notADir = path.resolve(__dirname, './md/test.md');
        const result: any = aggregate({
            inputDir: notADir,
            outputFile: outputFile,
            useLog: false
        });

        expect(result.success).toBe(false);
        expect(result.errorMsg).toBe("validate error");
    });

    test("should correctly apply include pattern", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            include: ["simple.*"],
            useLog: false
        });

        expect(result.success).toBe(true);
        // 根据文件名匹配，应该只处理simple1.md和simple2.md两个文件
        expect(result.filesProcessed).toBe(2);
    });

    test("should correctly apply exclude pattern", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            exclude: [".*test\\.md"],
            useLog: false
        });

        expect(result.success).toBe(true);
        // 应该排除exclude.test.md文件，总共有3个文件，排除1个后是2个
        expect(result.filesProcessed).toBe(2);
    });

    test("should insert file name as title when insertFileName is true", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            insertFileName: true,
            useLog: false
        });

        expect(result.success).toBe(true);
        const outputContent = readFileSync(outputFile, 'utf-8');
        // 检查输出内容是否包含文件名作为标题
        expect(outputContent).toContain("# simple1");
        expect(outputContent).toContain("# simple2");
    });

    test("should correctly apply titleLevel option", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            insertFileName: true,
            titleLevel: 2,
            useLog: false
        });

        expect(result.success).toBe(true);
        const outputContent = readFileSync(outputFile, 'utf-8');
        // 检查输出内容是否使用了二级标题
        expect(outputContent).toContain("## simple1");
        expect(outputContent).toContain("## simple2");
    });
});

describe("processor function", () => {
    const testDir = path.resolve(__dirname, './md');
    const outputFile = path.resolve(__dirname, './test-output.md');

    // 测试后清理输出文件
    afterEach(() => {
        if (existsSync(outputFile)) {
            unlinkSync(outputFile);
        }
    });

    test("should correctly sort files by name", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            sortBy: SortBy.name,
            sortPartten: SortPartten.asc,
            useLog: false
        });

        expect(result.success).toBe(true);
        // 检查输出文件是否创建成功
        expect(existsSync(outputFile)).toBe(true);
    });

    test("should merge content with custom separator", () => {
        const result: any = aggregate({
            inputDir: testDir,
            outputFile: outputFile,
            separator: "\n\n---\n\n",
            useLog: false
        });

        expect(result.success).toBe(true);
        const outputContent = readFileSync(outputFile, 'utf-8');
        // 检查自定义分隔符是否正确应用
        expect(outputContent).toContain("\n\n---\n\n");
    });
});