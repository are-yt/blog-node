const requestIp = require('@supercharge/request-ip')
const axios = require('axios').create()
const linkServices = require('../services/link')
class Link {
  async addComment(ctx) {
    const userId = ctx.userId
    const { content, reply_id, parent_id } = ctx.request.body
    // 获取请求者ip并转为具体城市地址
    try {
      const ip = requestIp.getClientIp(ctx)
      const city = await (async () => {
        return new Promise(resolve => {
          axios
            .request({
              url: `https://restapi.amap.com/v3/ip?ip=${ip}&output=json&key=74ed4546b6181e20bfdaa6f96ed3f861`
            })
            .then(res => {
              if (res.data.city.length === 0) {
                resolve('内网')
              } else {
                resolve(res.data.city)
              }
            })
            .catch(err => {
              ctx.app.emit('error', err, 500, ctx)
            })
        })
      })();
      const res = await linkServices.addComment(content, city, userId, reply_id, parent_id)
      if (res.affectedRows) {
        // 发表友链评论成功
        return ctx.body = {
          code: 200,
          message: '发表评论成功',
          success: true,
          comment_id: res.insertId,
          city
        }
      }
      ctx.body = {
        code: 200,
        errMsg: '发表评论失败',
        success: false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getCommentList(ctx) {
    const { offset, size } = ctx.request.params
    try {
      const list = await linkServices.getCommentList(offset, size)
      const [{ total }] = await linkServices.getCommentTotal()
      const [{ allCount }] = await linkServices.getAllCommentTotal()
      ctx.body = {
        code: 200,
        message: '获取评论分页数据成功',
        success: true,
        list,
        total,
        allCount
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async endorse(ctx) {
    const userId = ctx.userId
    const commentId = ctx.request.params.commentId
    try {
      const isEndorse = await linkServices.endorse(userId, commentId)
      ctx.body = {
        code: 200,
        success: true,
        message: isEndorse ? '点赞成功' : '取消点赞',
        endorse: isEndorse ? true : false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getLinkList(ctx) {
    try {
      const list = await linkServices.getLinkList()
      ctx.body = {
        code: 200,
        message: '获取友链数据成功',
        success: true,
        list
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Link()