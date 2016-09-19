import {timeId} from './db'

Accounts.onCreateUser(function (options, user) {
  if (!/^[\w\._\-]{4,23}$/.test(user.username)) {
    throw new Meteor.Error(403, 'User validation failed')
  }
  user._id = timeId().toString(10)
  return user
})

Meteor.methods({
  // 'user.update': function (params) {
  //   return knex('blog')
  //     .insert(_.pick(params, 'domain', 'name', 'type'), 'id')
  //     .single()
  // }
})
