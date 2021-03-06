var queryStringHandler = require('../../cjs/query-string-handler');

var qs = queryStringHandler;
var foo = '$&8="thing`';
var pageInit = '?beep=boop&foo=%24%268%3D%22thing%60&num=55.5';
if (document.location.search !== pageInit) {
    history.replaceState({}, null, pageInit);
}
qs.update();

QUnit.test("Get value", function (assert) {
    assert.strictEqual(qs.getValue('beep'), 'boop');
});

QUnit.test("Get decoded value", function (assert) {
    assert.strictEqual(qs.getValue('foo'), foo);
});

QUnit.test("Convert types", function (assert) {
    qs.setTypes({ num: 'float' });
    assert.strictEqual(qs.getValue('num'), 55.5);
    qs.replace({ num: undefined });
});

QUnit.test("Query toString", function (assert) {
    assert.strictEqual(qs.toString(), '?beep=boop&foo=%24%268%3D%22thing%60');
});

QUnit.test("Query toString encoded", function (assert) {
    assert.strictEqual(qs.toString(true), '?beep=boop&amp;foo=%24%268%3D%22thing%60');
});

QUnit.test("Query toString parameters", function (assert) {
    assert.strictEqual(qs.toString(false, { beep: 'yep' }), '?beep=yep&foo=%24%268%3D%22thing%60');
});

QUnit.test("Convert everything to a string", function (assert) {
    var undef;
    var obj = {
        more: 'parameters',
        and: null
    };
    assert.strictEqual(
        qs.toString(true, { beep: undef, foo: null, obj: obj, num: 5.9 }),
        '?num=5.9&amp;obj=%7B%22more%22%3A%22parameters%22%2C%22and%22%3Anull%7D'
    );
});

QUnit.test("Query toString empty", function (assert) {
    assert.strictEqual(qs.toString(false, { beep: '', foo: '' }), window.location.pathname);
});

QUnit.test("Leave out defaults", function (assert) {
    qs.setDefaults({ foo: foo });
    assert.strictEqual(qs.toString(), '?beep=boop');
    qs.setDefaults({});
});

QUnit.test("Push state", function (assert) {
    qs.push({ beep: 'push' }, 'query-string-handler push');
    assert.strictEqual(qs.getValue('beep'), 'push');
});

QUnit.test("Replace state", function (assert) {
    qs.replace({ beep: 'replace=*' });
    assert.strictEqual(qs.getValue('beep'), 'replace=*');
});

QUnit.test("Pop state listener", function (assert) {
    var done = assert.async();

    qs.push({ beep: 'test' }, 'query-string-handler test');
    qs.push({ beep: 'test2' }, 'query-string-handler test2');

    qs.on('pop', () => {
        assert.strictEqual(qs.getValue('beep'), 'test');
        done();
    });

    history.back();
});

QUnit.test("Clone extend", function (assert) {
    qs.replace({ beep: 'boop clone', foo: 'foo clone' });
    assert.deepEqual(qs.clone({ beep: 'extend' }), { beep: 'extend', foo: 'foo clone' });
});

QUnit.test("Clear state", function (assert) {
    qs.clear('push', 'query-string-handler test clear');
    assert.deepEqual(qs.clone(), {});
    assert.strictEqual(window.location.search, '');
});
