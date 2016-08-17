const knex = require('knex')
const liveDb = new LivePg('postgres://127.0.0.1/evart', 'channel')
knex.Client.prototype.QueryBuilder.prototype.run = function () {
  const sql = this.toString()
  return liveDb.select(sql)
}

const sql = knex({})

export function query(table, params = {}) {
  const q = sql(table)
  q.where(_.pick(params, 'id'))
  if (params.order) {
    _.each(params.order, function (direction, name) {
      q.orderBy(name, direction > 0 ? 'asc' : 'desc')
    })
  }
  return q
}
