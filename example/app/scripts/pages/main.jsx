'use strict';

var React = require('react');
var Reflux = require('reflux');
var UserList = require('components/userList.jsx');
var UserActions = require('actions/userActions');
var UserStore = require('stores/userStore');

module.exports = React.createClass({
  mixins: [
    Reflux.ListenerMixin
  ],

  getInitialState: function() {
    return {
      users : [],
      loading: false
    }
  },

  componentDidMount: function() {
    this.listenTo(UserStore, this.onStatusChange);
    UserActions.loadUsers();
  },

  onStatusChange: function(state) {
    this.setState(state);
  },

  render: function() {

    return (
      <div>
        <h1>User List</h1>
        <UserList { ...this.state } />
      </div>
    );
  }
});