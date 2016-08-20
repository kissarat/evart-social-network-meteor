import {query, timeId} from './db'

Meteor.publish('message', function (params = {}) {
  return query('message_view', params)
    .orderBy('id', 'asc')
    .cursor()
})

Meteor.publish('messenger', function (params = {}) {
  return query('messenger', params)
    .orderBy('message', 'desc')
    .cursor()
})

Meteor.methods({
  'message.create'(message) {
    message.id = timeId()
    return query('message')
      .insert(message)
      .promise()
  }
})
