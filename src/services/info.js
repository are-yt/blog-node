const connection = require('../config/database')
class Info {
  async data() {
    const queryInfo = {
      articleCount: 0,
      tagCount: 0,
      cateCount: 0
    }
    let statement = `
      SELECT COUNT(*) total FROM articles
    `
    const [res1] = await connection.execute(statement)
    queryInfo.articleCount = res1[0].total
    statement = `
      SELECT COUNT(*) total FROM tags
    `
    const [res2] = await connection.execute(statement)
    queryInfo.tagCount = res2[0].total
    statement = `
      SELECT COUNT(*) total FROM cate
    `
    const [res3] = await connection.execute(statement)
    queryInfo.cateCount = res3[0].total
    return queryInfo
  }
  async addView() {
    let statement = `
      SELECT id, views FROM sta
    `
    const [[{ id, views }]] = await connection.execute(statement)
    statement = `
      UPDATE sta SET views = ? WHERE id = ?
    `
    const [res] = await connection.execute(statement, [views + 1, id])
    return res
  }
  async statistics() {
    const statement = `
      SELECT run_hours, last_update, views FROM sta
    `
    const [res] = await connection.execute(statement)
    return res
  }
}
module.exports = new Info()