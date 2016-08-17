import {query} from './query'

if (Meteor.isServer) {
  Meteor.publish('user', function (params = {}) {
    return query('user', params).run()
  })
}
