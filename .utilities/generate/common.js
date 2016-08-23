const fs = require('fs')

const _ = require('underscore')
_.faker = require('faker/locale/ru')
_.constants = require('../../client/data')
_.minTime = new Date('2016-01-01').getTime() * 1000 * 1000
_.maxTime = new Date().getTime() * 1000 * 1000
_.insert = function (table, objects) {
  const keys = _.keys(objects[0]).map(field => `"${field}"`).join(',')
  objects = objects.map(o => _
    .values(o)
    .map(s => 'string' === typeof s ? `'${s}'` : (s ? s : 'NULL'))
    .join(',\t')
  )
    .map(line => `(${line})`)
    .join(',\n')
  return `INSERT INTO ${table} (${keys}) VALUES\n${objects};`
}
_.saveSQL = function (name, inserts) {
  if (inserts instanceof Array) {
    inserts = inserts.map(
      insert => 'string' === typeof insert
        ? insert
        : _.insert(insert.table, insert.objects)
    ).join('\n\n')
  }
  fs.writeFileSync(__dirname + `/sql/${name}.sql`, inserts)
}
_.saveJSON = function(name, objects) {
  fs.writeFileSync(__dirname + `/json/${name}.json`, JSON.stringify(objects, null, '\t'))
}
module.exports = _
