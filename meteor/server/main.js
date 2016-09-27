Meteor.startup(() => {
  process.title = 'labiak-meteor'
})

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
