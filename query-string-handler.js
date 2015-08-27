/*!
 * Query String Handler
 * https://github.com/TheC2Group/query-string-handler
 * @version 1.2.0
 * @license MIT (c) The C2 Group (c2experience.com)
 */

var queryStringHandler = (function () {
    'use strict';

    var hasHistoryApi = (typeof history.pushState !== 'undefined');

    var _query;
    var _listeners = [];

    var extend = function (target, obj) {
        var args;

        if (target === null || typeof target !== 'object') {
            target = {};
        }

        if (obj === null || typeof obj !== 'object') {
            return target;
        }

        Object.keys(obj).forEach(function (key) {
            var val = obj[key];

            if (typeof val === 'undefined' || val === null) {
                val = '';
            } else if (typeof val === 'object') {
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

    var update = function () {
        var qs = {};
        location.search.substring(1).split('&').forEach(function (section) {
            var pair = section.split('=');
            if (pair.length > 1) {
                qs[pair[0]] = decodeURIComponent(pair[1]);
            }
        });
        return qs;
    };

    var toString = function (encoded, params) {
        var query = (params) ? extend({}, _query, params) : _query;

        var keys = Object.keys(query);

        if (keys.length === 0) return '?';

        var result = keys.map(function (key) {
            return query[key] ? key + '=' + encodeURIComponent(query[key]) : '';
        })
        .filter(function (i) { return i; })
        .join(encoded ? '&amp;' : '&');

        return '?' + result;
    };

    var emit = function (type) {
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
            _query = update();
            emit('pop');
        };
    }());

    if (hasHistoryApi) {
        window.addEventListener('popstate', onpopstate);
    }

    _query = update();

    return {

        update: function () {
            _query = update();
        },

        getValue: function (name) {
            if (typeof _query[name] !== 'string') return '';
            return _query[name];
        },

        toString: toString,

        push: function (changes, title) {
            if (typeof changes !== 'object') return;
            var state = extend(_query, changes);
            if (hasHistoryApi) {
                history.pushState(state, title || null, toString());
            }
            emit('push');
        },

        replace: function (changes, title) {
            if (typeof changes !== 'object') return;
            var state = extend(_query, changes);
            if (hasHistoryApi) {
                history.replaceState(state, title || null, toString());
            }
            emit('replace');
        },

        addListener: function (callback) {
            if (typeof callback !== 'function') return;
            _listeners.push(callback);
        },

        clone: function (obj) {
            if (typeof obj !== 'object') return extend({}, _query);
            return extend({}, _query, obj);
        }
    };
}());

// export commonjs
if (typeof module !== 'undefined' && ('exports' in module)) {
    module.exports = queryStringHandler;
}
