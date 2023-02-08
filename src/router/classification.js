const Router = require('koa-router')
const router = new Router({ prefix: '/class' })
const { list } = require('../controller/classification')
// 获取归档分页数据
router.get('/list/:offset/:size', list)
module.exports = router