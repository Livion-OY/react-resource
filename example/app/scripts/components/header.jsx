'use strict';

var React = require('react');
var Link = require('react-router').Link;

module.exports = React.createClass({
  render: function() {
    return (
      <header className="clearfix">
        Resource example

        <nav className="clearfix">
          <div className="nav-item">
            <Link to="main">Main</Link>
          </div>
          <div className="nav-item">
            <Link to="about">About</Link>
          </div>
        </nav>
      </header>
    );
  }
});
