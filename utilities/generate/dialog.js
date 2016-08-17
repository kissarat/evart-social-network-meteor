const faker = require('faker/locale/ru')
const _ = require('underscore')
const minTime = new Date('2010-01-01').getTime() * 1000 * 1000
const maxTime = new Date('2020-01-01').getTime() * 1000 * 1000
const lines = []
for (let i = 0; i < 10000; i++) {
  const sql = [_.random(minTime, maxTime), _.random(1, 15), _.random(1, 15), faker.lorem.sentence()]
    .map(s => 'string' === typeof s ? `'${s}'` : s)
    .join(',\t')
  lines.push(`\t(${sql})`)
}
var sql = lines.join(',\n')
sql = `INSERT INTO "message" (id, "from", "to", text) VALUES\n${sql};\n\n`
require('fs').writeFileSync(__dirname + '/data/dialog.sql', sql)
