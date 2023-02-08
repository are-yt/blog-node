const request = require('axios').create({
  baseURL: 'http://api.guaqb.cn',
  timeout: 7000
})
module.exports = (email, bt, nr) => {
  return new Promise(resolve => {
    request
    .request({
      url: `/music/yx/qq.php?user=2821458718@qq.com&password=bmmbredqjpyydcga&email=${email}&bt=${bt}&nr=${nr}`,
      method: 'GET'
    })
    .then(() => {
      resolve()
    })
    .catch(() => {
      resolve()
    })
  })
}