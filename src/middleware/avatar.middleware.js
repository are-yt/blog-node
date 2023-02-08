const multer = require('koa-multer')
const { resolve } = require('path')
const avatar_file = multer({
  dest: resolve(__dirname, '../pictures/avatar')
})
const avatarHandler = avatar_file.single('avatar')
module.exports = avatarHandler