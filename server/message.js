import {query, timeId} from './query'

Meteor.publish('message', function (params = {}) {
  return query('message_view', params).run()
})

Meteor.publish('messenger', function (params = {}) {
  return query('messenger', params).run()
})

Meteor.methods({
  'message.create'(message) {
    message.id = timeId()
    return query('message')
      .insert(message)
      .modify()
  }
})
