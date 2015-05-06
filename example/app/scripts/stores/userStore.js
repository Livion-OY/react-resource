"use strict";

import Reflux from 'reflux';
import UserActions from 'actions/userActions';
var Resource = require('../../../../resource');
var users = new Resource('http://localhost:3000/api/users/:id', { id: '@id' }, {});

var UserStore = Reflux.createStore({
  init() {
    this.users = [];

    this.listenTo(UserActions.query, this.query);
    this.listenTo(UserActions.remove, this.remove);
    this.listenTo(UserActions.save, this.save);
  },

  query() {
    var self = this;
    console.log('loadUsers');
    this.trigger({
      loading: true
    });
    users.query(function(users) {
      self.users = users;
      self.trigger({users: self.users, loading: false});
    });
  },

  remove(user) {
    user.remove();
    var users = this.users;
    users.splice(users.indexOf(user), 1);
    this.trigger({users: users, loading: false});
  },

  save(user) {
    if (!(user instanceof Resource)) {
      user = new users(user);
      this.users.push(user);
    }
    user.save();
    this.trigger({users: this.users});
  },

  /*error() {
    // TODO
  }*/

});

export default UserStore;