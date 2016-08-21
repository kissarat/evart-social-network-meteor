import {query, timeId} from './db'

Meteor.publish('message', function (params = {}) {
  if (_.isEmpty(params.order)) {
    params.order = {id: -1}
  }
  const table = params.type
  params.recipient = parseInt(this.userId, 36)
  delete params.type
  return query(table, params)
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
