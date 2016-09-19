import {query, table, timeId, errors} from './db'

Meteor.publish('message', function (params = {}) {
  if (_.isEmpty(params.order)) {
    params.order = {id: -1}
  }
  let type = params.type
  params.recipient = +this.userId
  if ('chat' === type) {
    type = 'chat_dialog'
  }
  delete params.type
  return query(type, params)
    .limit(200)
    .cursor()
})

Meteor.publish('messenger', function ({search}) {
  return query('messenger', {recipient: +this.userId, search})
    .orderBy('message', 'desc')
    .cursor()
})

Meteor.methods({
  'message.create'(message) {
    message.id = timeId()
    message.from = +Meteor.userId()
    return query('message')
      .insert(message)
      .promise()
  },

  estimate(params) {
    const attitude = params.attitude
    const data = {
      from: +Meteor.userId(),
      message: +params.id
    }
    const q = table('attitude')
    if ('like' === attitude || 'hate' === attitude) {
      data.type = attitude
      return q.insert(data).promise().catch(function (err) {
        if (errors.UNIQUE_VIOLATION === err.code) {
          delete data.type
          return table('attitude')
            .where(data)
            .update({type: attitude})
            .promise()
        }
        throw err
      })
    }
    else {
      return q.where(data).del().promise()
    }
  },

  repost({id}) {
    return table('message').where('id', id).single().then(function (message) {
      if (message) {
        message.original = id
        message.id = timeId()
        message.from = +Meteor.userId()
        message.parent = message.from
        return table('message').insert(message).promise()
      }
      throw new Meteor.Error(404)
    })
  }
})
