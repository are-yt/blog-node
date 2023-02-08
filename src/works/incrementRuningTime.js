(() => {
  const connection = require('../config/database')
  const log4js = require('../log/index')
  const logger = log4js.getLogger('app')
  setInterval(async () => {
    // 每一小时记录一次服务运行时间
    let statement = `
      SELECT id, run_hours FROM sta
    `
    const [[{ id, run_hours }]] = await connection.execute(statement)
    statement = `
      UPDATE sta SET run_hours = ? WHERE id = ?
    `
    try {
      await connection.execute(statement, [run_hours + 1, id])
    } catch(err) {
      logger.error(err)
    }
  }, 1000 * 60 * 60)
})();