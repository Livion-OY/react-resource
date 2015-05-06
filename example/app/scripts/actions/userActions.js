import Reflux from 'reflux';

var UserActions = Reflux.createActions([
  'query',
  'save',
  'remove',
  'error'
]);

export default UserActions;