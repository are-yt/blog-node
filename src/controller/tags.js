const tagsServices = require('../services/tags')
class Tags {
  async list(ctx) {
    try {
      const list = await tagsServices.list()
      ctx.body = {
        list,
        code: 200,
        message: '',
        errMsg: '',
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Tags()