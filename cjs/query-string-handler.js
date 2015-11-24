'use strict';

var babelHelpers = {};

babelHelpers.typeof = function (obj) {
  return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers;
var hasHistoryApi = typeof history.pushState !== 'undefined';

var _query;
var _listeners = [];

var extend = function extend(target, obj) {
    var args;

    if (target === null || (typeof target === 'undefined' ? 'undefined' : babelHelpers.typeof(target)) !== 'object') {
        target = {};
    }

    if (obj === null || (typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) !== 'object') {
        return target;
    }

    Object.keys(obj).forEach(function (key) {
        var val = obj[key];

        if (typeof val === 'undefined' || val === null) {
            val = '';
        } else if ((typeof val === 'undefined' ? 'undefined' : babelHelpers.typeof(val)) === 'object') {
            val = JSON.stringify(val);
        } else if (typeof val !== 'string') {
            val = String(val);
        }

        target[key] = val;
    });

    if (arguments.length > 2) {
        args = Array.prototype.slice.call(arguments, 2);
        args.unshift(target);
        return extend.apply(this, args);
    }

    return target;
};

var _update = function _update() {
    var qs = {};
    location.search.substring(1).split('&').forEach(function (section) {
        var pair = section.split('=');
        if (pair.length > 1) {
            qs[pair[0]] = decodeURIComponent(pair[1]);
        }
    });
    return qs;
};

var getPathname = function getPathname() {
    if (window.location.pathname) {
        return window.location.pathname;
    }
    var href = window.location.href;
    var qIndex = href.indexOf('?');
    return qIndex === -1 ? href : href.substring(0, qIndex);
};

var toString = function toString(encoded, params) {
    var query = params ? extend({}, _query, params) : _query;

    var keys = Object.keys(query);

    if (keys.length === 0) return getPathname();

    var result = keys.map(function (key) {
        return query[key] ? key + '=' + encodeURIComponent(query[key]) : '';
    }).filter(function (i) {
        return i;
    }).join(encoded ? '&amp;' : '&');

    return result ? '?' + result : getPathname();
};

var emit = function emit(type) {
    _listeners.forEach(function (cb) {
        cb(type);
    });
};

var onpopstate = (function () {

    // because Safari
    var loaded = false;
    if (document.readyState === 'complete') {
        loaded = true;
    } else {
        window.addEventListener('load', function () {
            setTimeout(function () {
                loaded = true;
            }, 0);
        });
    }

    return function () {
        if (!loaded) return;
        //_query = extend({}, e.state); because Safari
        _query = _update();
        emit('pop');
    };
})();

if (hasHistoryApi) {
    window.addEventListener('popstate', onpopstate);
}

_query = _update();

var queryStringHandler = {

    update: function update() {
        _query = _update();
    },

    getValue: function getValue(name) {
        if (typeof _query[name] !== 'string') return '';
        return _query[name];
    },

    toString: toString,

    push: function push(changes, title) {
        if ((typeof changes === 'undefined' ? 'undefined' : babelHelpers.typeof(changes)) !== 'object') return;
        var state = extend(_query, changes);
        if (hasHistoryApi) {
            history.pushState(state, title || null, toString());
        }
        emit('push');
    },

    replace: function replace(changes, title) {
        if ((typeof changes === 'undefined' ? 'undefined' : babelHelpers.typeof(changes)) !== 'object') return;
        var state = extend(_query, changes);
        if (hasHistoryApi) {
            history.replaceState(state, title || null, toString());
        }
        emit('replace');
    },

    addListener: function addListener(callback) {
        if (typeof callback !== 'function') return;
        _listeners.push(callback);
    },

    clone: function clone(obj) {
        if ((typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) !== 'object') return extend({}, _query);
        return extend({}, _query, obj);
    },

    clear: function clear(method, title) {
        method = method || 'push';
        _query = {};
        if (!hasHistoryApi || ['replace', 'push'].indexOf(method) === -1) return;
        this[method]({}, title);
    }
};

module.exports = queryStringHandler;