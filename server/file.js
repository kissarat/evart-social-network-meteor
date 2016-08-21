import {query, knex} from './db'

Meteor.publish('file', function (params = {}) {
  return query('file', params).cursor()
})

Meteor.methods({
  'file.get': function (params) {
    return knex('file')
      .where(_.pick(params, 'id', 'domain'))
      .single()
  },

  'file.create': function (params) {
    return knex('file')
      .insert(_.pick(params, 'domain', 'name', 'type'), ['id', 'time'])
      .single()
      .then(function (file) {
        if (Meteor.userId() === params.domain) {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {
            id: file.id
          }})
        }
        return file
      })
  }
})
