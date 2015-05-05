'use strict';

function toDebugString(obj) {
  if (typeof obj === 'function') {
    return obj.toString().replace(/ \{[\s\S]*$/, '');
  } else if (typeof obj === 'undefined') {
    return 'undefined';
  } else if (typeof obj !== 'string') {
    return JSON.stringify(obj, null, 2);
  }
  return obj;
}

function minErr(module) {
  var ErrorConstructor = Error;
  return function() {
    var SKIP_INDEXES = 2;

    var templateArgs = arguments,
      code = templateArgs[0],
      message = '[' + (module ? module + ':' : '') + code + '] ',
      template = templateArgs[1],
      paramPrefix, i;

    message += template.replace(/\{\d+\}/g, function(match) {
      var index = +match.slice(1, -1),
        shiftedIndex = index + SKIP_INDEXES;

      if (shiftedIndex < templateArgs.length) {
        return toDebugString(templateArgs[shiftedIndex]);
      }

      return match;
    });

    message += '\n' +
      (module ? module + '/' : '') + code;

    for (i = SKIP_INDEXES, paramPrefix = '?'; i < templateArgs.length; i++, paramPrefix = '&') {
      message += paramPrefix + 'p' + (i - SKIP_INDEXES) + '=' +
        encodeURIComponent(toDebugString(templateArgs[i]));
    }

    return new ErrorConstructor(message);
  };
}

// Helper functions and regex to lookup a dotted path on an object
// stopping at undefined/null.  The path must be composed of ASCII
// identifiers (just like $parse)
var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

function isValidDottedPath(path) {
  return (path !== null && path !== '' && path !== 'hasOwnProperty' &&
      MEMBER_NAME_REGEX.test('.' + path));
}

function lookupDottedPath(obj, path) {
  if (!isValidDottedPath(path)) {
    throw minErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
  }
  var keys = path.split('.');
  for (var i = 0, ii = keys.length; i < ii && obj !== undefined; i++) {
    var key = keys[i];
    obj = (obj !== null) ? obj[key] : undefined;
  }
  return obj;
}

/**
 * Create a shallow copy of an object and clear other fields from the destination
 */
function shallowClearAndCopy(src, dst) {
  dst = dst || {};

  forEach(dst, function(value, key) {
    delete dst[key];
  });

  for (var key in src) {
    if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
      dst[key] = src[key];
    }
  }

  return dst;
}

var isArray = Array.isArray;
var isObject = function(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object';
}
var isFunction = function(value) {return typeof value === 'function';}

/*var setHashKey = function(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  } else {
    delete obj.$$hashKey;
  }
}*/

var slice = [].slice;

function baseExtend(dst, objs, deep) {
  //var h = dst.$$hashKey;

  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i];
    if (!isObject(obj) && !isFunction(obj)) continue;
    var keys = Object.keys(obj);
    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j];
      var src = obj[key];

      if (deep && isObject(src)) {
        if (!isObject(dst[key])) dst[key] = isArray(src) ? [] : {};
        baseExtend(dst[key], [src], true);
      } else {
        dst[key] = src;
      }
    }
  }

  //setHashKey(dst, h);
  return dst;
}

var toString = Object.prototype.toString;
function isString(value) {return typeof value === 'string';}

function isWindow(obj) {
  return obj && obj.window === obj;
}
var TYPED_ARRAY_REGEXP = /^\[object (Uint8(Clamped)?)|(Uint16)|(Uint32)|(Int8)|(Int16)|(Int32)|(Float(32)|(64))Array\]$/;
function isTypedArray (value) {
  return TYPED_ARRAY_REGEXP.test(toString.call(value));
}
var NODE_TYPE_ELEMENT = 1;
function isArrayLike(obj) {
  if (obj === null || isWindow(obj)) {
    return false;
  }

  var length = obj.length;

  if (obj.nodeType === NODE_TYPE_ELEMENT && length) {
    return true;
  }

  return isString(obj) || isArray(obj) || length === 0 ||
         typeof length === 'number' && length > 0 && (length - 1) in obj;
}

function isDate(value) {
  return toString.call(value) === '[object Date]';
}
function isRegExp(value) {
  return toString.call(value) === '[object RegExp]';
}
function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        // Need to check if hasOwnProperty exists,
        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
        if (key !== 'prototype' && key !== 'length' && key !== 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== 'object';
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}


