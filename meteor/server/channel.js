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
    if (['offer', 'answer', 'candidate'].indexOf(message.type) < 0) {
      throw new Meteor.Error(400, 'Invalid type ' + message.type)
    }
    if ('candidate' === message.type) {
      message.text = JSON.stringify(JSON.parse(message.text))
    }
    return query('channel')
      .insert(message)
      .promise()
  }
})
