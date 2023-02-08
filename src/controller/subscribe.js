const subscribeServices = require('../services/subscribe')
const sendNotice = require('../utils/sendNotice')
const connection = require('../config/database')
class Subscribe {
  async handle(ctx) {
    const id = ctx.userId
    let flag = ctx.request.params.flag
    flag = flag === 'false' ? 0 : 1
    try {
      const res = await subscribeServices.handle(flag, id)
      if (res.affectedRows) {
        if (flag) {
          // 订阅成功后给该订阅用户发送一条订阅成功通知
          const statement = `SELECT email FROM account WHERE id = ?`
          const [[{email}]] = await connection.execute(statement, [id])
          await sendNotice(email, '感谢订阅~', '感谢您的订阅,后续文章的更新或其他本站通知会第一时间通过此邮箱告知您')
        }
        return ctx.body = {
          code: 200,
          message: flag ? '订阅成功' : '取消订阅',
          errMsg: '',
          success: true
        }
      } else {
        return ctx.body = {
          code: 200,
          message: '',
          errMsg: '操作失败,请稍后再试',
          success: false
        }
      }
    } catch(err) {
      return ctx.app.emit('error', err, 500, ctx)
    }
  }
  async queryUserIsSubscribe(ctx) {
    const id = ctx.request.params.id
    try {
      // 查询用户是否已订阅
      const res = await subscribeServices.queryUserIsSubscribe(id)
      // 查询订阅的总数
      const [{ total }] = await subscribeServices.queryTotalSubscribe()
      if (res.length) {
        return ctx.body = {
          code: 200,
          message: '已订阅',
          subscribe: true,
          total,
          errMsg: '',
          success: true
        }
      } else {
        return ctx.body = {
          code: 200,
          message: '未订阅',
          subscribe: false,
          errMsg: '',
          success: true
        }
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Subscribe()