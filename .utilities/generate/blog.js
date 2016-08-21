const fs = require('fs')

const _ = require('./common')
const blogs = []
for (let i = 0; i < 400; i++) {
  blogs.push({
    id: _.random(_.minTime, _.maxTime),
    type: _.sample(['user', 'chat', 'group']),
    domain: null
  })
}

const users = blogs.filter(b => 'user' === b.type)
_.uniq(_.faker.lorem.words(1000).split(' ')).forEach(function (word) {
  _.sample(users).domain = word
})

_.saveSQL('blog', [
  {
    table: 'blog',
    objects: blogs
  }
])
_.saveJSON('blog', blogs)
