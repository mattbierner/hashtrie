# Hashtrie
Javascript Hash Trie

### Overview
The [hash trie][hash-trie] is a [persistent][persistent]
map data structure with good lookup and update performance.

This is a fork from [HAMT][hamt] that only uses array nodes of sparse Javascript
arrays. [Benchmarks show][benchmark] that this library performs well, even for large maps.

Hashtrie is faster than HAMT in some cases for gets and updates,
but has significantly worse fold performance. HAMT index nodes are stored in a
dense array, while hashtrie's sparse arrays have [a lot of overhead for folds](http://jsperf.com/sparse-array-reduce-overhead).


## Install
Source code is in `hashtrie.js` and generated from `lib/hashtrie.js`. The library supports node, AMD, and use as a global.

### Node
``` sh
$ npm install hashtrie
```

``` javascript
var hashtrie = require('hashtrie');

var h = hashtrie.empty.set('key', 'value', h);

...
```


### AMD
``` javascript
requirejs.config({
    paths: {
        'hashtrie': 'hashtrie'
    }
});

require(['hamt'], function(hamt) {
    var h = hashtrie.empty.set('key', 'value', h);
    ...
});
```

# Usage
Hamt provides a method chaining interface and free functions for updating and querying the map. Both APIs provide identical functionality, but the free functions are designed for binding and composition, while the method chaining API is more legible and more Javascripty.

HAMTs are is persistent, so operations always return a modified copy of the map instead of alterting the original.

## Custom Hash Values
Most update and lookup methods have two versions: one that takes a key and uses an internal hash function to compute its hash, and a version that takes a custom computed hash value.


``` javascript
var h = hashtrie.empty.set('key', 'value');
var h2 = hashtrie.empty.setHash(5, 'key', 'value');


h.get('key') === 'value'
h2.getHash(5, 'key') === 'value'
```

If using a custom hash, you must only use the `*Hash` varient of functions to interact with the map. 


``` javascript
// Because the internally computed hash of `key` is not `5`, a direct
// look will not work.
h2.get('key') === undefined

// You must use `getHash` with the same hash value originally passed in.
h2.getHash(5, 'key') === 'value'
```


## API

#### `hashtrie.empty`
An empty map.

----

#### `hashtrie.isEmpty(map)`
#### `map.isEmpty()`
Is a map empty? 

This is the correct method to check if a map is empty. Direct comparisons to `hashtrie.empty` may fail if multiple versions of the library are used.

----

#### `hashtrie.get(key, map)`
#### `map.get(key, [alt])`
Lookup the value for `key` in `map`. 

* `key` - String key.
* `map` - Hashtrie map.

``` javascript
var h = hashtrie.empty.set('key', 'value');

h.get('key') === 'value'
hashtrie.get('key', k) === 'value'

h.get('no such key') === undefined
```

----

#### `hashtrie.getHash(hash, key, map)`
#### `map.getHash(hash, key, [alt])`
Same as `get` but uses a custom hash value.

----

#### `hashtrie.tryGet(alt, key, map)`
#### `map.tryGet(key, alt)`
Same as `get` but returns `alt` if no value for `key` exists.

* `alt` - Value returned if no such key exists in the map.
* `key` - String key.
* `map` - Hashtrie map.

----

#### `hashtrie.has(key, map)`
#### `map.has(key)`
Does an entry for `key` exist in `map`?

* `key` - String key.
* `map` - Hashtrie map.

``` javascript
var h = hashtrie.empty.set('key', 'value');

h.has('key') === true
h.has('no such key') === false
```

----

#### `hashtrie.tryGetHash(alt, hash, key, map)`
#### `map.tryGetHash(hash, key, alt)`
Same as `tryGet` but uses a custom hash value.

----

#### `hashtrie.set(value, key, map)`
#### `map.set(key, value)`
Set the value for `key` in `map`. 

* `value` - Value to store. Hamt supports all value types, including: literals, objects, falsy values, null, and undefined. Keep in mind that only the map data structure itself is guaranteed to be immutable. Using immutable values is recommended but not required.
* `key` - String key.
* `map` - Hashtrie map.

Returns a new map with the value set. Does not alter the original.

