const connection = require('../config/database')
const { HOST, PORT } = process.env
class Link {
  async addComment(content, city, userId, reply_id, parent_id) {
    const statement = `
      INSERT INTO comment_link (content, city, user_id, reply_id, parent_id) VALUES (?, ?, ?, ?, ?)
    `
    const [res] = await connection.execute(statement, [content, city, userId, reply_id ?? null, parent_id ?? null])
    return res
  }
  async getCommentList(offset, size) {
    let statement = `
      SELECT * FROM comment_link WHERE parent_id IS NULL ORDER BY createAt desc
    `
    let [res] = await connection.execute(statement)
    res = res.splice(offset * size, size)
    // 再遍历每个评论获取点赞列表
    statement = `
      SELECT JSON_ARRAYAGG(user_id) list FROM comment_link_endorse WHERE comment_id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [res2] = await connection.execute(statement, [res[i].id])
      res[i].endorse = res2[0].list ?? []
    }
    // 再遍历每个评论获取子评论
    statement = `
      SELECT * FROM comment_link WHERE parent_id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [res3] = await connection.execute(statement, [res[i].id])
      res[i].replyList = res3
    }
    // 再遍历每个评论获取对应评论的用户信息
    statement = `
      SELECT nickname FROM account WHERE id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [[{ nickname }]] = await connection.execute(statement, [res[i].user_id])
      res[i].nickname = nickname
    }
    // 再遍历每个评论获取对应评论用户的头像信息
    statement = `
      SELECT name FROM avatar WHERE user_id = ?
    `
    for (let i = 0; i < res.length; i++) {
      const [[{ name }]] = await connection.execute(statement, [res[i].user_id])
      res[i].avatar = name ? `http://${HOST}:${PORT}/user/avatar/${name}` : ''
    }
    // 再遍历每一个二级评论获取对应的信息
    for (let i = 0; i < res.length; i++) {
      for(let j = 0; j < res[i].replyList.length; j++) {
        statement = `
          SELECT name FROM avatar WHERE user_id = ?
        `
        const [[{ name }]] = await connection.execute(statement, [res[i].replyList[j].user_id])
        res[i].replyList[j].avatar = name ? `http://${HOST}:${PORT}/user/avatar/${name}` : ''
        statement = `
          SELECT nickname FROM account WHERE id = ?
        `
        const [[{ nickname }]] = await connection.execute(statement, [res[i].replyList[j].user_id])
        res[i].replyList[j].nickname = nickname
        statement = `
          SELECT JSON_ARRAYAGG(user_id) list FROM comment_link_endorse WHERE comment_id = ?
        `
        const [endorseList] = await connection.execute(statement, [res[i].replyList[j].id])
        res[i].replyList[j].endorse = endorseList[0].list ?? []
        if (res[i].replyList[j].reply_id) {
          statement = `
            SELECT nickname replyName FROM account WHERE id = ?
          `
          const [[{ replyName }]] = await connection.execute(statement, [res[i].replyList[j].reply_id])
          res[i].replyList[j].reply_name = replyName
        }
      }
    }
    return res
  }
  async getCommentTotal() {
    // 顶级评论数,这个用于判断分页加载
    const statement = `
      SELECT COUNT(*) total FROM comment_link WHERE parent_id IS NULL
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async getAllCommentTotal() {
    // 所有评论数，用于显示
    const statement = `
      SELECT COUNT(*) allCount FROM comment_link
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async endorse(userId, commentId) {
    // 先看用户是否点赞了该评论
    let statement = `
      SELECT * FROM comment_link_endorse WHERE comment_id = ? AND user_id = ?
    `
    const [res] = await connection.execute(statement, [commentId, userId])
    if (res.length) {
      // 用户已点赞了这个评论，这是一次取消点赞操作
      statement = `
        DELETE FROM comment_link_endorse WHERE comment_id = ? AND user_id = ?
      `
      await connection.execute(statement, [commentId, userId])
      return 0
    }
    // 这是一次点赞操作
    statement = `
      INSERT INTO comment_link_endorse (comment_id, user_id) VALUES (?, ?)
    `
    await connection.execute(statement, [commentId, userId])
    return 1
  }
  async getLinkList() {
    const statement = `
      SELECT * FROM link
    `
    const [res] = await connection.execute(statement)
    return res
  }
}
module.exports = new Link()