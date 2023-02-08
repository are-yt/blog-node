const Router = require('koa-router')
const router = new Router({ prefix: '/cate' })
const {
  list   
} = require('../controller/cate')
router.get('/list', list)
module.exports = router