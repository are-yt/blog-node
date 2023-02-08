const Router = require('koa-router')
const router = new Router({ prefix: '/link' })
const { verifyToken } = require('../middleware/auth.middleware')
const {
  addComment,
  getCommentList,
  endorse,
  getLinkList
} = require('../controller/link')
// 添加友链评论
router.post('/submit/comment', verifyToken, addComment)
// 获取友链的评论
router.get('/comment/list/:offset/:size', getCommentList)
// 友链评论点赞
router.post('/comment/endorse/:commentId', verifyToken, endorse)
// 获取友链
router.get('/list', getLinkList)
module.exports = router