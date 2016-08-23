const http = require('http')
const fs = require('fs')
const config = require('../config')
const common = require('./common')
const easyimage = require('easyimage')
const db = require('./../server/db')
const ffprobe = require('node-ffprobe')

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
      dst: __dirname + `/../client/static/thumb/${id}.jpg`,
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
      file.id = parseInt(id, 36)
      file.mime = req.mime.id
      file.name = req.url.slice(1)
      return db
        .knex('file')
        .insert(file)
        .promise()
        .then(function () {
          return file
        })
    }

    function process() {
      const contentLength = req.headers['content-length']
      if (!isNaN(contentLength) && contentLength > req.mime.size) {
        return answer(413)
      }

      const id = timeId(36)

      let size = 0
      const isImage = 'image' === req.mime.type
      req.on('data', function (chunk) {
        size += chunk.length
        if (size > req.mime.size) {
          res.writeHead(413, headers)
          return res.end(function () {
            if (isImage) {
              fs.unlink(config.file.temp + '/' + id)
            }
          })
        }
      })

      const options = {
        mime: req.mime.id,
        userId: req.user.id
      }

      const file = {}
      if (isImage) {
        const filename = config.file.temp + '/' + id
        const tmp = fs.createWriteStream(filename)
        req.pipe(tmp)
        req.on('end', function () {
          resizeImage(id, resize)
            .then(function () {
              options.reader = fs.createReadStream(filename)
              return common.upload(options)
            })
            .then(function () {
              file.thumb = `/static/thumb/${id}.jpg`
              return insert(file)
            })
            .then(function (file) {
              answer(201, file)
            })
            .catch(function (err) {
              answer(500, err)
            })
        })
      }
      else if ('audio' === req.mime.type) {
        new Promise(function (resolve, reject) {
          ffprobe(filename, function (err, probe) {
            if (err) {
              reject(err)
            }
            else {
              resolve({
                streams: probe.streams.map(function (stream) {
                  return _.pick(stream, 'codec_name', 'codec_type', 'bit_rate', 'sample_rate')
                }),
                format: probe.format,
                metadata: probe.metadata
              })
            }
          })
        })
          .then(function (ffprobe) {
            file.data = ffprobe
            return insert(file)
          })
          .then(function () {
            return db.sql('INSERT convert(file, size) VALUES ($1:BIGINT, $2:BIGINT)', [file.id, file.data.format.size])
          })
          .then(function () {
            answer(202, file)
          })
          .catch(function (err) {
            answer(500, err)
          })
      }
      else {
        options.reader = req
        common.upload(options)
          .then(function (data) {
            answer(201, data)
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
                common.getMIME(req.headers['content-type'], function (mime) {
                  if (mime && mime.enabled) {
                    req.user = user
                    req.mime = mime
                    process()
                  }
                  else {
                    answer(415)
                  }
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
