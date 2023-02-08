const Router = require('koa-router')
const router = new Router({ prefix: '/info' })
const {
  data,
  isView,
  statistics
} = require('../controller/info')
// 查询文章、标签、分类的数量
router.get('/data', data)
// 用户访问控制接口
router.get('/is/view', isView)
// 查询网站统计信息
router.get('/statistics', statistics)
module.exports = router