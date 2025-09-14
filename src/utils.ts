import chalk from "chalk";

/**
 * 日志工具对象，提供带颜色的日志输出功能
 * 可以通过设置useLog属性控制是否输出日志
 */
export const log = {
    /** 控制是否启用日志输出 */
    useLog: true,
    
    red: (...args) => {
        log.useLog && console.log(chalk.red(...args))
    },
    
    blue: (...args) => {
        log.useLog && console.log(chalk.blue(...args))
    },
    
    green: (...args) => {
        log.useLog && console.log(chalk.green(...args))
    },
    
    yellow: (...args) => {
        log.useLog && console.log(chalk.yellow(...args))
    },
    
    gray: (...args) => {
        log.useLog && console.log(chalk.gray(...args))
    },
    
    log: (...args) => {
        log.useLog && console.log(...args)
    },
}