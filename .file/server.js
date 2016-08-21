const http = require('http')
const config = require('../config')
const AWS = require('aws-sdk')
const crypto = require('crypto')
const MongoClient = require('mongodb').MongoClient;

function hash(string) {
  const h = crypto.createHash('sha256')
  h.update(string)
  return h.digest('base64')
}

const s3 = new AWS.S3({
  endpoint: config.aws.endpoint,
  signatureVersion: config.aws.signatureVersion,
  region: config.aws.region
})

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
              s3.createBucket(function () {
                const id = timeId(36)
                const filename = req.url.slice(1)
                console.log(req.headers)

                var params = {
                  Key: id,
                  Body: req,
                  CacheControl: 'public',
                  ContentType: req.headers['content-type'],
                  Bucket: config.aws.bucket,
                  Metadata: {
                    name: filename,
                    user: user._id
                  }
                }
                if ('last-modified' in req.headers) {
                  const modified = new Date(req.headers['last-modified'])
                  params.Metadata.modified = modified.toUTCString()
                  modified.setYear(modified.getYear() + 1)
                }
                s3.upload(params, function (err, data) {
                  if (err) {
                    console.log("Error uploading data: ", err)
                  } else {
                    console.log("Success", data)
                  }
                  res.writeHead(200, headers)
                  res.end(JSON.stringify(err || data))
                })
              })
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
