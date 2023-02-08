const connection = require('../config/database')
class Cate {
  async list() {
    const statement = `
      SELECT * FROM cate
    `
    const [res] = await connection.execute(statement)
    return res
  }
}
module.exports = new Cate()