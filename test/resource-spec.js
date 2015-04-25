// __tests__/resource-test.js
'use strict';
/* jshint jasmine: true */

describe('resource tests', function() {
  it("should create resource", function() {
    console.log('start2')
    var Resource = require('../resource');
    var test = new Resource('http://localhost:3000/api/users/:id', { id: '@id' }, {});
    //test.query(function(data) {
    //  console.log('response', data)
      //done();
    //});

  });
});
