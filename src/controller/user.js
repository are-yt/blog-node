const {
  userIsRegistered,
  registerNewUser,
  queryUserInfo,
  queryUserAvatar,
  userIsMatch,
  updatePassword,
  updateName,
  updateAvatar,
  queryUserAvatarMimetype
} = require('../services/user')
const encryptedPassword = require('../utils/encryptedPassword')
const jwt = require('jsonwebtoken')
const { readFileSync, unlinkSync, createReadStream } = require('fs')
const { resolve } = require('path')
const jimp = require('jimp')
const { HOST, PORT } = process.env
const PRIVATE_KEY = readFileSync(resolve(__dirname, '../keys/private.key'))
const PUBLIC_KEY = readFileSync(resolve(__dirname, '../keys/public.key'))
class UserController {
  async login(ctx) {
    const { type, email } = ctx.request.body
    let password = ctx.request.body.password
    if (password) {
      password = encryptedPassword(password)
    }
    const typeList = ['password', 'code']
    if (!typeList.includes(type)) {
      return ctx.app.emit('error', new Error('需要type字段为password或code'), 400, ctx)
    }
    if (type === 'code') {
      // 这是一次验证码登录
      // 1.先检查用户是否注册过
      // 2.未注册先注册，然后颁发token，注册过了的直接颁发token
      try {
        const res = await userIsRegistered(email)
        if (res.length) {
          // 用户注册过,验证码在前端已验证成功，颁发token
          const { id, nickname, type } = await queryUserInfo(email)
          // 再通过id查询用户头像
          const [{ name }] = await queryUserAvatar(id)
          const token = jwt.sign({ name: 'xiaolan' }, PRIVATE_KEY, {
            algorithm: 'RS256',
            expiresIn: 60 * 60 * 24
          })
          return ctx.body = {
            message: '登录成功',
            nickname,
            id,
            type,
            token,
            avatar: `http://${HOST}:${PORT}/user/avatar/${name}`,
            success: true,
            errMsg: '',
            code: 200
          }
        } else {
          // 没有注册过，先注册，然后颁发token
          const registerRes = await registerNewUser(email, encryptedPassword(email))
          const { id, nickname, type } = await queryUserInfo(email)
          const token = jwt.sign({id, type}, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24 * 10,
            algorithm: 'RS256'
          })
          return ctx.body = {
            message: '注册成功,默认密码为邮箱账号',
            nickname,
            id,
            type,
            token,
            avatar: '',
            success: true,
            errMsg: '',
            code: 200
          }
        }
      } catch(err) {
        ctx.app.emit('error', err, 500, ctx)
      }
    } else if (type === 'password') {
      // 这是一次密码登录
      // 1.验证邮箱密码正确性
      // 2.正确则颁发token、不正确返回错误相关信息
      try {
        const res = await userIsMatch(email, password)
        if (res.length) {
          // 匹配成功
          const { nickname, id, type } = await queryUserInfo(email)
          const [{ name }] = await queryUserAvatar(id)
          const token = jwt.sign({id, type}, PRIVATE_KEY, {
            expiresIn: 60 * 60 * 24 * 10,
            algorithm: 'RS256'
          })
          return ctx.body = {
            message: '登录成功',
            nickname,
            id,
            type,
            token,
            avatar: `http://${HOST}:${PORT}/user/avatar/${name}`,
            success: true,
            errMsg: '',
            code: 200
          }
        } else {
          // 匹配失败
          return ctx.body = {
            message: '',
            success: false,
            errMsg: '账号或密码错误',
            code: 200
          }
        }
      } catch(err) {
        return ctx.app.emit('error', new Error(err), 500, ctx)
      }
    }
  }
  async forget(ctx) {
    const { email, newPassword } = ctx.request.body
    // 查询修改密码的邮箱账号是否已注册
    try {
      const res = await userIsRegistered(email)
      if (!res.length) {
        return ctx.body = {
          message: '',
          success: false,
          errMsg: '该邮箱账号没有注册',
          code: 200
        }
      } else {
        // 注册过的，且已在前端校验输入正确性，这里直接修改密码
        const res = await updatePassword(email, encryptedPassword(newPassword))
        if (res.affectedRows) {
          // 修改成功
          return ctx.body = {
            message: '密码修改成功,请重新登录',
            success: true,
            errMsg: '',
            code: 200
          }
        } else {
          // 修改失败
          return ctx.body = {
            message: '',
            success: false,
            errMsg: '修改失败,请稍后再试',
            code: 200
          }
        }
      }
    } catch(err) {
      return ctx.app.emit('error', err, 500, ctx)
    }
  }
  async verify(ctx) {
    // 登录令牌验证
    const token = ctx.request.headers.authorization
    if (!token) {
      return ctx.body = {
        message: '没有登录',
        data: {
          code: 0
        },
        errMsg: '',
        code: 200,
        success: true
      }
    } else {
      try {
        jwt.verify(token, PUBLIC_KEY, {
          algorithms: ['RS256']
        })
        // token解析成功，有效
        return ctx.body = {
          data: {
            code: 1
          },
          message: 'token有效',
          errMsg: '',
          code: 200,
          success: true
        }
      } catch(err) {
        return ctx.body = {
          data: {
            code: -1
          },
          message: '',
          errMsg: '登录过期',
          code: 200,
          success: false
        }
      }
    }
  }
  async updateName(ctx) {
    // 修改用户昵称
    const name = ctx.request.params.name
    const id = ctx.userId
    try {
      const res = await updateName(id, name)
      if (res.affectedRows) {
        // 修改成功
        return ctx.body = {
          code: 200,
          message: '昵称修改成功',
          errMsg: '',
          success: true
        }
      }
      // 修改失败
      ctx.body = {
        code: 200,
        message: '',
        errMsg: '昵称修改失败,请稍后再试',
        success: false
      }
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async updateAvatar(ctx) {
    // 修改用户头像
    const id = ctx.userId
    const { filename, mimetype } = ctx.req.file
    // 这个图片被保存的位置
    const saveAddr = resolve(__dirname, '../pictures/avatar', filename)
    // 裁剪这个图片成缩略图，减小它的体积
    jimp.read(saveAddr).then(image => {
      // 读取到了之后把原图删掉
      unlinkSync(saveAddr)
      image.resize(120, jimp.AUTO).write(saveAddr)
    })
    // 保存头像数据
    try {
      const res = await updateAvatar(id, filename, mimetype)
      if (res.affectedRows) {
        // 保存修改的头像数据成功
        return ctx.body = {
          code: 200,
          message: '修改头像成功',
          errMsg: '',
          success: true,
          url: `http://${HOST}:${PORT}/user/avatar/${filename}`
        }
      }
      // 保存失败
      unlinkSync(saveAddr)
      ctx.body = {
        code: 200,
        message: '',
        errMsg: '修改头像失败',
        success: false
      }
    } catch(err) {
      unlinkSync(saveAddr)
      ctx.app.emit('error', err, 500, ctx)
    }
  }
  async getAvatar(ctx) {
    const filename = ctx.request.params.filename
    // 上传的图片文件名经过koa-multer的处理是随机的不会重复，因此获取图片的接口参数不需要携带用户id或其他
    // 根据filename获取头像文件的类型
    try {
      const [{ mimetype }] = await queryUserAvatarMimetype(filename)
      // 设置响应类型
      ctx.response.set('content-type', mimetype)
      // 创建读取流
      ctx.body = createReadStream(resolve(__dirname, '../pictures/avatar', filename))
    } catch(err) {
      ctx.app.emit('error', err, 500, ctx)
    }
  }
}
module.exports = new UserController()