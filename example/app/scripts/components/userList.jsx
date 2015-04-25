import React from 'react';

class UserList extends React.Component {

  constructor(){
    super();
  }

  render() {
    var users = this.props.users.map(user => <li key={ user.id }>{ user.firstname + ' ' + user.lastname }</li>);
    var loading = this.props.loading ? <div className="loading-label">Loading...</div> : '';

    return (
      <div>
        { loading }
        <ul>
          { users }
        </ul>
      </div>
    );
  }
}

UserList.propTypes = {
  loading : React.PropTypes.bool,
  users : React.PropTypes.array
}

export default UserList;