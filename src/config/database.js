const mysql = require('mysql2')
const {
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  DB_HOST
} = process.env
const connection = mysql.createPool({
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  host: DB_HOST,
  database: DB_NAME,
  dateStrings: true
})
connection.getConnection((err, conn) => {
  if (err) {
    return console.log(`${DB_NAME}数据库连接失败: ${err.message}`)
  }
  conn.connect(err => {
    if (err) {
      return console.log(`${DB_NAME}数据库连接失败: ${err.message}`)
    }
    return console.log(`%c${DB_NAME}数据库连接成功`, 'color: blue; font-size: 12px;')
  })
})
module.exports = connection.promise()