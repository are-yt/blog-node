const jwt = require('jsonwebtoken')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const PUBLIC_KEY = readFileSync(resolve(__dirname, '../keys/public.key'))
class Auth {
  async verifyToken(ctx, next) {
    const token = ctx.request.headers.authorization
    if (!token) {
      return ctx.app.emit('error', new Error('没有传递token'), 400, ctx)
    } else {
      try {
        const { id } = jwt.verify(token, PUBLIC_KEY, {
          algorithms: ['RS256']
        })
        ctx.userId = id
        await next()
      } catch(err) {
        return ctx.app.emit('error', new Error('登录过期,请重新登录'), 200, ctx)
      }
    }
  }
}
module.exports = new Auth()