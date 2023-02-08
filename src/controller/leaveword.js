const leavewordServices = require('../services/leaveword')
class Leaveord {
  async send(ctx) {
    const userId = ctx.userId
    const content = ctx.request.body.content
    try {
      const res = await leavewordServices.send(userId, content)
      if (res.insertId) {
        // 留言成功
        return ctx.body = {
          code: 200,
          message: '留言成功',
          success: true
        }
      }
      ctx.body = {
        code: 200,
        errMsg: '留言失败',
        success: false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async list(ctx) {
    try {
      const res = await leavewordServices.list()
      return ctx.body = {
        code: 200,
        message: '获取留言列表成功',
        success: true,
        data: res
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Leaveord()