const request = require('axios').create({
  baseURL: 'http://api.guaqb.cn',
  timeout: 7000
})
const sendContent = (code) => `[c-y的个人博客]\r验证码:${code}`
const sendCode = (email, code) => {
  const res = {
    data: '',
    err: ''
  }
  return new Promise((resolve) => {
    request
      .request({
        url: `/music/yx/qq.php?user=2821458718@qq.com&password=bmmbredqjpyydcga&email=${email}&bt=来自c-y的个人博客的验证码&nr=${sendContent(code)}`,
        method: 'GET'
      })
      .then(res => {
        resolve({
          data: res.data
        })
      })
      .catch(err => {
        console.log(err.message)
        resolve({
          data: '',
          err
        })
      })
  })
}
class Code {
  async send(ctx) {
    const { email, code } = ctx.request.body
    if (!email || !code) {
      return ctx.app.emit('error', new Error('发送验证码需要email和code字段'), 400, ctx)
    }
    const { data, err } = await sendCode(email, code)
    if (err) {
      return ctx.app.emit('error', err, 500, ctx)
    }
    ctx.body = {
      data,
      success: true,
      code: 200,
      errMsg: ''
    }
  }
}
module.exports = new Code()