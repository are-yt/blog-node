const Router = require('koa-router')
const router = new Router({ prefix: '/subscribe' })
const {
  handle,
  queryUserIsSubscribe
} = require('../controller/subscribe')
const { verifyToken } = require('../middleware/auth.middleware')
// 订阅与取消订阅
router.post('/handle/:flag', verifyToken, handle)
// 查询是否订阅
router.get('/query/:id', queryUserIsSubscribe)
module.exports = router