var copy = function(source, destination, stackSource, stackDest) {
  if (isWindow(source)) {
    throw minErr('cpws',
      "Can't copy! Making copies of Window or Scope instances is not supported.");
  }
  if (isTypedArray(destination)) {
    throw minErr('cpta',
      "Can't copy! TypedArray destination cannot be mutated.");
  }

  if (!destination) {
    destination = source;
    if (source) {
      if (isArray(source)) {
        destination = copy(source, [], stackSource, stackDest);
      } else if (isTypedArray(source)) {
        destination = new source.constructor(source);
      } else if (isDate(source)) {
        destination = new Date(source.getTime());
      } else if (isRegExp(source)) {
        destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
        destination.lastIndex = source.lastIndex;
      } else if (isObject(source)) {
        var emptyObject = Object.create(Object.getPrototypeOf(source));
        destination = copy(source, emptyObject, stackSource, stackDest);
      }
    }
  } else {
    if (source === destination) throw minErr('cpi',
      "Can't copy! Source and destination are identical.");

    stackSource = stackSource || [];
    stackDest = stackDest || [];

    if (isObject(source)) {
      var index = stackSource.indexOf(source);
      if (index !== -1) return stackDest[index];

      stackSource.push(source);
      stackDest.push(destination);
    }

    var result;
    if (isArray(source)) {
      destination.length = 0;
      for (var i = 0; i < source.length; i++) {
        result = copy(source[i], null, stackSource, stackDest);
        if (isObject(source[i])) {
          stackSource.push(source[i]);
          stackDest.push(result);
        }
        destination.push(result);
      }
    } else {
      //var h = destination.$$hashKey;
      if (isArray(destination)) {
        destination.length = 0;
      } else {
        forEach(destination, function(value, key) {
          delete destination[key];
        });
      }
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          result = copy(source[key], null, stackSource, stackDest);
          if (isObject(source[key])) {
            stackSource.push(source[key]);
            stackDest.push(result);
          }
          destination[key] = result;
        }
      }
      //setHashKey(destination,h);
    }

  }
  return destination;
}

var noop = function() {};

function extend(dst) {
  return baseExtend(dst, slice.call(arguments, 1), false);
}

function isDefined(value) {return typeof value !== 'undefined';}

var request = require('superagent-promise');

