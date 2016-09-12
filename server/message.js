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

Meteor.publish('messenger', function () {
  return query('messenger', {recipient: parseInt(this.userId, 36)})
    .orderBy('message', 'desc')
    .cursor()
})

Meteor.methods({
  'message.create'(message) {
    message.id = timeId()
    message.from = parseInt(Meteor.userId(), 36)
    return query('message')
      .insert(message)
      .promise()
  }
})
