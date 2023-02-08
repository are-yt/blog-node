const classificationServices = require('../services/classification')
const { HOST, PORT } = process.env
class Classfication {
  async list(ctx) {
    const { offset, size } = ctx.request.params
    try {
      const list = await classificationServices.list(offset, size)
      list.forEach(item => {
        item.surface = `http://${HOST}:${PORT}/articles/surface/${item.id}`
      })
      const total = await classificationServices.getTotal()
      ctx.body = {
        code: 200,
        message: '获取归档分页数据成功',
        success: true,
        list,
        total
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Classfication()