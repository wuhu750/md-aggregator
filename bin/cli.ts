import aggregate from '../src/index';
import { log } from '../src/utils';
import path from 'path';

const { Command } = require('commander');

const program = new Command();

// 获取package.json文件
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)
    .argument('[inputDir]', 'input directory')
    .argument('[outputFile]', 'output file')
    .option('-w, --writeType <type>', 'write type')
    .option('-s, --separator <separator>', 'separator')
    .option('-t, --titleLevel <level>', 'title level')
    .option('-T, --titleTemplate <template>', 'title template')
    .option('--insertFileName', 'insert file name')
    .option('-i, --include <files>', 'include files')
    .option('-e, --exclude <files>', 'exclude files')
    .option('-b, --sortBy <sortBy>', 'sort by')
    .option('-p, --sortPartten <sortPartten>', 'sort partten')
    .option('-l, --useLog', 'use log')
    .action((inputDir: string | undefined, outputFile: string | undefined, options: Record<string, any>) => {
        const res = aggregate({
            inputDir,
            outputFile,
            ...options,
        });

        if (res.success) {
            log.green(`Aggregate success, output file: ${res.outputFile}`);
        } else {
            log.red(`Aggregate failed, error message: ${res.errorMsg}`);
        }
    });

program.parse();