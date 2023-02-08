const log4js = require('log4js')
const { resolve } = require('path')
log4js.configure({
  appenders: {
    default: {
      type: 'file',
      filename: resolve(__dirname, './logger/all.log')
    },
    appError: {
      type: 'dateFile',
      filename: resolve(__dirname, './logger/app-error.log'),
      maxLogSize: 1024 * 1024 * 10,
      numBackups: 3
    }
  },
  categories: {
    default: {
      appenders: ['default'],
      level: 'all'
    },
    app: {
      appenders: ['appError'],
      level: 'error'
    }
  }
})
module.exports = log4js