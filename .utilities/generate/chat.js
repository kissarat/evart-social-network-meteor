const faker = require('faker/locale/ru')
const _ = require('underscore')
const minTime = new Date('2010-01-01').getTime() * 1000 * 1000
const maxTime = new Date().getTime() * 1000 * 1000
const lines = [
  (function () {
    const lines = []
    for (let i = 16; i <= 50; i++) {
      const sql = [i, 'chat', faker.lorem.word()]
        .map(s => 'string' === typeof s ? `'${s}'` : s)
        .join(',\t')
      lines.push(`\t(${sql})`)
    }
    const sql = lines.join(',\n')
    return `INSERT INTO "blog" (id, type, name) VALUES\n${sql};`
  })(),

  (function () {
    const lines = []
    for (let i = 0; i < 5000; i++) {
      const sql = [_.random(minTime, maxTime), _.random(16, 50), _.random(1, 15), faker.lorem.sentence()]
        .map(s => 'string' === typeof s ? `'${s}'` : s)
        .join(',\t')
      lines.push(`\t(${sql})`)
    }
    var sql = lines.join(',\n')
    return `INSERT INTO "message" (id, "to", "from", text) VALUES\n${sql};`
  })()
]


require('fs').writeFileSync(__dirname + '/data/chat.sql', lines.join('\n\n'))
