import React from 'react';

class UserRow extends React.Component {

  constructor(){
    super();
  }

  render() {
    return (
      <tr>
        <td>{ this.props.user.firstname + ' ' + this.props.user.lastname }</td>
        <td><button onClick={this.props.onClick.bind(this, this.props.user)}>Del</button></td>
      </tr>
    );
  }
}

export default UserRow;