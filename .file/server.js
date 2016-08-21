const http = require('http')
const fs = require('fs')
const config = require('../config')
const constants = require('../client/data')
const AWS = require('aws-sdk')
const crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient
const easyimage = require('easyimage')
const db = require('./../server/db')

function hash(string) {
  const h = crypto.createHash('sha256')
  h.update(string)
  return h.digest('base64')
}

const s3 = new AWS.S3(config.aws)

const start = Date.now() / 1000 - process.hrtime()[0]

function timeId(base) {
  let now = process.hrtime()
  now = (start + now[0]) * 1000 * 1000 * 1000 + now[1]
  return base ? now.toString(36) : now
}

const headers = {
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-max-age': '180',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, last-modified'
}

var mongo

function resizeImage(id, resize) {
  const filename = '/tmp/' + id
  let promise = easyimage.info(filename)
  if (resize) {
    promise = promise.then(function (info) {
      const ratio = info.width / info.height > 1
        ? config.image.resize.width / (8 * info.width)
        : config.image.resize.height / (8 * info.height)
      const options = {
        src: filename,
        dst: filename + '-resized',
        width: Math.round(info.width * ratio) * 8,
        height: Math.round(info.height * ratio) * 8,
        quality: config.image.resize.quality
      }
      return easyimage.resize(options)
    })
      .then(function () {
        return new Promise(function (resolve, reject) {
          fs.rename(filename + '-resized', filename, function (err) {
            if (err) {
              reject(err)
            }
            else {
              resolve()
            }
          })
        })
      })
  }
  return promise.then(function () {
    const options = {
      src: filename,
      dst: __dirname + `/../client/static/thumb/${id}.jpg`,
      width: config.image.thumb.width,
      height: config.image.thumb.height,
      quality: config.image.thumb.quality
    }
    return easyimage.thumbnail(options)
  })
}

function upload(user, req, res) {
  const type = req.headers['content-type']
  const mime = constants.mimes[type]
  if (!/\w+\/.*/.test(req.headers['content-type'])) {
    res.writeHead(400, headers)
    return res.end()
  }
  if (!mime) {
    res.writeHead(415, headers)
    return res.end()
  }
  const contentLength = req.headers['content-length']
  if (!isNaN(contentLength) && contentLength > mime.size) {
    res.writeHead(413, headers)
    return res.end()
  }
  const id = timeId(36)

  function bucket(options) {
    s3.createBucket(function () {
      const filename = req.url.slice(1)

      var params = {
        Key: id,
        Body: options.reader,
        CacheControl: 'public',
        ContentType: options.type,
        Metadata: {
          name: filename,
          user: user._id
        }
      }
      if ('last-modified' in req.headers) {
        const modified = new Date(req.headers['last-modified'])
        params.Metadata.modified = modified.toUTCString()
      }
      s3.upload(params, function (err, data) {
        function error(err) {
          res.writeHead(500, headers)
          res.end(JSON.stringify(err))
        }

        if (err) {
          error(err)
        }
        else {
          const fileType = constants.archives.indexOf(type) >= 0 ? 'archive' : type.split('/')[0]
          db
            .knex('file')
            .insert({
              id: parseInt(id, 36),
              type: fileType,
              name: filename,
              mime: type,
              thumb: `/static/thumb/${id}.jpg`
            })
            .promise()
            .then(function () {
              res.writeHead(201, headers)
              data.type = fileType
              res.end(JSON.stringify(data))
            })
            .catch(err)
        }
      })
    })
  }

  const resize = contentLength > config.image.resize.size
  let size = 0
  const willProcess = 0 === type.indexOf('image/')
  req.on('data', function (chunk) {
    size += chunk.length
    if (size > mime.size) {
      res.writeHead(413, headers)
      return res.end(function () {
        if (willProcess) {
          fs.unlink('/tmp/' + id)
        }
      })
    }
  })

  const options = {
    type: willProcess ? 'image/jpeg' : req.headers['content-type']
  }

  if (willProcess) {
    const filename = '/tmp/' + id
    const tmp = fs.createWriteStream(filename)
    req.pipe(tmp)
    req.on('end', function () {
      resizeImage(id, resize)
        .then(function () {
          options.reader = fs.createReadStream(filename)
          bucket(options)
        })
        .catch(function (err) {
          console.error(err)
          res.writeHead(500, headers)
          res.end(JSON.stringify(err))
        })
    })
  }
  else {
    options.reader = req
    bucket(options);
  }
}

const server = http.createServer(function (req, res) {
    switch (req.method) {
      case 'OPTIONS':
        res.writeHead(200, headers)
        res.end()
        break

      case 'POST':
        const token = /^Token\s+(.*)$/i.exec(req.headers.authorization)
        if (token) {
          mongo.collection('users').findOne({'services.resume.loginTokens': {$elemMatch: {hashedToken: hash(token[1])}}}, function (err, user) {
            if (user) {
              upload(user, req, res)
            }
            else {
              res.writeHead(403)
              res.end()
            }
          })
        }
        else {
          res.writeHead(403)
          res.end()
        }
        break

      default:
        res.writeHead(405)
        res.end()
        break
    }
  }
)

MongoClient.connect(config.mongo, function (err, _mongo) {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  else {
    mongo = _mongo
    server.listen(9080)
  }
})
