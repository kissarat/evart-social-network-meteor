const config = require('../config')
const MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')
const fs = require('fs')

try {
  fs.accessSync(config.file.temp, fs.constants.W_OK)
}
catch (ex) {
  if ('ENOENT' === ex.code) {
    fs.mkdirSync(config.file.temp)
  }
  else {
    console.error(ex)
    process.exit(1)
  }
}

function hash(string) {
  const h = crypto.createHash('sha256')
  h.update(string)
  return h.digest('base64')
}

module.exports = {
  authenticate: function (token) {
    return new Promise(function (resolve, reject) {
      function cb(err, user) {
        if (err) {
          reject(err)
        }
        else {
          resolve(user)
        }
      }
      MongoClient.connect(config.mongo, function (err, db) {
        if (err) {
          reject(err)
        }
        else {
          db.collection('users')
            .findOne({'services.resume.loginTokens': {$elemMatch: {hashedToken: hash(token)}}}, cb)
        }
      })
    })
  }
}
