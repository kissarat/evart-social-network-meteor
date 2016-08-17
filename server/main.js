import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  require('./user');
});
