const infoServices = require('../services/info')
const moment = require('moment')
class Info {
  async data(ctx) {
    // 查询文章、标签、分类的数量
    try {
      const data = await infoServices.data()
      ctx.body = {
        message: '获取信息数据成功',
        code: 200,
        success: true,
        data
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async isView(ctx) {
    const isViewedAtToday = ctx.cookies.get('isview')
    if (isViewedAtToday) {
      return ctx.body = {
        code: 200,
        message: '用户今日已访问',
        success: true
      }
    }
    // 没有cookie，代表用户这次是今天第一次访问，种植cookie并增加访问量
    try {
      ctx.set('Access-Control-Allow-Credentials', true)
      const expires = moment(new Date()).add(1, 'days').format('YYYY-MM-DD')
      const res = await infoServices.addView()
      ctx.cookies.set('isview', '123', {
        domain: process.env.HOST,
        expires: new Date(expires),
        httpOnly: false,
        overwrite: false
      })
      ctx.body = {
        code: 200,
        message: '增加访问量成功',
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async statistics(ctx) {
    const res = await infoServices.statistics()
    ctx.body = {
      code: 200,
      message: '获取网站统计信息成功',
      success: true,
      data: res[0]
    }
  }
}
module.exports = new Info()