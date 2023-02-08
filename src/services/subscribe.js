const connection = require('../config/database')
class Subscribe {
  async handle(flag, id) {
    const statement = `
      UPDATE account SET subscribe = ? WHERE id = ?
    `
    const [res] = await connection.execute(statement, [flag, id])
    return res
  }
  async queryUserIsSubscribe(id) {
    const statement = `
      SELECT * FROM account WHERE id = ? AND subscribe = 1
    `
    const [res] = await connection.execute(statement, [id])
    return res
  }
  async queryTotalSubscribe() {
    const statement = `
      SELECT COUNT(*) total FROM account WHERE subscribe = 1
    `
    const [res] = await connection.execute(statement)
    return res
  }
}
module.exports = new Subscribe()