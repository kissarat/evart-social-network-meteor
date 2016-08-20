const faker = require('faker/locale/ru')
const _ = require('underscore')
const minTime = new Date('2016-01-01').getTime() * 1000 * 1000
const maxTime = new Date().getTime() * 1000 * 1000
const child_ids = []
const note_ids = []
const lines = [
  (function () {
    const lines = []
    for (let i = 0; i < 5000; i++) {
      const node_id = _.random(minTime, maxTime)
      note_ids.push(node_id)
      const sql = [
        node_id,
        'wall',
        _.random(1, 15),
        _.random(1, 15),
        faker.lorem.sentence()
      ]
        .map(s => 'string' === typeof s ? `'${s}'` : s)
        .join(',\t')
      lines.push(`\t(${sql})`)
    }
    var sql = lines.join(',\n')
    return `INSERT INTO "message" (id, "type", "parent", "from", text) VALUES\n${sql};`
  })(),

  (function () {
    const lines = []
    for (let i = 0; i < 15000; i++) {
      const id = _.random(minTime, maxTime)
      child_ids.push(id)
      const sql = [
        id,
        'child',
        _.sample(note_ids),
        _.random(1, 15),
        faker.lorem.sentence()
      ]
        .map(s => 'string' === typeof s ? `'${s}'` : s)
        .join(',\t')
      lines.push(`\t(${sql})`)
    }
    var sql = lines.join(',\n')
    return `INSERT INTO "message" (id, "type", "parent", "from", text) VALUES\n${sql};`
  })(),

  (function () {
    const lines = []
    note_ids.concat(child_ids).forEach(id => {
      _.sample(_.range(1, 15), _.random(0, 10)).forEach(from => {
        const sql = [
          id,
          from,
          _.sample(['like', 'hate'])
        ]
          .map(s => 'string' === typeof s ? `'${s}'` : s)
          .join(',\t')
        lines.push(`\t(${sql})`)
      })
    })
    var sql = lines.join(',\n')
    return `INSERT INTO "attitude" ("message", "from", "type") VALUES\n${sql};`
  })()
]

require('fs').writeFileSync(__dirname + '/data/wall.sql', lines.join('\n\n'))
