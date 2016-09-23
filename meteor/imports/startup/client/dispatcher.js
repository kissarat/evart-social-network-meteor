import {Dispatcher} from 'flux'

Meteor.dispatcher = new Dispatcher()
Meteor.alert = function (type, message, timeout) {
  const data = {type, message}
  if (timeout) {
    data.timeout = timeout
  }
  Meteor.dispatcher.dispatch(timeout)
}
Meteor.error = function (message, timeout) {
  Meteor.alert('danger', T(message), timeout)
}

let disconnectedAlert

Tracker.autorun(function () {
  if (Meteor.status().connected) {
    if (disconnectedAlert) {
      disconnectedAlert.close()
      disconnectedAlert = null
    }
    // Meteor.dispatcher.dispatch({type: 'success', message: 'Connected', timeout: 3000})
  }
  else if (!disconnectedAlert) {
    Meteor.dispatcher.dispatch({
      type: 'danger', message: 'Connection lost', callback: function (alert) {
        disconnectedAlert = alert
      }
    })
  }
})
