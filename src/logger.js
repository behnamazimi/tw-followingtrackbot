const chalk = require('chalk')

const log = {
    normalLog: (...message) => {
        console.log(...message)
    },
    infoLog: (...message) => {
        console.log(chalk.blue(...message))
    },
    errorLog: (...message) => {
        console.log(chalk.red(...message))
    },
    successLog: (...message) => {
        console.log(chalk.green(...message))
    },
    warningLog: (...message) => {
        console.log(chalk.yellow(...message))
    },
    bolder: (...message) => {
        return chalk.bold(...message)
    },
    logGroupStart: (title) => {
        console.group(title)
    },
    logGroupEnd: () => {
        console.groupEnd()
    }
}

module.exports = log