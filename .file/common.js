const config = require('../config')
const MongoClient = require('mongodb').MongoClient
const crypto = require('crypto')
const fs = require('fs')
const AWS = require('aws-sdk')
const stream = require('stream')
const db = require('db')

const s3 = new AWS.S3(config.aws)

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

function sha256(string) {
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
            .findOne({'services.resume.loginTokens': {$elemMatch: {hashedToken: sha256(token)}}}, cb)
        }
      })
    })
  },

  upload: function (options) {
    return new Promise(function (resolve, reject) {
      s3.createBucket(function () {
        var params = {
          Key: id,
          Body: options.reader,
          CacheControl: 'public',
          ContentType: options.mime,
          Metadata: {
            name: options.filename
          }
        }
        if (options.userId) {
          params.Metadata.user = options.userId
        }
        if (options.lastModified) {
          if (!options.lastModified instanceof Date) {
            options.lastModified = new Date(options.lastModified)
          }
          params.Metadata.modified = options.lastModified.toUTCString()
        }
        s3.upload(params, function (err, data) {
          if (err) {
            reject(err)
          }
          else {
            resolve(data)
          }
        })
      })
    })
  },

  getMIME: function (name) {
   return db.sql('SELECT * FROM mime WHERE id = $1', [name])
  }
}
