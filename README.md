# Hashtrie
Javascript Hash Trie

### Overview
The [hash trie][hash-trie] is a [persistent][persistent]
map data structure with good lookup and update performance.

This is a fork from [HAMT][hamt] that only uses array nodes of sparse Javascript
arrays.

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


// modify an entry
h2 = ht.modify('b', function(x) { return x + 'z'; }, h2);
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
```


[hamt]: https://github.com/mattbierner/hamt
[pdata]: https://github.com/exclipy/pdata
[hash-array-mapped-trie]: http://en.wikipedia.org/wiki/Hash_array_mapped_trie
[persistent]: http://en.wikipedia.org/wiki/Persistent_data_structure