const Koa = require('koa')
const bodyparser = require('koa-bodyparser')
const { fork } = require('child_process')
const { resolve } = require('path')
const cors = require('koa2-cors')
require('dotenv').config()
require('./config/database')
const registerRouter = require('./router')
const app = new Koa()
registerRouter(app)
app.use(cors({
	origin: ctx => {
		// 跨域请求中允许客户端携带cookie,也需要在客户端的请求中加入withCredentials: true的请求配置
		ctx.set('Access-Control-Allow-Credentials', true)
		// const whiteList = ['http://localhost:8080']
		// const url = ctx.header.referer.substring(0, ctx.header.referer.length - 1)
		// if (whiteList.includes(url)) {
		// 	return url
		// }
		// 允许所有客户端访问
		return ctx.header.referer.substring(0, ctx.header.referer.length - 1)
	}
}))
app.use(bodyparser())
app.on('error', require('./utils/handleError'))
const { PORT, HOST } = process.env
app.listen(PORT, HOST, () => {
  console.log('服务已启动,端口:' + PORT)
  // 单独开启一个进程统计应用运行时间
  fork(resolve(__dirname, './works/incrementRuningTime'))
})