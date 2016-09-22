const _ = require('./common')
const blogs = require('./json/blog')
const dialogs = []
const userIds = _.pluck(blogs.filter(blog => 'user' === blog.type), 'id')
for (let i = 0; i < 5000; i++) {
  dialogs.push({
    id: _.random(_.minTime, _.maxTime),
    type: 'dialog',
    from: _.sample(userIds),
    to: _.sample(userIds),
    text: _.faker.lorem.sentence()
  })
}
_.saveSQL('dialog', [{
  table: 'message',
  objects: dialogs
}])
