import {query} from './query'

Meteor.publish('user', function (params = {}) {
  return query('user', params).run()
})
