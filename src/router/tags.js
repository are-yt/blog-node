const Router = require('koa-router')
const router = new Router({ prefix: '/tag' })
const {
  list
} = require('../controller/tags')
router.get('/list', list)
module.exports = router