import {query, timeId} from './db'


Meteor.publish('channel', function () {
  return query('channel')
    .where('id', '>', timeId())
    .where('to', +this.userId)
    .cursor()
})

Meteor.methods({
  'channel.push'(message) {
    message.id = timeId()
    message.from = +Meteor.userId()
    return query('channel')
      .insert(message)
      .promise()
  }
})
