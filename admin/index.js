const config = require('../config').postgresql
const common = require('../meteor/imports/server/common')
const db = require('elka')

const elka = new db.Elka()
db.loadSchema().then(function () {
  elka.http.listen(config.port || 54321, '0.0.0.0', function () {
    common.send({type: 'start'})
  })
})
