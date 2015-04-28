import React from 'react';
import UserRow from 'components/userRow.jsx';

class UserList extends React.Component {

  constructor(){
    super();
  }

  render() {
    var users = this.props.users.map(user => <UserRow key={ user.id } user={user} /> );
    var loading = this.props.loading ? <div className="loading-label">Loading...</div> : '';

    return (
      <div>
        { loading }
        <table>
          <thead>
          </thead>
          <tbody>
            { users }
          </tbody>
        </table>
      </div>
    );
  }
}

UserList.propTypes = {
  loading : React.PropTypes.bool,
  users : React.PropTypes.array
}

export default UserList;