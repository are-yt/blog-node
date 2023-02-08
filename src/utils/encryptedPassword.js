const crypto = require('crypto')
const encryptedPassword = password => {
    return crypto.createHash('md5').update(password).digest('hex')
}
module.exports = encryptedPassword