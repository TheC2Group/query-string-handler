query-string-handler
====================

This turns the query string into a private object. Use the API to read and manipulate the query string.

API
---

### .update()

```js
// only call this if an outside script updates the query string
queryStringHandler.update();
```

### .getValue(name)
@param *name* {String}  
@return {String}  

```js
// get a value from the query string
var val = queryStringHandler.getValue('name');
```

### .toString([encoded[, params]])
@param *encoded* {Boolean}  
@param *params* {Object}  
@return {String}  

```js
// get the query string in string format
// optionally encode the ampersands with the first parameter
// optionally temporary extend the query string with the second parameter
var url = queryStringHandler.toString(true, { beep: 'bop' });
console.log(url); // '?beep=bop'
```

### .push(changes[, title])
@param *changes* {Object}  
@param *title* {String}  

```js
// push a new state with changes to the query string
// optionally change the browser title
// emits an event with type 'pop'
queryStringHandler.push({ foo: 'bar' });
```

### .replace(changes[, title])
@param *changes* {Object}  
@param *title* {String}  

```js
// replace the state with changes to the query string
// optionally change the browser title
// emits an event with type 'replace'
queryStringHandler.replace({ foo: 'bar' });
```

### .addListener(callback)
@param *callback* {Function}  

```js
// add a callback function to the stack
// all callbacks will be called on any event
// the first parameter in the callback will be the event type
queryStringHandler.addListener(function (type) {
    console.log(type);
});
history.back(); // 'pop'
```

### .clone([obj])
@param *obj* {Object}  
@return {Object}

```js
// clone the private query string object
// optionally pass in an object to extend the query string
var clone = queryStringHandler.clone({ beep: 'boop' });
```


Install
-------

```
npm install query-string-handler
```


Tests
-----

Tests are written in qUnit. Open `/test/index.html` in a browser.


ES5 methods to polyfill
-----------------------

* Object.keys
* Array.forEach
* Array.map
* Array.filter


License
-------

MIT © [The C2 Group](https://c2experience.com)
