const http = require('http')
const fs = require('fs')
const config = require('../config')
const common = require('./common')
const easyimage = require('easyimage')
const db = require('../meteor/server/db')
const _ = require('underscore')
const crypto = require('crypto')
const qs = require('querystring')

const start = Date.now() / 1000 - process.hrtime()[0]

function timeId() {
  let now = process.hrtime()
  now = (start + now[0]) * 1000 * 1000 * 1000 + now[1]
  return now.toString()
}

const headers = {
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-max-age': '180',
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, last-modified'
}

function resizeImage(id, resize) {
  const filename = config.file.temp + '/' + id
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
      dst: __dirname + `/../public/thumb/${id}.jpg`,
      width: config.image.thumb.width,
      height: config.image.thumb.height,
      quality: config.image.thumb.quality
    }
    return easyimage.thumbnail(options)
  })
}

const server = http.createServer(function (req, res) {
    function answer(code, data) {
      res.writeHead(code, headers)
      if (data) {
        if (code >= 400) {
          console.error(code, data)
        }
        res.end(JSON.stringify(data))
      }
      else {
        res.end()
      }
    }

    function insert(file) {
      return db
        .table('file')
        .insert(file)
        .promise()
        .then(function () {
          return db.table('message')
            .insert({id: file.id, from: req.user._id, type: 'file'})
            .promise()
        })
    }

    function process() {
      let bucketResponse
      const file = {
        id: timeId(),
        name: req.url.slice(1)
      }
      const id = file.id
      const uploadOptions = {
        Key: id,
        ContentType: req.mime.id,
        Metadata: {
          user: req.user._id,
          name: file.name
        }
      }

      function success(code) {
        if (uploadOptions.size) {
          file.size = uploadOptions.size
        }
        if (bucketResponse.ETag && bucketResponse.Location) {
          bucketResponse.ETag = bucketResponse.ETag.slice(1, -1)
          bucketResponse.success = true
        }
        answer(code, _.extend(file, bucketResponse))
      }

      const contentLength = +req.headers['content-length']
      if (!isNaN(contentLength) && contentLength > req.mime.size) {
        return answer(413)
      }

      let size = 0
      const md5 = crypto.createHash('md5')
      const isImage = 'image' === req.mime.type
      req.on('data', function (chunk) {
        size += chunk.length
        if (size > req.mime.size) {
          res.writeHead(413, headers)
          return res.end(function () {
            if (isImage) {
              common.remove(id)
            }
          })
        }
        md5.update(chunk)
      })
      req.on('end', function () {
        file.hash = md5.digest('hex')
      })

      const filename = config.file.temp + '/' + id
      if (isImage) {
        common.saveFile(req, filename)
          .then(function () {
            return resizeImage(id, size > config.image.resize.size)
          })
          .then(function () {
            return common.fileStat(filename)
          })
          .then(function (stat) {
            file.size = stat.size
            uploadOptions.filename = filename
            if (size > config.image.resize.size) {
              file.mime = uploadOptions.ContentType = 'image/jpeg'
            }
            else {
              file.mime = req.mime.id
            }
            return common.upload(uploadOptions)
          })
          .then(function (data) {
            bucketResponse = data
            file.thumb = `/thumb/${id}.jpg`
            return insert(file)
          })
          .then(function () {
            success(201)
          })
          .catch(function (err) {
            answer(500, err)
          })
      }
      else if ('audio' === req.mime.type) {
        common.saveFile(req, filename)
          .then(function () {
            return common.probe(filename)
          })
          .then(function (probe) {
            file.data = common.lowercase(probe)
            return insert(file)
          })
          .then(function () {
            return db
              .knex('convert')
              .insert({
                file: file.id,
                size: file.data.format.size
              })
              .promise()
          })
          .then(function () {
            answer(202, file)
          })
          .catch(function (err) {
            answer(500, err)
          })
      }
      else {
        uploadOptions.Body = req
        common.upload(uploadOptions)
          .then(function (data) {
            bucketResponse = data
            file.size = size
            success(201)
          })
          .catch(function (err) {
            answer(500, err)
          })
      }
    }

    switch (req.method) {
      case 'OPTIONS':
        answer(200)
        break

      case 'POST':
        const token = /^Token\s+(.*)$/i.exec(req.headers.authorization)
        if (token) {
          common
            .authenticate(token[1])
            .then(function (user) {
              if (!req.headers['content-type']) {
                answer(400)
              }
              else if (user) {
                common.getMIME(req.headers['content-type'])
                  .then(function (mime) {
                    if (mime && mime.enabled) {
                      req.user = user
                      req.mime = mime
                      process()
                    }
                    else {
                      answer(415)
                    }
                  })
                  .catch(function (err) {
                    answer(500, err)
                  })
              }
              else {
                answer(403)
              }
            })
            .catch(function (err) {
              answer(500, err)
            })
        }
        else {
          answer(500)
        }
        break

      default:
        answer(405)
        break
    }
  }
)

server.listen(config.file.port, '0.0.0.0')
