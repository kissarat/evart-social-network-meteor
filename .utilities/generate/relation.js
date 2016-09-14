const _ = require('./common')
const blogs = require('./json/blog')
const relations = []
const userIds = _.pluck(blogs, 'id')
for (let i = 0; i < 2000;) {
  const relation = {
    id: _.random(_.minTime, _.maxTime),
    type: 'follow',
    from: _.sample(userIds),
    to: _.sample(userIds)
  }
  if (relation.from != relation.to && !relations.find(r => r.from == relation.from && r.to == relation.to)) {
    relations.push(relation)
    i++
  }
}
_.saveSQL('relation', [{
  table: 'relation',
  objects: relations
}])
