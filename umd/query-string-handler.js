/*!
 * query-string-handler
 * https://github.com/TheC2Group/query-string-handler
 * @version 3.1.1
 * @license MIT (c) The C2 Group (c2experience.com)
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('c2-event-handler')) :
    typeof define === 'function' && define.amd ? define(['c2-event-handler'], factory) :
    (global = global || self, global.queryStringHandler = factory(global.c2EventHandler));
}(this, function (eventHandler) { 'use strict';

    eventHandler = eventHandler && eventHandler.hasOwnProperty('default') ? eventHandler['default'] : eventHandler;

    const qsh = eventHandler({});
    const hasHistoryApi = typeof history.pushState !== 'undefined';
    let _defaults = {};

    let _types;

    let _query;

    const extend = function extend(target, obj) {
      if (target === null || typeof target !== 'object') {
        target = {};
      }

      if (obj === null || typeof obj !== 'object') {
        return target;
      }

      Object.keys(obj).forEach(key => {
        target[key] = typeof obj[key] === 'object' && obj[key] !== null ? extend({}, obj[key]) : obj[key];
      });

      for (var _len = arguments.length, more = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        more[_key - 2] = arguments[_key];
      }

      if (more.length) {
        more.unshift(target);
        return extend.apply(this, more);
      }

      return target;
    };

    const convertTypes = function convertTypes(qs) {
      if (!_types) return;
      Object.keys(_types).forEach(key => {
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
            qs[key] = parseInt(qs[key], 10);
            break;
        }
      });
    };

    const readQueryString = function readQueryString() {
      const qs = extend({}, _defaults);
      location.search.substring(1).split('&').forEach(section => {
        const pair = section.split('=');

        if (pair.length > 1) {
          qs[pair[0]] = decodeURIComponent(pair[1]);
        }
      });
      convertTypes(qs);
      return qs;
    };

    const getPathname = function getPathname() {
      if (window.location.pathname) {
        return window.location.pathname;
      }

      const href = window.location.href;
      const qIndex = href.indexOf('?');
      return qIndex === -1 ? href : href.substring(0, qIndex);
    };

    const toString = function toString(encoded) {
      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      const query = params.length ? extend({}, _query, ...params) : _query;
      const keys = Object.keys(query);
      if (keys.length === 0) return getPathname();
      const result = keys.map(key => {
        const val = query[key];
        let str = '';

        if (val !== _defaults[key]) {
          switch (typeof val) {
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

        return str && "".concat(key, "=").concat(encodeURIComponent(str));
      }).filter(i => i).join(encoded ? '&amp;' : '&');
      return result ? '?' + result : getPathname();
    };

    const onpopstate = function () {
      // because Safari
      let loaded = false;

      if (document.readyState === 'complete') {
        loaded = true;
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            loaded = true;
          }, 0);
        });
      }

      return function () {
        if (!loaded) return; //_query = extend({}, e.state); because Safari

        _query = readQueryString();
        qsh.emit('pop');
      };
    }();

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
      return typeof _query[name] === 'object' && _query[name] !== null ? extend({}, _query[name]) : _query[name];
    };

    qsh.toString = toString;

    qsh.push = function (changes, title) {
      if (typeof changes !== 'object') return;
      const state = extend(_query, changes);

      if (hasHistoryApi) {
        history.pushState(state, title || null, toString());
      }

      qsh.emit('push');
    };

    qsh.replace = function (changes, title) {
      if (typeof changes !== 'object') return;
      const state = extend(_query, changes);

      if (hasHistoryApi) {
        history.replaceState(state, title || null, toString());
      }

      qsh.emit('replace');
    };

    qsh.clone = function () {
      for (var _len3 = arguments.length, more = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        more[_key3] = arguments[_key3];
      }

      return extend({}, _query, ...more);
    };

    qsh.clear = function () {
      let method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'push';
      let title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
      _query = {};
      if (!hasHistoryApi || ['replace', 'push'].indexOf(method) === -1) return;
      this[method]({}, title);
    };

    return qsh;

}));
