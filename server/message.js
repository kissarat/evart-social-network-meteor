import {query} from './query'

Meteor.publish('message', function (params = {}) {
  return query('message', params).run()
})
