const connection = require('../config/database')
class Classification {
  async list(offset, size) {
    // 查询所有文章信息按时间降序排列
    let statement = `
      SELECT * FROM articles WHERE draft = '1' ORDER BY createAt DESC
    `
    let [res] = await connection.execute(statement)
    res = res.splice(offset * size, size)
    return res
  }
  async getTotal() {
    const statement = `
      SELECT COUNT(*) total FROM articles WHERE draft = '1'
    `
    const [[{ total }]] = await connection.execute(statement)
    return total
  }
}
module.exports = new Classification()