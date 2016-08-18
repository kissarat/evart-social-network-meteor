import {Pool} from 'pg'

const _knex = require('knex')
const knex = _knex({})

const pool = new Pool({
  database: 'evart',
  user: 'evart',
  password: 'evart'
})

_knex.Client.prototype.QueryBuilder.prototype._toSQL = _knex.Client.prototype.QueryBuilder.prototype.toSQL

_knex.Client.prototype.QueryBuilder.prototype.toSQL = function () {
  const q = this._toSQL()
  let i = 0
  q.sql = q.sql.replace(/\?/g, () => '$' + ++i)
  return q
}

_knex.Client.prototype.QueryBuilder.prototype.run = function () {
  const liveDb = new LivePg('postgres://127.0.0.1/evart', 'channel')
  const q = this.toSQL()
  return liveDb.select(q.sql, q.bindings)
}

_knex.Client.prototype.QueryBuilder.prototype.modify = function () {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err)
        done()
      }
      else {
        const q = this.toSQL()
        client.query(q.sql, q.bindings, function (err, result) {
          if (err) {
            reject(err)
          }
          else {
            resolve(result)
          }
          done()
        })
      }
    })
  })
}

export function query(table, params = {}) {
  const q = knex(table)
  q.where(_.pick(params, 'id', 'recipient', 'peer'))
  if (params.order) {
    _.each(params.order, function (direction, name) {
      q.orderBy(name, direction > 0 ? 'asc' : 'desc')
    })
  }
  return q
}

const start = Date.now() / 1000 - process.hrtime()[0]

export function timeId() {
  const now = process.hrtime()
  return (start + now[0]) * 1000 * 1000 * 1000 + now[1]
}
