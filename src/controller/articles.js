const articlesServices = require('../services/articles')
const { fork } = require('child_process')
const moment = require('moment')
const { HOST, PORT } = process.env
const { createReadStream } = require('fs')
const { resolve } = require('path')
const requestIp = require('@supercharge/request-ip')
const axios = require('axios').create()
class Articles {
  async saveDraft(ctx) {
    // 接收tags、cate、title、content、isTop参数
    // 文章封面用单独的接口
    const { tags, cate, title, content, isTop } = ctx.request.body
    // 先保存title、content、isTop，没传递为默认值
    try {
      const res = await articlesServices.saveDraft(title, content, isTop)
      // 继续保存标签分类
      // 获取草稿文章id
      const id = await articlesServices.queryDraftId()
      // // 根据id保存标签和分类
      await articlesServices.saveDraftTagsAndCate(id, tags, cate)
      return ctx.body = {
        code: 200,
        message: '保存草稿内容成功',
        id,
        success: true
      }
    } catch(err) {
      return ctx.app.emit('error', err, 400, ctx)
    }
  }
  async saveSurface(ctx) {
    const { filename, mimetype } = ctx.req.file
    const articleId = ctx.request.params.articleId
    if (!articleId) {
      return ctx.body = {
        code: 200,
        errMsg: '缺乏必要参数article_id',
        success: true
      }
    }
    try {
      const res = await articlesServices.saveSurface(articleId, filename, mimetype)
      if (res.affectedRows) {
        // 更新文章封面图成功
        return ctx.body = {
          code: 200,
          message: '更新封面图成功',
          success: true
        }
      }
      ctx.body = {
        code: 200,
        errMsg: '更新封面图失败',
        success: false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getDraft(ctx) {
    try {
      const res = await articlesServices.getDraft()
      if (res === 0) {
        return ctx.body = {
          code: 200,
          success: true,
          message: '没有草稿数据',
          data: null
        }
      }
      // 有草稿数据，再查询这个草稿文章的分类和标签数据
      const articleId = res[0].id
      const tags = await articlesServices.queryArticleTags(articleId)
      const cate = await articlesServices.queryArticleCate(articleId)
      const surface = `http://${HOST}:${PORT}/articles/surface/${articleId}`
      res[0].surface = surface
      ctx.body = {
        code: 200,
        success: true,
        message: '获取草稿信息成功',
        data: {
          ...res[0],
          tags: tags[0].list,
          cate: cate[0].cate_id
        }
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getSurface(ctx) {
    const articleId = ctx.request.params.articleId
    try {
      const res = await articlesServices.querySurface(articleId)
      const { surface, mimetype } = res[0]
      ctx.response.set('content-type', mimetype)
      ctx.body = createReadStream(resolve(__dirname, '../pictures/article', surface))
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async uploadArticleImg(ctx) {
    const { filename, mimetype } = ctx.req.file
    try {
      const res = await articlesServices.saveArticleImg(filename, mimetype)
      if (res.affectedRows) {
        const url = `http://${HOST}:${PORT}/articles/file/${filename}`
        return ctx.body = {
          code: 200,
          message: '插入图片成功',
          success: true,
          list: {url, title: ''}
        }
      }
      ctx.body = {
        code: 200,
        success: false,
        errMsg: '插入图片失败'
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getArticleImg(ctx) {
    const filename = ctx.request.params.filename
    try {
      const [{ mimetype }] = await articlesServices.queryArticleImg(filename)
      ctx.response.set('content-type', mimetype)
      ctx.body = createReadStream(resolve(__dirname, '../pictures/article', filename))
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async release(ctx) {
    const { title, content, cate, tags, isTop } = ctx.request.body
    if (!title || !content || !cate || !tags || isTop === undefined) {
      return ctx.body = {
        code: 200,
        errMsg: '缺乏必要参数',
        success: false
      }
    }
    try {
      const newArticleId = await articlesServices.release(title, content, tags, cate, isTop)
      // 开启一个单独的子进程去给所有订阅了该博客的用户邮箱发送通知
      const cp = fork(resolve(__dirname, '../works/sendNotice.js'))
      cp.send({ title })
      ctx.body = {
        code: 200,
        newArticleId,
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async saveSurfaceFromDraft(ctx) {
    const articleId = ctx.request.params.articleId
    // 从草稿文章数据中获取封面图信息
    try {
      const [{surface, mimetype}] = await articlesServices.querySurfaceFromDraft()
      // 将草稿文章数据中的封面图信息复制到发表的文章数据中
      // ...
      const res = await articlesServices.copySurfaceFromDraft(articleId, surface, mimetype)
      if (res.affectedRows) {
        return ctx.body = {
          code: 200,
          success: true
        }
      }
      ctx.body = {
        code: 200,
        success: false,
        errMsg: '发表文章的封面图上传失败'
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async deleteDraft(ctx) {
    try {
      await articlesServices.deleteDraft()
      ctx.body = {
        code: 200,
        message: '删除草稿文章成功',
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async saveContributeDate(ctx) {
    try {
      await articlesServices.saveContributeDate()
      ctx.body = {
        code: 200,
        message: '保存贡献记录成功',
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getContribute(ctx) {
    try {
      const res = await articlesServices.getContribute()
      for (let i = 0; i < res.length; i++) {
        // 先格式化日期
        res[i].date = moment(res[i].date).format('YYYY-MM-DD')
      }
      // 再处理日期贡献次数
      const list = []
      for (let i = 0; i < res.length; i++) {
        const index = list.findIndex(item => item.date === res[i].date)
        if (index === -1) {
          list.push({ date: res[i].date, count: 1 })
        } else {
          list[index].count++
        }
      }
      ctx.body = {
        code: 200,
        message: '获取贡献数据成功',
        success: true,
        list
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getHotList(ctx) {
    try {
      const list = await articlesServices.getHotList()
      list.forEach(item => (item.surface = `http://${HOST}:${PORT}/articles/surface/${item.id}`))
      ctx.body = {
        code: 200,
        message: '获取首页热门文章成功',
        success: true,
        list
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getFiltrateArticle(ctx) {
    let { type, id, offset, size } = ctx.request.params
    type = Number(type)
    id = Number(id)
    if (type !== 1 && type !== 0) {
      return ctx.body = {
        code: 200,
        errMsg: 'type参数必须为number类型的0或1',
        success: false
      }
    }
    if (type === 1) {
      // 标签筛选
      try {
        const list = await articlesServices.getFiltrateArticleForTag(id, offset, size)
        const total = await articlesServices.getFiltrateArticleForTagTotal(id)
        list.forEach(item => {
          item.surface = `http://${HOST}:${PORT}/articles/surface/${item.id}`
        })
        ctx.body = {
          code: 200,
          success: true,
          list,
          total
        }
      } catch(err) {
        ctx.app.emit('error', err, 500, ctx)
      }
    } else {
      // 分类筛选
      try {
        const list = await articlesServices.getFiltrateArticleForCate(id, offset, size)
        const total = await articlesServices.getFiltrateArticleForCateTotal(id)
        list.forEach(item => {
          item.surface = `http://${HOST}:${PORT}/articles/surface/${item.id}`
        })
        ctx.body = {
          code: 200,
          success: true,
          list,
          total
        }
      } catch(err) {
        ctx.app.emit('error', err, 500, ctx)
      }
    }
  }
  async getDetail(ctx) {
    const id = ctx.request.params.id
    try {
      const articleInfo = await articlesServices.getDetail(id)
      ctx.body = {
        code: 200,
        message: '获取文章详情成功',
        success: true,
        data: articleInfo
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async addClickCount(ctx) {
    const id = ctx.request.params.id
    try {
      const res = await articlesServices.addClickCount(id)
      ctx.body = {
        code: 200,
        message: '增加点击量成功',
        success: true
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async sendComment(ctx) {
    const userId = ctx.userId
    const articleId = ctx.request.params.articleId
    const { content, replyId, parentId } = ctx.request.body
    try {
      // 获取ip
      const ip = requestIp.getClientIp(ctx)
      // 然后根据ip获取ip地址
      const city = await (() => {
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
      })()
      // 保存评论信息
      const res = await articlesServices.sendComment({ content, city, userId, articleId, replyId, parentId })
      ctx.body = {
        code: 200,
        success: true,
        commentId: res.insertId,
        city
      }
    } catch(err) {
      console.log(err.message)
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getCommentList(ctx) {
    const { offset, size, articleId } = ctx.request.params
    try {
      const list = await articlesServices.getCommentList({ offset, size, articleId })
      const total = await articlesServices.getCommentTotalForArticleId(articleId)
      const allCount = await articlesServices.getCommentAllCountForArticleId(articleId)
      ctx.body = {
        code: 200,
        success: true,
        message: '获取文章评论分页数据成功',
        list,
        total,
        allCount
      }
    } catch(err) {
      console.log(err.message)
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async commentEndorse(ctx) {
    const userId = ctx.userId
    const commentId = ctx.request.params.commentId
    try {
      const res = await articlesServices.commentEndorse({userId, commentId})
      ctx.body = {
        code: 200,
        success: true,
        endorse: res ? true : false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new Articles()