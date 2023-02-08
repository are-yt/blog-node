const connection = require('../config/database')
const { HOST, PORT } = process.env
class Leaveword {
  async send(userId, content) {
    const statement = `
      INSERT INTO leaveword (content, user_id) VALUES (?, ?)
    `
    const [res] = await connection.execute(statement, [content, userId])
    return res
  }
  async list() {
    let statement = `
      SELECT id, content, user_id, createAt FROM leaveword
    `
    const [res] = await connection.execute(statement)
    if (!res.length) {
      return []
    }
    // 根据查询到的留言数据获取用户头像和昵称信息
    statement = `
      SELECT nickname from account WHERE id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [res2] = await connection.execute(statement, [res[i].user_id])
      res[i].nickname = res2[0].nickname
    }
    statement = `
      SELECT name FROM avatar WHERE user_id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [res3] = await connection.execute(statement, [res[i].user_id])
      res[i].avatar = `http://${HOST}:${PORT}/user/avatar/${res3[0].name}`
    }
    return res
  }
}
module.exports = new Leaveword()