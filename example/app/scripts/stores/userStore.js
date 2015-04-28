"use strict";

import Reflux from 'reflux';
import UserActions from 'actions/userActions';
var Resource = require('../../../../resource');
var users = new Resource('http://localhost:3000/api/users/:id', { id: '@id' }, {});

var UserStore = Reflux.createStore({
  init() {
    this.users = [];

    this.listenTo(UserActions.loadUsers, this.loadUsers);
    this.listenTo(UserActions.loadUsersSuccess, this.loadUsersSuccess);
    this.listenTo(UserActions.loadUsersError, this.loadUsersError);
  },

  loadUsers() {
    console.log('loadUsers');
    this.trigger({
      loading: true
    });
    users.query(this.loadUsersSuccess);
  },

  loadUsersSuccess(users) {
    var self = this;
    console.log(users);
    users.forEach(function(u) {
      u.onDelete = function() {
        u.$remove();
        users.splice(users.indexOf(u), 1);
        self.triggerUsers();
      }
    })
    this.users = users;

    this.triggerUsers();
  },

  triggerUsers() {
    this.trigger({
      users : this.users,
      loading: false
    });
  },

  loadUsersError(error) {
    this.trigger({
      error : error,
      loading: false
    });
  }

});

export default UserStore;