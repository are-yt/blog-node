const { readdir } = require('fs')
const { resolve } = require('path')
module.exports = app => {
    const readPath = resolve(__dirname)
    readdir(readPath, (err, files) => {
        if (err) {
            return console.log('读取路由目录失败')
        }
        for (let i = 0; i < files.length; i++) {
            const extName = files[i].split('.')[1]
            if (extName !== 'js' || files[i] === 'index.js') {
                continue
            }
            const requirePath = resolve(__dirname, files[i])
            const router = require(requirePath)
            app.use(router.routes())
        }
    })
}