import {query, table, errors, timeId} from './db'
import _ from 'underscore'

Meteor.publish('blog', function (params = {}) {
  return query('blog', params).cursor()
})

Meteor.publish('blog_recipient', function (params = {}) {
  params.recipient = parseInt(this.userId, 36)
  return query('blog_recipient', params).cursor()
})

Meteor.publish('invite', function (params = {}) {
  if (!params.recipient) {
    params.recipient = parseInt(this.userId, 36)
  }
  return query('invite', params).cursor()
})

Meteor.publish('to_list', function (params = {}) {
  params.to = parseInt(this.userId, 36)
  return query('to_list', params).cursor()
})

Meteor.publish('from_list', function (params = {}) {
  params.from = parseInt(this.userId, 36)
  return query('from_list', params).cursor()
})

Meteor.methods({
  'blog.get' (params) {
    const where = _.pick(params, 'id', 'domain')
    where.recipient = parseInt(Meteor.userId(), 36)
    return table('informer')
      .where(where)
      .single()
  },

  'blog.create' (params) {
    return table('blog')
      .insert(_.pick(params, 'domain', 'name', 'type'), ['id', 'time'])
      .single()
      .then(function (blog) {
        if (Meteor.userId() === params.domain) {
          Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
              id: blog.id
            }
          })
        }
        return blog
      })
  },

  'blog.update' (where, changes) {
    changes = _.pick(changes, 'status', 'name', 'surname', 'forename', 'birthday',
      't0', 't1', 't2', 't3', 't4', 't5', 't6')
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
    }
  },

  establish(params) {
    const where = {
      from: parseInt(Meteor.userId(), 36),
      to: +params.id
    }
    const q = table('relation')
    if (['follow', 'manage', 'deny', 'reject'].indexOf(params.relation) >= 0) {
      const changes = {id: timeId(), type: params.relation}
      return q.insert(_.extend(changes, where))
        .promise().catch(function (err) {
          if (errors.UNIQUE_VIOLATION === err.code) {
            return table('relation')
              .where(where)
              .update(changes)
              .promise()
          }
          throw err
        })
    }
    else {
      return q.where(where).del().promise()
    }
  }
})
