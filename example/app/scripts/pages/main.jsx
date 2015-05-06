'use strict';

var React = require('react/addons');
var Reflux = require('reflux');
var UserList = require('components/userList.jsx');
var UserActions = require('actions/userActions');
var UserStore = require('stores/userStore');

module.exports = React.createClass({
  mixins: [
    React.addons.LinkedStateMixin,
    Reflux.ListenerMixin
  ],

  getInitialState: function() {
    return {
      users : [],
      loading: true
    }
  },

  componentDidMount: function() {
    this.listenTo(UserStore, this.onStatusChange);
    UserActions.query();
  },

  onStatusChange: function(state) {
    this.setState(state);
  },

  render: function() {

    return (
      <div>
        <form onSubmit={this.submit}>
          <label>Firstname</label><input valueLink={this.linkState('firstname')} name="fistname" type="text"/>
          <label>Lastname</label><input valueLink={this.linkState('lastname')} name="lastname" type="text"/>
          <button type="submit">Add user</button>
        </form>
        <h1>User List</h1>
        <UserList { ...this.state } onRemove={this.removeUser}/>
      </div>
    );
  },

  removeUser(u) {
    UserActions.remove(u);
  },

  submit(e) {
    e.preventDefault();
    UserActions.save({firstname: this.state.firstname, lastname: this.state.lastname});
  }

});