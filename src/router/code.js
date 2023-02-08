const Router = require('koa-router')
const router = new Router({ prefix: '/code' })
const {
  send
} = require('../controller/code')
router.post('/send', send)
module.exports = router