var resource = function() {
  var provider = this;

  this.defaults = {
    // Strip slashes by default
    stripTrailingSlashes: true,

    // Default actions configuration
    actions: {
      'get': {method: 'GET'},
      'save': {method: 'POST'},
      'query': {method: 'GET', isArray: true},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'}
    }
  };

  /**
   * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
   * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
   * (pchar) allowed in path segments:
   *    segment       = *pchar
   *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
   *    pct-encoded   = "%" HEXDIG HEXDIG
   *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
   *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
   *                     / "*" / "+" / "," / ";" / "="
   */
  function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
      replace(/%26/gi, '&').
      replace(/%3D/gi, '=').
      replace(/%2B/gi, '+');
  }


  /**
   * This method is intended for encoding *key* or *value* parts of query component. We need a
   * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
   * have to be encoded per http://tools.ietf.org/html/rfc3986:
   *    query       = *( pchar / "/" / "?" )
   *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
   *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
   *    pct-encoded   = "%" HEXDIG HEXDIG
   *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
   *                     / "*" / "+" / "," / ";" / "="
   */
  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
  }

  function Route(template, defaults) {
    this.template = template;
    this.defaults = extend({}, provider.defaults, defaults);
    this.urlParams = {};
  }

  Route.prototype = {
    setUrlParams: function(config, params, actionUrl) {
      var self = this,
        url = actionUrl || self.template,
        val,
        encodedVal;

      var urlParams = self.urlParams = {};
      forEach(url.split(/\W/), function(param) {
        if (param === 'hasOwnProperty') {
          throw minErr('badname', "hasOwnProperty is not a valid parameter name.");
        }
        if (!(new RegExp("^\\d+$").test(param)) && param &&
          (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
          urlParams[param] = true;
        }
      });
      url = url.replace(/\\:/g, ':');

      params = params || {};
      forEach(self.urlParams, function(_, urlParam) {
        val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
        if (isDefined(val) && val !== null) {
          encodedVal = encodeUriSegment(val);
          url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
            return encodedVal + p1;
          });
        } else {
          url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
              leadingSlashes, tail) {
            if (tail.charAt(0) === '/') {
              return tail;
            } else {
              return leadingSlashes + tail;
            }
          });
        }
      });

      // strip trailing slashes and set the url (unless this behavior is specifically disabled)
      if (self.defaults.stripTrailingSlashes) {
        url = url.replace(/\/+$/, '') || '/';
      }

      // then replace collapse `/.` if found in the last URL path segment before the query
      // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
      url = url.replace(/\/\.(?=\w+($|\?))/, '.');
      // replace escaped `/\.` with `/.`
      config.url = url.replace(/\/\\\./, '/.');


      // set params - delegate param encoding to $http
      forEach(params, function(value, key) {
        if (!self.urlParams[key]) {
          config.params = config.params || {};
          config.params[key] = value;
        }
      });
    }
  };


  function resourceFactory(url, paramDefaults, actions, options) {
    var route = new Route(url, options);

    actions = extend({}, provider.defaults.actions, actions);

    function extractParams(data, actionParams) {
      var ids = {};
      actionParams = extend({}, paramDefaults, actionParams);
      forEach(actionParams, function(value, key) {
        if (isFunction(value)) { value = value(); }
        ids[key] = value && value.charAt && value.charAt(0) === '@' ?
          lookupDottedPath(data, value.substr(1)) : value;
      });
      return ids;
    }

    function defaultResponseInterceptor(response) {
      return response.resource;
    }

    function Resource(value) {
      shallowClearAndCopy(value || {}, this);
    }

    Resource.prototype.toJSON = function() {
      var data = extend({}, this);
      return data;
    };

    forEach(actions, function(action, name) {
      var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);

      Resource[name] = function(a1, a2, a3, a4) {
        var params = {}, data, success, error;

        /* jshint -W086 */ /* (purposefully fall through case statements) */
        switch (arguments.length) {
          case 4:
            error = a4;
            success = a3;
          //fallthrough
          case 3:
          case 2:
            if (isFunction(a2)) {
              if (isFunction(a1)) {
                success = a1;
                error = a2;
                break;
              }

              success = a2;
              error = a3;
              //fallthrough
            } else {
              params = a1;
              data = a2;
              success = a3;
              break;
            }
          case 1:
            if (isFunction(a1)) success = a1;
            else if (hasBody) data = a1;
            else params = a1;
            break;
          case 0: break;
          default:
            throw minErr('badargs',
              "Expected up to 4 arguments [params, data, success, error], got {0} arguments",
              arguments.length);
        }
        /* jshint +W086 */ /* (purposefully fall through case statements) */

        var isInstanceCall = this instanceof Resource;
        var value = isInstanceCall ? data : (action.isArray ? [] : new Resource(data));
        var httpConfig = {
          type: 'json'
        };
        /* example config
        {
          method: 'POST',
          url: 'http://example.com',
          headers: {
           'Content-Type': undefined
          },
          data: { test: 'test' }
        }
         */
        var responseInterceptor = action.interceptor && action.interceptor.response ||
          defaultResponseInterceptor;
        var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
          undefined;

        forEach(action, function(value, key) {
          if (key !== 'params' && key !== 'isArray' && key !== 'interceptor') {
            httpConfig[key] = copy(value);
          }
        });

        if (hasBody) httpConfig.data = data;

        route.setUrlParams(httpConfig,
          extend({}, extractParams(data, action.params || {}), params),
          action.url);

        var promise = request(httpConfig.method, httpConfig.url)
          .send(httpConfig.data)
          .end()
          .then(function(response) {
          var data = response.body;

          if (data) {
            // Need to convert action.isArray to boolean in case it is undefined
            // jshint -W018
            if (isArray(data) !== (!!action.isArray)) {
              throw minErr('badcfg',
                  'Error in resource configuration for action `{0}`. Expected response to ' +
                  'contain an {1} but got an {2}', name, action.isArray ? 'array' : 'object',
                isArray(data) ? 'array' : 'object');
            }
            // jshint +W018
            if (action.isArray) {
              value.length = 0;
              forEach(data, function(item) {
                if (typeof item === "object") {
                  value.push(new Resource(item));
                } else {
                  // Valid JSON values may be string literals, and these should not be converted
                  // into objects. These items will not have access to the Resource prototype
                  // methods, but unfortunately there
                  value.push(item);
                }
              });
            } else {
              shallowClearAndCopy(data, value);
            }
          }
          var res = {};
          res.resource = value;

          return res;
        }, function(response) {
          //value.$resolved = true;

          (error || noop)(response);
        });

        promise = promise.then(
          function(response) {
            var value = responseInterceptor(response);
            (success || noop)(value, response.headers);
            return value;
          },
          responseErrorInterceptor);

        if (!isInstanceCall) {
          // we are creating instance / collection
          // - set the initial promise
          // - return the instance / collection

          return value;
        }

        // instance call
        return promise;
      };


      Resource.prototype['$' + name] = function(params, success, error) {
        if (isFunction(params)) {
          error = success; success = params; params = {};
        }
        var result = Resource[name].call(this, params, this, success, error);
        return result;
      };
    });

    Resource.bind = function(additionalParamDefaults) {
      return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
    };

    return Resource;
  }

  return resourceFactory.apply(this, arguments);
};

module.exports = resource;
