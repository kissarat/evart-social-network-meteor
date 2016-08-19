import {query} from './query'

Meteor.publish('blog', function (params = {}) {
  return query('blog', params).run()
})

// Meteor.methods({
//   'chat.member.add'(member) {
//     return query('message')
//       .insert(message)
//       .modify()
//   }
// })
