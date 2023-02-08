const {
  login,
  forget,
  verify,
  updateName,
  updateAvatar,
  getAvatar
} = require('../controller/user')
const { verifyToken } = require('../middleware/auth.middleware')
const avatarHandler = require('../middleware/avatar.middleware')
const Router = require('koa-router')
const router = new Router({ prefix: '/user' })
// 登录
router.post('/login', login)
// 忘记密码
router.post('/forget', forget)
// 登录令牌验证
router.post('/token/verify', verify)
// 修改昵称
router.post('/update/name/:name', verifyToken, updateName)
// 修改头像
router.post('/update/avatar', verifyToken, avatarHandler, updateAvatar)
// 获取头像
router.get('/avatar/:filename', getAvatar)
module.exports = router