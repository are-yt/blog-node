const Router = require('koa-router')
const router = new Router({ prefix: '/leaveword' })
const { verifyToken } = require('../middleware/auth.middleware')
const {
  send,
  list
} = require('../controller/leaveword')
// 发送留言
router.post('/send', verifyToken, send)
// 获取留言列表
router.get('/list', list)
module.exports = router