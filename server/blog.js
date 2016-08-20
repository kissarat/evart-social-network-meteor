import {query, knex} from './db'

Meteor.publish('blog', function (params = {}) {
  return query('blog', params).cursor()
})

Meteor.methods({
  'blog.get': function (params) {
    return knex('blog')
      .where(_.pick(params, 'id', 'domain'))
      .single()
  },

  'blog.create': function (params) {
    return knex('blog')
      .insert(_.pick(params, 'domain', 'name', 'type'), ['id', 'time'])
      .single()
      .then(function (blog) {
        if (Meteor.userId() === params.domain) {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {
            id: blog.id
          }})
        }
        return blog
      })
  }
})
