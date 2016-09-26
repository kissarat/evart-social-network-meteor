Meteor.startup(() => {
  process.title = 'node-evart-meteor'
})

WebApp.rawConnectHandlers.use(function (req, res, next) {
  res.setHeader('access-control-allow-origin', '*')
  return next()
})
