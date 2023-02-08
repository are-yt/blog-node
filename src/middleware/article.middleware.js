const multer = require('koa-multer')
const { resolve } = require('path')
const article_surface_file = multer({
  dest: resolve(__dirname, '../pictures/article')
})
// 处理上传的文章封面图
const article_surface_handler = article_surface_file.single('surface')
exports.article_surface_handler = article_surface_handler

const article_img_file = multer({
  dest: resolve(__dirname, '../pictures/article')
})
const article_img_handler = article_img_file.single('articleImg')
exports.article_img_handler = article_img_handler