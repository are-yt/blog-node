const logger = require('../log/index').getLogger('app')
module.exports = (err, errCode, ctx) => {
  logger.error(err)
  if (errCode) {
    ctx.status = errCode
  } else {
    ctx.status = 500
  }
  return ctx.body = {
    success: false,
    errMsg: err.message,
    code: errCode || 500
  }
}