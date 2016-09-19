import {query, table, errors, timeId, log, knex} from './db'
import _ from 'underscore'

Meteor.publish('blog', function (params = {}) {
  return query('blog', params).cursor()
})

Meteor.publish('blog_recipient', function (params = {}) {
  params.recipient = +this.userId
  return query('blog_recipient', params).cursor()
})

Meteor.publish('invite', function (params = {}) {
  if (!params.recipient) {
    params.recipient = +this.userId
  }
  return query('invite', params).cursor()
})

Meteor.publish('subscription', function (params = {}) {
  if (!params.recipient) {
    params.recipient = +this.userId
  }
  return query('subscription', params).cursor()
})

Meteor.publish('to_list', function (params = {}) {
  params.to = +this.userId
  return query('to_list', params).cursor()
})

Meteor.publish('from_list', function (params = {}) {
  params.from = +this.userId
  return query('from_list', params).cursor()
})

Meteor.publish('member', function (params = {}) {
  return query('member', params).cursor()
})

Meteor.publish('candidate', function ({from, limit, search}) {
  return knex.select('blog.*')
    .from('blog').join(knex.raw(`((SELECT "to" AS id FROM relation WHERE "from" = ?
  UNION SELECT id FROM blog WHERE type = 'user')
  EXCEPT SELECT "to" AS id FROM relation WHERE "from" = ?) AS t
`, [this.userId, +from]), 'blog.id', 't.id')
    .search(search)
    .limit(+limit || 100)
    .cursor()
})

Meteor.methods({
  ip() {
    return this.connection.clientAddress
  },

  'blog.get' (params) {
    const where = _.pick(params, 'id', 'domain')
    where.recipient = Meteor.userId()
    return table('informer')
      .where(where)
      .single()
  },

  'blog.create' (params) {
    params = _.pick(params, 'id', 'domain', 'name', 'type')
    return table('blog')
      .insert(params, ['id', 'time'])
      .single()
      .then(function (blog) {
        if (Meteor.userId() === params.domain) {
          Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
              id: blog.id
            }
          })
        }
        return log('blog', 'create', _.extend(params, blog)).then(() => blog)
      })
  },

  'blog.update' (where, changes) {
    changes = _.pick(changes, 'status', 'name', 'surname', 'forename', 'birthday',
      'avatar', 't0', 't1', 't2', 't3', 't4', 't5', 't6')
    if (changes.surname || changes.forename) {
      changes.name = changes.surname + ' ' + changes.forename
    }
    _.forEach(changes, function (value, key) {
      if ('string' === typeof value) {
        if (!value.trim()) {
          changes[key] = null
        }
      }
    })
    if (_.isEmpty(changes)) {
      return false
    }
    else {
      return table('blog')
        .where(where)
        .update(changes)
        .promise()
        .then(function () {
          return log('blog', 'update', changes)
        })
    }
  },

  establish(params) {
    const where = {
      from: Meteor.userId(),
      to: +params.id
    }
    const q = table('relation')
    if (['follow', 'manage', 'deny', 'reject'].indexOf(params.relation) >= 0) {
      const changes = {id: timeId(), type: params.relation}
      const data = _.extend(changes, where);
      return q
        .insert(data)
        .promise()
        .catch(function (err) {
          if (errors.UNIQUE_VIOLATION === err.code) {
            return table('relation')
              .where(where)
              .update(changes)
              .promise()
          }
          throw err
        })
        .then(function () {
          return log('relation', 'establish', data)
        })
    }
    else {
      return q
        .where(where)
        .del()
        .promise()
        .then(function () {
          return log('relation', 'remove', where)
        })
    }
  },

  'chat.create'(params) {
    params.id = timeId()
    params.type = 'chat'
    params.manager = +params.manager
    params.follower = +params.follower
    return table('blog')
      .select('name')
      .where('type', 'user')
      .whereIn('id', [params.manager, params.follower])
      .many(function (members) {
        if (2 === members.length) {
          params.name = members[0].name + ', ' + members[1].name
        }
        else {
          throw new Meteor.Error(400, 'Members not found')
        }
      })
      .then(function () {
        return table('blog')
          .insert({id: params.id, type: 'chat', name: params.name})
          .promise()
      })
      .then(function () {
        return table('relation')
          .insert({
            id: timeId(),
            from: params.id,
            type: 'manage',
            to: params.manager
          })
          .promise()
      })
      .then(function () {
        return table('relation')
          .insert({
            id: timeId(),
            from: params.id,
            type: 'follow',
            to: params.follower
          })
          .promise()
      })
      .then(() => log('blog', 'create', params))
      .then(() => params)
  },

  'member.add'(params) {
    params.id = timeId()
    return table('relation')
      .insert(params)
      .promise()
      .then(function () {
        return log('member', 'add', params)
      })
  },

  'member.update'(where, changes) {
    return table('relation')
      .where(where)
      .update(changes)
      .promise()
      .then(function () {
        return log('member', 'update', _.extend(changes, where))
      })
  },

  'member.remove'(params) {
    return table('relation')
      .where(params)
      .del()
      .promise()
      .then(function () {
        return log('member', 'remove', params)
      })
  }
})
