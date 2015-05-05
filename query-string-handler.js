/*!
 * query-string-handler
 * version: 1.0.0
 * https://stash.c2mpg.com:8443/projects/C2/repos/query-string-handler
 */

/* exported queryStringHandler */

var queryStringHandler = (function () {
    'use strict';

    var hasHistoryApi = (typeof history.pushState !== 'undefined');

    var _query;
    var _listeners = [];

    var extend = function (target, obj) {
        var args;

        if (typeof target !== 'object') {
            return {};
        }

        if (typeof obj !== 'object') {
            return target;
        }

        Object.keys(obj).forEach(function (key) {
            target[key] = obj[key];
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

        if (keys.length === 0) return '';

        return '?' + keys.map(function (key) {
            return key + '=' + encodeURIComponent(query[key]);
        }).join(encoded ? '&amp;' : '&');
    };

    var emit = function (type) {
        _listeners.forEach(function (cb) {
            cb(type);
        });
    };

    if (hasHistoryApi) {
        window.addEventListener('popstate', function (e) {
            _query = extend({}, e.state);
            emit('pop');
        });
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
