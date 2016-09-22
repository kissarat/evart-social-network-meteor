const _ = require('./common')
const blogs = require('./json/blog')
const notes = []
const userIds = _.pluck(blogs.filter(blog => 'user' === blog.type), 'id')
const blogIds = _.pluck(blogs
  .filter(blog => 'user' === blog.type || 'group' === blog.type), 'id')
for (let i = 0; i < 5000; i++) {
  notes.push({
    id: _.random(_.minTime, _.maxTime),
    type: 'wall',
    from: _.sample(userIds),
    parent: _.sample(blogIds),
    text: _.faker.lorem.sentence()
  })
}

const nodeIds = _.pluck(notes, 'id')
const children = []
for (let i = 0; i < 5000; i++) {
  children.push({
    id: _.random(_.minTime, _.maxTime),
    type: 'child',
    from: _.sample(userIds),
    parent: _.sample(nodeIds),
    text: _.faker.lorem.sentence()
  })
}

const ids = _.pluck(children, 'id').concat(nodeIds)
const attitudes = []
for (let i = 0; i < 15000;) {
  const attitude = {
    from: _.sample(blogIds),
    message: _.sample(ids),
    type: _.sample(['like', 'hate'])
  }
  if (attitudes.some(a => attitude.from === a.from && attitude.message === a.message)) {
    continue;
  }
  i++;
  attitudes.push(attitude)
}

_.saveSQL('wall', [
  {
    table: 'message',
    objects: notes
  },
  {
    table: 'message',
    objects: children
  },
  {
    table: 'attitude',
    objects: attitudes
  }
])
