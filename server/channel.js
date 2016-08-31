import {query, timeId} from './db'


Meteor.publish('channel', function () {
  return query('channel')
    .where('id', '>', timeId())
    .where('to', parseInt(this.userId, 36))
    .cursor()
})

Meteor.methods({
  'channel.push'(message) {
    message.id = timeId()
    message.from = parseInt(Meteor.userId(), 36)
    return query('channel')
      .insert(message)
      .promise()
  }
})
