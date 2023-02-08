const connection = require('../config/database')
class UserServices {
  async userIsRegistered(email) {
    // 用户是否注册
    const statement = `
      SELECT * FROM account WHERE email = ?
    `
    const [res] = await connection.execute(statement, [email])
    return res
  }
  async registerNewUser(email, password) {
    // 注册新用户
    const statement = `
      INSERT INTO account (email, password) VALUES (?, ?)
    `
    const [res] = await connection.execute(statement, [email, password])
    return res
  }
  async queryUserInfo(email) {
    // 查询用户基本信息，主要是nickname、id、type、email
    const statement = `
      SELECT * FROM account WHERE email = ?
    `
    const [res] = await connection.execute(statement, [email])
    return res[0]
  }
  async userIsMatch(email, password) {
    // 用户使用邮箱密码登录，检测是否匹配
    const statement = `
      SELECT * FROM account WHERE email = ? AND password = ?
    `
    const [res] = await connection.execute(statement, [email, password])
    return res
  }
  async updatePassword(email, password) {
    const statement = `
      UPDATE account SET password = ? WHERE email = ?
    `
    const [res] = await connection.execute(statement, [password, email])
    return res
  }
  async updateName(id, name) {
    const statement = `
      UPDATE account SET nickname = ? WHERE id = ?
    `
    const [res] = await connection.execute(statement, [name, id])
    return res
  }
  async updateAvatar(id, name, mimetype) {
    let statement = `
      SELECT * FROM avatar WHERE user_id = ?
    `
    const [res1] = await connection.execute(statement, [id])
    if (res1.length) {
      // 之前存在用户头像信息，在此信息基础上修改
      statement = `
        UPDATE avatar SET name = ?, mimetype = ? WHERE user_id = ?
      `
      const [res2] = await connection.execute(statement, [name, mimetype, id])
      return res2
    }
    // 用户之前没有头像信息，直接添加
    statement = `
      INSERT INTO avatar (user_id, name, mimetype) VALUES (?, ?, ?)
    `
    const [res3] = await connection.execute(statement, [id, name, mimetype])
    return res3
  }
  async queryUserAvatar(id) {
    const statement = `
      SELECT * FROM avatar WHERE user_id = ?
    `
    const [res] = await connection.execute(statement, [id])
    return res
  }
  async queryUserAvatarMimetype(filename) {
    const statement = `
      SELECT mimetype FROM avatar WHERE name = ?
    `
    const [res] = await connection.execute(statement, [filename])
    return res
  }
}
module.exports = new UserServices()