``` javascript
var h = hashtrie.empty
    .set('key', 'value');
    .set('key2', 'value2');

var h2 = h.set('key3', 'value3');

h2.get('key') === 'value'
h2.get('key2') === 'value2'
h2.get('key3') === 'value3'

// original `h` was not modified
h.get('key') === 'value'
h.get('key2') === 'value2'
h.get('key3') === undefined
```

----

#### `hashtrie.setHash(value, hash, key, map)`
#### `map.setHash(hash, key, value)`
Same as `set` but uses a custom hash value.

----

#### `hashtrie.modify(f, key, map)`
#### `map.modify(key, f)`
Update the value stored for `key` in `map`. 

* `f` - Function mapping the current value to the new value. If no current value exists, the function is invoked with no arguments. 
* `key` - String key.
* `map` - Hashtrie map.

Returns a new map with the modified value. Does not alter the original.

``` javascript
var h = hashtrie.empty
    .set('i', 2);
    
var h2 = h.modify('i', x => x * x);

h2.get('i') === 4
h.get('i') === 2
h2.count() === 1
h.count() === 1

// Operate on value that does not exist
var h3 = h.modify('new', x => {
    if (x === undefined) {
        return 10;
    }
    return -x;
});

h3.get('new') === 10
h3.count() === 2
```

----

#### `hashtrie.modifyHash(f, hash, key, map)`
#### `map.modifyHash(hash, key, f)`
Same as `modify` but uses a custom hash value.

----

#### `hashtrie.remove(key, map)`
#### `map.remove(key)`
#### `map.delete(key)`
Remove `key` from `map`. 

* `key` - String key.
* `map` - Hashtrie map.

Returns a new map with the value removed. Does not alter the original.

``` javascript
var h = hashtrie.empty
    .set('a', 1)
    .set('b', 2)
    .set('c', 3);
    
var h2 = h.remove('b');

h2.count() === 2;
h2.get('a') === 1
h2.get('b') === undefined
h2.get('c') === 3
```

----

#### `hashtrie.removeHash(hash, key, map)`
#### `map.removeHash(hash, key)`
#### `map.deleteHash(hash, key)`
Same as `remove` but uses a custom hash value.

----

#### `hashtrie.count(map)`
#### `map.count()`
Get number of elements in `map`.

* `map` - Hashtrie map.


``` javascript
hashtrie.empty.count() === 0;
hashtrie.empty.set('a', 3).count() === 1;
hashtrie.empty.set('a', 3).set('b', 3).count() === 2;
```

----

#### `hashtrie.fold(f, z, map)`
#### `map.fold(f, z)`
Fold over the map, accumulating result value.

* `f` - Function invoked with accumulated value, current value, and current key.
* `z` - Initial value.
* `map` - Hashtrie map.

Order is not guaranteed.

``` javascript
var max = hashtrie.fold.bind(null, (acc, value, key) =>
    Math.max(acc, value),
    0);

max(hashtrie.empty.set('key', 3).set('key', 4)) === 4;
```

----

#### `hashtrie.pairs(map)`
#### `map.pairs()`
Get an array of key value pairs in `map`.

* `map` - Hashtrie map.

Order is not guaranteed.

``` javascript
hashtrie.empty.pairs() === [];
hashtrie.empty.set('a', 3).pairs() === [['a', 3]];
hashtrie.empty.set('a', 3).set('b', 3).pairs() === [['a', 3], ['b', 3]];
```

----

#### `hashtrie.key(map)`
#### `map.keys()`
Get an array of all keys in `map`.

* `map` - Hashtrie map.

Order is not guaranteed.

``` javascript
hashtrie.empty.keys() === [];
hashtrie.empty.set('a', 3).keys() === ['a'];
hashtrie.empty.set('a', 3).set('b', 3).keys() === ['a', 'b'];
```

----

#### `hashtrie.values(map)`
#### `map.values()`
Get an array of all values in `map`.

* `map` - Hashtrie map.

Order is not guaranteed. Duplicate entries may exist.

``` javascript
hashtrie.empty.values() === [];
hashtrie.empty.set('a', 3).values() === [3];
hashtrie.empty.set('a', 3).values('b', 3).values() === [3, 3];
```


[hamt]: https://github.com/mattbierner/hamt
[hash-trie]: http://en.wikipedia.org/wiki/Hash_tree_(persistent_data_structure)
[persistent]: http://en.wikipedia.org/wiki/Persistent_data_structure
[benchmark]: https://github.com/mattbierner/js-hashtrie-benchmark