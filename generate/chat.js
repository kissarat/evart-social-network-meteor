const _ = require('./common')
const blogs = require('./json/blog')
const dialogs = []
const userIds = _.pluck(blogs.filter(blog => 'user' === blog.type), 'id')
const chatIds = _.pluck(blogs.filter(blog => 'chat' === blog.type), 'id')
for (let i = 0; i < 5000; i++) {
  dialogs.push({
    id: _.random(_.minTime, _.maxTime),
    type: 'chat',
    from: _.sample(userIds),
    to: _.sample(chatIds),
    text: _.faker.lorem.sentence()
  })
}
_.saveSQL('chat', [
  {
    table: 'message',
    objects: dialogs
  }
])
