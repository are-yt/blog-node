const connection = require('../config/database')
const { unlinkSync } = require('fs')
const { resolve } = require('path')
const { HOST, PORT } = process.env
class Articles {
  async saveDraft(title, content, isTop) {
    // 先查询是否有草稿数据存在，有的话直接修改操作数据，没有就直接添加
    let statement = `
      SELECT * FROM articles WHERE draft = '0'
    `
    const [res] = await connection.execute(statement)
    if (res.length) {
      // 存在草稿数据
      const draftId = res[0].id
      statement = `
        UPDATE articles SET title = ?, content = ?, top = ? WHERE id = ?
      `
      const [res2] = await connection.execute(statement, [title ?? '', content ?? '', isTop ? '1' : '0', draftId])
      return res2
    } else {
      // 不存在草稿数据
      statement = `
        INSERT INTO articles (title, content, top) VALUES (?, ?, ?)
      `
      const [res3] = await connection.execute(statement, [title ?? '', content ?? '', isTop ? '1' : '0'])
      return res3
    }
  }
  async queryDraftId() {
    const statement = `
      SELECT id FROM articles WHERE draft = '0'
    `
    const [res] = await connection.execute(statement)
    return res[0].id
  }
  async saveDraftTagsAndCate(articleId, tags, cate) {
    // 先删除这个草稿文章之前保存的标签信息和分类信息
    let statement = `DELETE FROM article_tag WHERE article_id = ?`
    await connection.execute(statement, [articleId])
    statement = `DELETE FROM article_cate WHERE article_id = ?`
    await connection.execute(statement, [articleId])
    // 遍历每个标签id进行保存
    statement = `
      INSERT INTO article_tag (article_id, tag_id) VALUES (?, ?)
    `
    for (let i = 0; i < tags.length; i++) {
      await connection.execute(statement, [articleId, tags[i]])
    }
    // 再保存这个草稿文章的分类信息
    if (cate) {
      statement = `INSERT INTO article_cate (article_id, cate_id) VALUES (?, ?)`
      await connection.execute(statement, [articleId, cate])
    }
    return
  }
  async saveSurface(articleId, filename, mimetype) {
    // 草稿文章和展示文章上传的封面图接口共用这个
    // 先查找这个文章是否已有封面图
    let statement = `SELECT surface FROM articles WHERE id = ?`
    const [res] = await connection.execute(statement, [articleId])
    // 上传封面图是一定有了文章数据的，不用判断是否有匹配的文章
    if (res[0].surface) {
      // 已有封面图，删除原先的封面图
      unlinkSync(resolve(__dirname, '../pictures/article', res[0].surface))
    }
    statement = `UPDATE articles SET surface = ?, mimetype = ? WHERE id = ?`
    const [res1] = await connection.execute(statement, [filename, mimetype, articleId])
    return res1
  }
  async getDraft() {
    let statement = `
      SELECT
        id, content, title, top, surface
      from articles
      WHERE draft = '0'
    `
    const [res] = await connection.execute(statement)
    if (!res.length) {
      // 没有草稿数据
      return 0
    }
    return res
  }
  async queryArticleTags(articleId) {
    const statement = `
      SELECT JSON_ARRAYAGG(tag_id) list FROM article_tag WHERE article_id = ?
    `
    const [res] = await connection.execute(statement, [articleId])
    return res
  }
  async queryArticleCate(articleId) {
    const statement = `
      SELECT cate_id FROM article_cate WHERE article_id = ?
    `
    const [res] = await connection.execute(statement, [articleId])
    return res
  }
  async querySurface(articleId) {
    const statement = `
      SELECT mimetype, surface from articles WHERE id = ?
    `
    const [res] = await connection.execute(statement, [articleId])
    return res
  }
  async saveArticleImg(filename, mimetype) {
    const statement = `
      INSERT INTO file (filename, mimetype) VALUES (?, ?)
    `
    const [res] = await connection.execute(statement, [filename, mimetype])
    return res
  }
  async queryArticleImg(filename) {
    const statement = `
      SELECT mimetype FROM file WHERE filename = ?
    `
    const [res] = await connection.execute(statement, [filename])
    return res
  }
  async deleteDraft() {
    const statement = `
      DELETE FROM articles WHERE draft = '0'
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async release(title, content, tags, cate, isTop) {
    let statement = `
      INSERT INTO articles (title, content, top, draft) VALUES (?, ?, ?, ?)
    `
    const [{ insertId }] = await connection.execute(statement, [title, content, isTop ? '1' : '0', '1'])
    // 根据id在分别保存文章标签和文章分类的数据
    statement = `INSERT INTO article_tag (article_id, tag_id) VALUES (?, ?)`
    for (let i = 0; i < tags.length; i++) {
      await connection.execute(statement, [insertId, tags[i]])
    }
    statement = `INSERT INTO article_cate (article_id, cate_id) VALUES (?, ?)`
    await connection.execute(statement, [insertId, cate])
    return insertId
  }
  async querySurfaceFromDraft() {
    const statement = `
      SELECT surface, mimetype FROM articles WHERE draft = '0'
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async copySurfaceFromDraft(articleId, surface, mimetype) {
    const statement = `
      UPDATE articles SET surface = ?, mimetype = ? WHERE id = ?
    `
    const [res] = await connection.execute(statement, [surface, mimetype, articleId])
    return res
  }
  async deleteDraft() {
    const statement = `DELETE FROM articles WHERE draft = '0'`
    const [res] = await connection.execute(statement)
    return res
  }
  async saveContributeDate() {
    const statement = `
      INSERT INTO contribute () VALUES ()
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async getContribute() {
    const statement = `
      SELECT date FROM contribute
    `
    const [res] = await connection.execute(statement)
    return res
  }
  async getHotList() {
    // 查询置顶文章
    let statement = `
      SELECT * FROM articles WHERE top = '1'
    `
    let [res1] = await connection.execute(statement)
    // 最多显示3篇置顶文章
    if (res1.length > 3) {
      res1 = res1.splice(0, 3)
    }
    // 再查询浏览量最高的非置顶文章
    statement = `
      SELECT * FROM articles ORDER BY viewCount desc
    `
    let [res2] = await connection.execute(statement)
    // 只展示10条文章，包括置顶在内
    let index = 0
    while(index >= 0) {
      if (res1.length < 10 && index < res2.length) {
        const isFind = res1.findIndex(item => item.id === res2[index].id)
        if (isFind === -1) {
          res1.push(res2[index])
        }
        index++
      } else {
        index = -1
      }
    }
    // 再通过筛选出的热门文章获取对应文章的标签分类信息
    for (let i = 0; i < res1.length; i++) {
      statement = `
        SELECT cate_id FROM article_cate WHERE article_id = ?
      `
      const [[{ cate_id }]] = await connection.execute(statement, [res1[i].id])
      statement = `
        SELECT name cate_name FROM cate WHERE id = ?
      `
      const [[{ cate_name }]] = await connection.execute(statement, [cate_id])
      res1[i].cateName = cate_name
      statement = `
        SELECT JSON_ARRAYAGG(tag_id) tags FROM article_tag WHERE article_id = ?
      `
      const [[{ tags }]] = await connection.execute(statement, [res1[i].id])
      res1[i].tags = []
      for (let j = 0; j < tags.length; j++) {
        statement = `
          SELECT name tag_name FROM tags WHERE id = ?
        `
        const [[{ tag_name }]] = await connection.execute(statement, [tags[j]])
        res1[i].tags.push(tag_name)
      }
    }
    return res1
  }
  async getFiltrateArticleForTag(id, offset, size) {
    let statement = `
      SELECT JSON_ARRAYAGG(article_id) articleIdList FROM article_tag WHERE tag_id = ?
    `
    let [[{ articleIdList }]] = await connection.execute(statement, [id])
    articleIdList = articleIdList.splice(offset * size, size)
    // 根据查询到的相应文章id获取文章的具体信息
    statement = `
      SELECT * FROM articles WHERE id = ? AND draft = '1'
    `
    const list = []
    for (let i = 0; i < articleIdList.length; i++) {
      const [[res]] = await connection.execute(statement, [articleIdList[i]])
      list.push(res)
    }
    // 再查询每个文章的标签信息
    for (let i = 0; i < list.length; i++) {
      list[i].tags = []
      statement = `
        SELECT  JSON_ARRAYAGG(tag_id) tagList FROM article_tag WHERE article_id = ?
      `
      const [[{ tagList }]] = await connection.execute(statement, [list[i].id])
      // 根据查询到的标签id查询标签
      for (let j = 0; j < tagList.length; j++) {
        statement = `
          SELECT * FROM tags WHERE id = ?
        `
        const [[tagObj]] = await connection.execute(statement, [tagList[j]])
        list[i].tags.push(tagObj)
      }
      // 根据每个文章id查询分类信息
      list[i].cate = {}
      statement = `
        SELECT cate_id FROM article_cate WHERE article_id = ?
      `
      const [[{ cate_id }]] = await connection.execute(statement, [list[i].id])
      statement = `
        SELECT * FROM cate WHERE id = ?
      `
      const [[ cateObj ]] = await connection.execute(statement, [cate_id])
      list[i].cate = cateObj
    }
    return list
  }
  async getFiltrateArticleForTagTotal(id) {
    const statement = `
      SELECT COUNT(*) total FROM article_tag WHERE tag_id = ?
    `
    const [[{ total }]] = await connection.execute(statement, [id])
    return total
  }
  async getFiltrateArticleForCate(id, offset, size) {
    // 找到与这个分类id有关的所有文章id
    let statement = `
      SELECT JSON_ARRAYAGG(article_id) articleIdList FROM article_cate WHERE cate_id = ?
    `
    const [[{ articleIdList }]] = await connection.execute(statement, [id])
    // 再根据查询到所有有关的文章id查询对应文章的具体信息
    let list = []
    for (let i = 0; i < articleIdList.length; i++) {
      statement = `
        SELECT * FROM articles WHERE id = ?
      `
      const [[ articleObj ]] = await connection.execute(statement, [articleIdList[i]])
      list.push(articleObj)
    }
    list = list.splice(offset * size, size)
    // 查询每个文章的标签
    for (let i = 0; i < list.length; i++) {
      statement = `
        SELECT JSON_ARRAYAGG(tag_id) tagList FROM article_tag WHERE article_id = ?
      `
      const [[{ tagList }]] = await connection.execute(statement, [list[i].id])
      list[i].tags = []
      for (let j = 0; j < tagList.length; j++) {
        statement = `
          SELECT * FROM tags WHERE id = ?
        `
        const [[ tagObj ]] = await connection.execute(statement, [tagList[j]])
        list[i].tags.push(tagObj)
      }
      // 查找分类信息
      statement = `
        SELECT *  FROM cate WHERE id = ?
      `
      const [[ cateObj ]] = await connection.execute(statement, [id])
      list[i].cate = cateObj
    }
    return list
  }
  async getFiltrateArticleForCateTotal(id) {
    const statement = `
      SELECT COUNT(*) total FROM article_cate WHERE cate_id = ?
    `
    const [[{ total }]] = await connection.execute(statement, [id])
    return total
  }
  async getDetail(id) {
    let statement = `
      SELECT * FROM articles WHERE id = ?
    `
    const [[ articleInfo ]] = await connection.execute(statement, [id])
    // 获取文章标签信息
    statement = `
      SELECT JSON_ARRAYAGG(tag_id) tagList FROM article_tag WHERE article_id = ?
    `
    const [[{ tagList }]] = await connection.execute(statement, [id])
    articleInfo.tags = []
    for (let i = 0; i < tagList.length; i++) {
      statement = `
        SELECT * FROM tags WHERE id = ?
      `
      const [[ tagInfo ]] = await connection.execute(statement, [tagList[i]])
      articleInfo.tags.push(tagInfo)
    }
    // 获取文章分类信息
    statement = `
      SELECT cate_id FROM article_cate WHERE article_id = ?
    `
    const [[{ cate_id }]] = await connection.execute(statement, [id])
    statement = `
      SELECT * FROM cate WHERE id = ?
    `
    const [[ cateInfo ]] = await connection.execute(statement, [cate_id])
    articleInfo.cate = cateInfo
    return articleInfo
  }
  async addClickCount(id) {
    let statement = `
      SELECT viewCount FROM articles WHERE id =?
    `
    const [[{ viewCount }]] = await connection.execute(statement, [id])
    statement = `
      UPDATE articles SET viewCount = ? WHERE id = ?
    `
    const [res] = await connection.execute(statement, [viewCount + 1, id])
    return res
  }
  async sendComment(obj) {
    const { content, userId, articleId, replyId, parentId, city } = obj
    const statement = `
      INSERT INTO comment_article (content, user_id, article_id, city, reply_id, parent_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    const [res] = await connection.execute(statement, [content, userId, articleId, city, replyId, parentId])
    return res
  }
  async getCommentList(obj) {
    const { offset, size, articleId } = obj
    // 查找与articleId有关的评论信息
    let statement = `
      SELECT * FROM comment_article WHERE article_id = ? AND parent_id IS NULL ORDER BY createAt desc
    `
    let [comments] = await connection.execute(statement, [articleId])
    comments = comments.splice(offset * size, size)
    // 根据每个评论获取对应的回复信息
    statement = `
      SELECT * FROM comment_article WHERE parent_id = ?
    `
    for (let i = 0; i < comments.length; i++) {
      comments[i].replyList = [] 
      const [replyList] = await connection.execute(statement, [comments[i].id])
      // 如果有reply_id根据reply_id查找回复用户的nickname
      for (let j = 0; j < replyList.length; j++) {
        if (!replyList[j].reply_id) {
          continue
        }
        statement = `SELECT nickname FROM account WHERE id = ?`
        const [[{ nickname }]] = await connection.execute(statement, [replyList[j].reply_id])
        replyList[j].reply_name = nickname
      }
      comments[i].replyList.push(...replyList)
    }
    // 查询每条评论的点赞信息
    statement = `
      SELECT JSON_ARRAYAGG(user_id) endorse FROM comment_article_endorse WHERE comment_id = ?
    `
    for (let i = 0; i < comments.length; i++) {
      comments[i].endorse = []
      const [[{ endorse }]] = await connection.execute(statement, [comments[i].id])
      if (endorse) {
        comments[i].endorse.push(...endorse)
      }
      if (comments[i].replyList.length) {
        for (let j = 0; j < comments[i].replyList.length; j++) {
          const [[{ endorse }]] = await connection.execute(statement, [comments[i].replyList[j].id])
          comments[i].replyList[j].endorse = []
          if (endorse) {
            comments[i].replyList[j].endorse.push(...endorse)
          }
        }
      }
    }
    // 查询每条评论的用户信息
    for (let i = 0; i < comments.length; i++) {
      statement = `
        SELECT nickname FROM account WHERE id = ?
      `
      const [[{ nickname }]] = await connection.execute(statement, [comments[i].user_id])
      comments[i].nickname = nickname
      statement = `
        SELECT name FROM avatar WHERE user_id = ?
      `
      const [[{ name }]] = await connection.execute(statement, [comments[i].user_id])
      comments[i].avatar = `http://${HOST}:${PORT}/user/avatar/${name}`
      if (comments[i].replyList.length) {
        for (let j = 0; j < comments[i].replyList.length; j++) {
          statement = `
            SELECT nickname FROM account WHERE id = ?
          `
          const [[{ nickname }]] = await connection.execute(statement, [comments[i].replyList[j].user_id])
          comments[i].replyList[j].nickname = nickname
          statement = `
            SELECT name FROM avatar WHERE user_id = ?
          `
          const [[{ name }]] = await connection.execute(statement, [comments[i].replyList[j].user_id])
          comments[i].replyList[j].avatar = `http://${HOST}:${PORT}/user/avatar/${name}`
        }
      }
    }
    return comments
    // 根据每条评论id查询点赞信息
  }
  async getCommentTotalForArticleId(articleId) {
    const statement = `
      SELECT COUNT(*) total FROM comment_article WHERE article_id = ? AND parent_id IS NULL
    `
    const [[{ total }]] = await connection.execute(statement, [articleId])
    return total
  }
  async getCommentAllCountForArticleId(articleId) {
    const statement = `
    SELECT COUNT(*) total FROM comment_article WHERE article_id = ?
    `
    const [[{ total }]] = await connection.execute(statement, [articleId])
    return total
  }
  async commentEndorse(obj) {
    const { commentId, userId } = obj
    // 先查询用户是否已点赞这个评论
    let statement = `
      SELECT * FROM comment_article_endorse WHERE comment_id = ? AND user_id = ?
    `
    const [res] = await connection.execute(statement, [commentId, userId])
    if (res.length) {
      // 用户已点赞这个评论
      // 这是一次取消点赞操作，删除点赞数据
      statement = `
        DELETE FROM comment_article_endorse WHERE comment_id = ? AND user_id = ?
      `
      await connection.execute(statement, [commentId, userId])
      return 0
    }
    // 这是一次点赞操作
    statement = `
      INSERT INTO comment_article_endorse (comment_id, user_id) VALUES (?, ?)
    `
    await connection.execute(statement, [commentId, userId])
    return 1
  }
}
module.exports = new Articles()