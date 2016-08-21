const Pool = require('pg').Pool
const _ = require('underscore')
const _knex = require('knex')
const knex = _knex({
  client: 'pg'
})

const pool = new Pool({
  database: 'evart',
  user: 'evart',
  password: 'evart'
})

_knex.Client.prototype.QueryBuilder.prototype._toSQL
  = _knex.Client.prototype.QueryBuilder.prototype.toSQL

_knex.Client.prototype.QueryBuilder.prototype.toSQL = function () {
  const q = this._toSQL()
  let i = 0
  const raw = q.sql
  q.sql = q.sql.replace(/\?/g, () => '$' + ++i)
  let j = 0
  console.log(raw.replace(/\?/g, function() {
    const value = q.bindings[j++]
    return 'string' === typeof value ? `'${value}'` : value
  }))
  return q
}

_.extend(_knex.Client.prototype.QueryBuilder.prototype, {
  cursor: function () {
    const liveDb = new LivePg('postgres://127.0.0.1/evart', 'channel')
    const q = this.toSQL()
    return liveDb.select(q.sql, q.bindings)
  },

  promise: function () {
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
  },

  single: function () {
    return this.promise().then(result => result.rows[0])
  },

  many: function () {
    return this.promise().then(result => result)
  }
})

function sql(sql, bindings) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err)
        done()
      }
      else {
        client.query(sql, bindings, function (err, result) {
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

function query(table, params = {}) {
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

function timeId(base) {
  let now = process.hrtime()
  now = (start + now[0]) * 1000 * 1000 * 1000 + now[1]
  return base ? now.toString(36) : now
}

module.exports = {
  knex,
  sql,
  query,
  timeId
}
