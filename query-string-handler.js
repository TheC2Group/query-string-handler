'use strict';

import eventHandler from 'c2-event-handler';

const qsh = eventHandler({});

const hasHistoryApi = (typeof history.pushState !== 'undefined');

let _defaults = {};
let _types;
let _query;

const extend = function (target, obj, ...more) {
    if (target === null || typeof target !== 'object') {
        target = {};
    }
    if (obj === null || typeof obj !== 'object') {
        return target;
    }

    Object.keys(obj).forEach(key => {
        target[key] = (typeof obj[key] === 'object' && obj[key] !== null) ? extend({}, obj[key]) : obj[key];
    });

    if (more.length) {
        more.unshift(target);
        return extend.apply(this, more);
    }

    return target;
};

const convertTypes = function (qs) {
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

const readQueryString = function () {
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

const getPathname = function () {
    if (window.location.pathname) {
        return window.location.pathname;
    }
    const href = window.location.href;
    const qIndex = href.indexOf('?');
    return (qIndex === -1) ? href : href.substring(0, qIndex);
};

const toString = function (encoded, ...params) {
    const query = (params.length) ? extend({}, _query, ...params) : _query;
    const keys = Object.keys(query);

    if (keys.length === 0) return getPathname();

    const result = keys.map(key => {
        const val = query[key];
        let str = '';
        if (val !== _defaults[key]) {
            switch (typeof val) {
                case 'object':
                    str = (val === null) ? '' : JSON.stringify(val);
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
        return str && `${key}=${encodeURIComponent(str)}`;
    })
    .filter(i => i)
    .join(encoded ? '&amp;' : '&');

    return (result) ? '?' + result : getPathname();
};

const onpopstate = (function () {
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
        if (!loaded) return;
        //_query = extend({}, e.state); because Safari
        _query = readQueryString();
        qsh.emit('pop');
    };
}());

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
    return (typeof _query[name] === 'object' && _query[name] !== null) ? extend({}, _query[name]) : _query[name];
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

qsh.clone = function (...more) {
    return extend({}, _query, ...more);
};

qsh.clear = function (method = 'push', title = undefined) {
    _query = {};
    if (!hasHistoryApi || ['replace', 'push'].indexOf(method) === -1) return;
    this[method]({}, title);
};

export default qsh;
