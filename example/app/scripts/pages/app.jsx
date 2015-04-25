"use strict";

var React = require('react');
var Reflux = require('reflux');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Header = require('components/header.jsx')

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <Header />
        <div className="content">
          <RouteHandler />
        </div>
      </div>
    );
  }
})
