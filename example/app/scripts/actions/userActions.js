import Reflux from 'reflux';

var UserActions = Reflux.createActions([
  'loadUsers',
  'loadUsersSuccess',
  'loadUsersError'
]);

export default UserActions;