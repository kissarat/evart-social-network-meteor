import {query} from './query'

Meteor.publish('message', function (params = {}) {
  return query('message_view', params).run()
})

Meteor.publish('messenger', function (params = {}) {
  console.log(params)
  return query('messenger', params).run()
})
