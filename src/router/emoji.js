const Router = require('koa-router')
const router = new Router({ prefix: '/emoji' })
const {
  getEmoji
} = require('../controller/emoji')
router.get('/:filename', getEmoji)
module.exports = router