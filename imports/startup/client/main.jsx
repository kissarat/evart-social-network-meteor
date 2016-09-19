Meteor.isMobile = Meteor.isCordova
  || navigator.userAgent.indexOf('iOS') > 0
  || navigator.userAgent.indexOf('Android') > 0

import {RootRoute} from './routes'
import './dispatcher'

export {RootRoute}
