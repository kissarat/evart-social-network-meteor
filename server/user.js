Accounts.onCreateUser(function (options, user) {
  if (!/^[\w\._\-]{4,23}$/.test(user.username)) {
    throw new Meteor.Error(403, 'User validation failed')
  }
  user._id = user.username
  return user
})

Meteor.methods({
  // 'user.update': function (params) {
  //   return knex('blog')
  //     .insert(_.pick(params, 'domain', 'name', 'type'), 'id')
  //     .single()
  // }
})

