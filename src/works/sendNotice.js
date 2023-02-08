(async () => {
  const connection = require('../config/database')
  const request = require('axios').create({
    baseURL: 'http://api.guaqb.cn',
    timeout: 7000
  })
  let title = ''
  const send = (email) => {
    return new Promise(resolve => {
      request
        .request({
          url: `/music/yx/qq.php?user=2821458718@qq.com&password=bmmbredqjpyydcga&email=${email}&bt=来自c-y的个人博客的通知&nr=你订阅的这个博客发布了新的文章,标题为:${title}`,
          method: 'GET'
        })
        .then(() => resolve(1))
        .catch(() => resolve(0))
    })
  }
  process.on('message', async (options) => {
    title = options.title
    const statement = `SELECT email FROM account`
    const [res] = await connection.execute(statement)
    if (res.length === 0) {
      process.exit()
    }
    for (let i = 0; i < res.length; i++) {
      await send(res[i].email)
    }
    process.exit()
  })
})()