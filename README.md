# Hashtrie
Javascript Hash Trie

### Overview
The [hash trie][hash-trie] is a [persistent][persistent]
map data structure with good lookup and update performance.

This is a fork from [HAMT][hamt] that only uses array nodes of sparse Javascript
arrays. [Benchmarks show][benchmark] that this library performs well, even for large maps.

Hashtrie is faster than HAMT for gets and updates, but has significantly worse
fold performance. HAMT index nodes are stored in a dense array, while hashtrie's sparse
arrays have [a lot of overhead for folds][http://jsperf.com/sparse-array-reduce-overhead].


## Install

### Node
Node source is in `dist_node/hashtrie.js`

```
$ npm install hashtrie
```

### Amd
Amd source is in `dist/hashtrie.js`

```
requirejs.config({
    paths: {
        'hashtrie': 'dist/hashtrie'
    }
});

require([
    'hashtrie'],
function(ht) {
    ...
});
```

## Usage

```
var ht = require('hashtrie');

// empty table
var h = ht.empty;

// Set 'key' to 'value'
h = ht.set('key', 'value', h);

// get 'key'
ht.get('key', h); // 'value'


// The data structure is persistent so the original is not modified.
var h1 = ht.set('a', 'x', ht.empty);
var h2 = ht.set('b', 'y', h1);

ht.get('a', h1); // 'x'
ht.get('b', h1); // null
ht.get('a', h2); // 'x'
ht.get('b', h2); // 'y'

// set if an entry exists
var h = ht.set('b', 'y', ht.set('a', 'x', ht.empty));

ht.has('b', h); // true
ht.has('w', h); // false

// Get with default value
ht.tryGet('default', 'b', h); // 'y'
ht.tryGet('default', 'w', h); // 'default'

// modify an entry
h2 = ht.modify('b', \x -> x + 'z', h2);
ht.get('b', h2); // 'yz'

// remove an entry
h2 = ht.remove('y', h2);
ht.get('a', h2); // 'x'
ht.get('b', h2); // null


// Custom hash Function
// The main hashtrie API expects all keys to be strings. Versions of all API functions
// that take a `hash` parameter are also provided so custom hashes and keys can be used.

// Collisions are correctly handled
var h1 = ht.setHash(0, 'a', 'x', ht.empty);
var h2 = ht.setHash(0, 'b', 'y', h1);

ht.get('a', h2); // 'x'
ht.get('b', h2); // 'y'


// Aggregate Info
var h = ht.set('b', 'y', ht.set('a', 'x', ht.empty));

ht.count(h); // 2
ht.keys(h); // ['b', 'a'];
ht.values(h); // ['y', 'x'];
ht.pairs(h); // [['b', 'y'], ['a', 'x']];

// Fold
var h = ht.set('a', 10, h.set('b', 4, ht.set('c', -2, ht.empty)));

var sum = ht.fold@(\p, [key, value] -> p + value, 0);

sum(h); //12
```


[hamt]: https://github.com/mattbierner/hamt
[hash-trie]: http://en.wikipedia.org/wiki/Hash_tree_(persistent_data_structure)
[persistent]: http://en.wikipedia.org/wiki/Persistent_data_structure
[benchmark]: https://github.com/mattbierner/js-hashtrie-benchmark