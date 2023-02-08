const { resolve } = require('path')
const { createReadStream } = require('fs')
class Emoji {
  async getEmoji(ctx) {
    try {
      const filename = ctx.request.params.filename
      const filepath = resolve(__dirname, '../pictures/emoji', filename)
      ctx.response.set('content-type', 'image/png')
      ctx.body = createReadStream(filepath)
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Emoji()