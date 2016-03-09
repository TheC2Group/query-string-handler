'use strict';

var eventHandler = require('c2-event-handler');
eventHandler = 'default' in eventHandler ? eventHandler['default'] : eventHandler;

var babelHelpers = {};

babelHelpers.typeof = function (obj) {
  return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers;
var qsh = eventHandler({});

var hasHistoryApi = typeof history.pushState !== 'undefined';

var _defaults = {};
var _types = undefined;
var _query = undefined;

var extend = function extend(target, obj) {
    if (target === null || (typeof target === 'undefined' ? 'undefined' : babelHelpers.typeof(target)) !== 'object') {
        target = {};
    }
    if (obj === null || (typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) !== 'object') {
        return target;
    }

    Object.keys(obj).forEach(function (key) {
        target[key] = babelHelpers.typeof(obj[key]) === 'object' && obj[key] !== null ? extend({}, obj[key]) : obj[key];
    });

    for (var _len = arguments.length, more = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        more[_key - 2] = arguments[_key];
    }

    if (more.length) {
        more.unshift(target);
        return extend.apply(this, more);
    }

    return target;
};

var convertTypes = function convertTypes(qs) {
    if (!_types) return;
    Object.keys(_types).forEach(function (key) {
        if (typeof qs[key] !== 'string') return;
        switch (_types[key]) {
            case 'object':
                qs[key] = JSON.parse(qs[key]);
                break;
            case 'boolean':
                qs[key] = Boolean(qs[key]);
                break;
            case 'number':
                qs[key] = Number(qs[key]);
                break;
            case 'float':
                qs[key] = parseFloat(qs[key]);
                break;
            case 'int':
                qs[key] = parseInt(qs[key]);
                break;
        }
    });
};

var readQueryString = function readQueryString() {
    var qs = extend({}, _defaults);
    location.search.substring(1).split('&').forEach(function (section) {
        var pair = section.split('=');
        if (pair.length > 1) {
            qs[pair[0]] = decodeURIComponent(pair[1]);
        }
    });
    convertTypes(qs);
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

var toString = function toString(encoded) {
    for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
    }

    var query = params.length ? extend.apply(undefined, [{}, _query].concat(params)) : _query;
    var keys = Object.keys(query);

    if (keys.length === 0) return getPathname();

    var result = keys.map(function (key) {
        var val = query[key];
        var str = '';
        if (val !== _defaults[key]) {
            switch (typeof val === 'undefined' ? 'undefined' : babelHelpers.typeof(val)) {
                case 'object':
                    str = val === null ? '' : JSON.stringify(val);
                    break;
                case 'number':
                case 'boolean':
                    str = String(val);
                    break;
                case 'string':
                    str = val;
                    break;
            }
        }
        return str && key + '=' + encodeURIComponent(str);
    }).filter(function (i) {
        return i;
    }).join(encoded ? '&amp;' : '&');

    return result ? '?' + result : getPathname();
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
        _query = readQueryString();
        qsh.emit('pop');
    };
})();

if (hasHistoryApi) {
    window.addEventListener('popstate', onpopstate);
}

_query = readQueryString();

qsh.update = function () {
    _query = readQueryString();
};

qsh.setDefaults = function (defaults) {
    _defaults = defaults;
    _query = extend({}, defaults, _query);
};

qsh.setTypes = function (types) {
    _types = types;
    convertTypes(_query);
};

qsh.getValue = function (name) {
    return babelHelpers.typeof(_query[name]) === 'object' && _query[name] !== null ? extend({}, _query[name]) : _query[name];
};

qsh.toString = toString;

qsh.push = function (changes, title) {
    if ((typeof changes === 'undefined' ? 'undefined' : babelHelpers.typeof(changes)) !== 'object') return;
    var state = extend(_query, changes);
    if (hasHistoryApi) {
        history.pushState(state, title || null, toString());
    }
    qsh.emit('push');
};

qsh.replace = function (changes, title) {
    if ((typeof changes === 'undefined' ? 'undefined' : babelHelpers.typeof(changes)) !== 'object') return;
    var state = extend(_query, changes);
    if (hasHistoryApi) {
        history.replaceState(state, title || null, toString());
    }
    qsh.emit('replace');
};

qsh.clone = function () {
    for (var _len3 = arguments.length, more = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        more[_key3] = arguments[_key3];
    }

    return extend.apply(undefined, [{}, _query].concat(more));
};

qsh.clear = function () {
    var method = arguments.length <= 0 || arguments[0] === undefined ? 'push' : arguments[0];
    var title = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

    _query = {};
    if (!hasHistoryApi || ['replace', 'push'].indexOf(method) === -1) return;
    this[method]({}, title);
};

module.exports = qsh;