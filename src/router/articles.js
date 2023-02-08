const Router = require('koa-router')
const router = new Router({ prefix: '/articles' })
const { verifyToken } = require('../middleware/auth.middleware')
const { article_surface_handler, article_img_handler } = require('../middleware/article.middleware')
const {
  saveDraft,
  saveSurface,
  getDraft,
  getSurface,
  uploadArticleImg,
  getArticleImg,
  release,
  saveSurfaceFromDraft,
  deleteDraft,
  saveContributeDate,
  getContribute,
  getHotList,
  getFiltrateArticle,
  getDetail,
  addClickCount,
  sendComment,
  getCommentList,
  commentEndorse
} = require('../controller/articles')
// 保存草稿数据，包括标题、内容、是否置顶、标签以及分类
router.post('/save', verifyToken, saveDraft)
// 更新封面图
router.post('/save/surface/:articleId', verifyToken, article_surface_handler, saveSurface)
// 获取草稿信息
router.post('/get/draft', getDraft)
// 获取文章封面图
router.get('/surface/:articleId', getSurface)
// 上传文章内的图片
router.post('/img', article_img_handler, uploadArticleImg)
// 读取上传到文章内的图片
router.get('/file/:filename', getArticleImg)
// 上传文章
router.post('/release', verifyToken, release)
// 通过草稿保存的封面图更新发表文章的封面图
router.post('/save/surface/draft/:articleId', verifyToken, saveSurfaceFromDraft)
// 删除草稿文章
router.delete('/draft', verifyToken, deleteDraft)
// 保存贡献记录
router.post('/save/contribute', verifyToken, saveContributeDate)
// 获取贡献记录
router.get('/contribute/get', getContribute)
// 获取首页热门文章
router.get('/hot/list', getHotList)
// 根据标签或分类获取相关文章分页数据
router.get('/filtrate/:type/:id/:offset/:size', getFiltrateArticle)
// 获取文章详情
router.get('/detail/:id', getDetail)
// 增加文章点击量
router.get('/click/:id', addClickCount)
// 发布文章评论
router.post('/comment/send/:articleId', verifyToken, sendComment)
// 获取评论分页数据
router.get('/comment/list/:offset/:size/:articleId', getCommentList)
// 文章评论点赞
router.post('/comment/endorse/:commentId', verifyToken, commentEndorse)
module.exports = router