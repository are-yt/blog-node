const connection = require('../config/database')
class Tags {
  async list() {
    const statement = `
      SELECT * FROM tags
    `
    const [res] = await connection.execute(statement)
    return res
  }
}
module.exports = new Tags()