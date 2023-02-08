const cateServices = require('../services/cate')
class Cate {
  async list(ctx) {
    try {
      const list = await cateServices.list()
      ctx.body = {
        code: 200,
        message: '',
        errMsg: '',
        success: true,
        list
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Cate()