const _knex = require('knex')
const config = this.Meteor ? Meteor.settings : require('../../../config')
const Pool = require('pg').Pool
const {extend, random, pick, each, isEmpty} = require('underscore')
if (!this.Meteor) {
  global.LivePg = require('pg-live-select')
}
const knex = _knex({
  client: 'pg'
})

const errors = Object.freeze(require('./errors.json'))

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
  let raw = q.sql
  q.sql = q.sql.replace(/\?/g, () => '$' + ++i)
  let j = 0
  if (q.bindings instanceof Array && q.bindings.length > 0) {
    raw = raw.replace(/\?/g, function () {
      const value = q.bindings[j++]
      return 'string' === typeof value ? `'${value}'` : value
    })
  }
  if (raw.indexOf('"log"') < 0) {
    console.log(raw)
  }
  return q
}

const liveDb = new LivePg('postgres://evart:evart@127.0.0.1/evart', 'channel')

function liveSQL(rawSQL, bindings) {
  return liveDb.select(rawSQL, bindings)
}

extend(_knex.Client.prototype.QueryBuilder.prototype, {
  cursor: function () {
    const q = this.toSQL()
    return q.bindings instanceof Array && q.bindings.length > 0
      ? liveSQL(q.sql, q.bindings)
      : liveSQL(q.sql)
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
  },

  search: function (string) {
    if ('string' === typeof string) {
      string.trim().split(/\s+/).forEach(token => {
        if (token) {
          this.where('name', 'ilike', `%${token}%`)
        }
      })
    }
    return this
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

function retrySQL(sql, bindings, codes) {
  return new Promise((resolve, reject) => {
    pool.connect((err, client, done) => {
      if (err) {
        reject(err)
        done()
      }
      else {
        client.query(sql, bindings, function (err, result) {
          if (err) {
            if (codes.indexOf(err.code) >= 0) {
              setTimeout(function () {
                retrySQL(sql, bindings, codes).then(resolve, reject)
              }, random(0, config.postgresql.retry))
            }
            else {
              reject(err)
            }
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
  const q = knex.table(table)
  q.where(pick(params, 'id', 'recipient', 'peer', 'parent', 'type', 'owner', 'from', 'to', 'relation'))
  if (params.random) {
    q.orderBy(knex.raw('random()'))
  }
  else if (params.order) {
    each(params.order, function (direction, name) {
      q.orderBy(name, direction > 0 ? 'asc' : 'desc')
    })
  }
  q.search(params.search)
  if (params.limit) {
    q.limit(params.limit)
  }
  return q
}

const start = Date.now() / 1000 - process.hrtime()[0]

function timeId() {
  let now = process.hrtime()
  now[1] -= Math.round(Math.random() * 50 * 1000 * 1000)
  return ((start + now[0]) * 1000 * 1000 * 1000 + now[1]).toString()
}

function log(type, action, params, userId) {
  const record = {
    type,
    action,
    id: timeId()
  }
  const ip = Meteor.call('ip')
  if (ip) {
    record.ip = ip
  }
  if (Meteor.userId() || userId) {
    record.actor = Meteor.userId() || userId
  }
  if (!isEmpty(params)) {
    record.data = params
  }
  return knex.table('log').insert(record).promise()
}

module.exports = {
  knex,
  table: name => knex.table(name),
  sql,
  query,
  liveSQL,
  timeId,
  errors,
  retrySQL,
  log
}
