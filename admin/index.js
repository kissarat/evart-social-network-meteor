const {port} = require('./config')
const {lord, loadSchema} = require('schema-db')
const {createServer} = require('http')

const server = createServer(function (req, res) {
  lord(req, res, function () {
    loadSchema().then(() => res.end(`<a href="/lord">Lord Entities</a>`))
  })
})

server.listen(port)
