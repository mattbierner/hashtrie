'use strict';

var hashtrie = {};

var constant = function constant(x) {
    return function () {
        return x;
    };
};

/* Configuration
 ******************************************************************************/
var SIZE = 4;

var BUCKET_SIZE = Math.pow(2, SIZE);

var mask = BUCKET_SIZE - 1;

/* Nothing
 ******************************************************************************/
var nothing = {};

var isNothing = function isNothing(x) {
    return x === nothing;
};

var maybe = function maybe(val, alt) {
    return isNothing(val) ? alt : val;
};

/* Bit Ops
 ******************************************************************************/
var hashFragment = function hashFragment(shift, h) {
    return h >>> shift & mask;
};

/* Hashing
 ******************************************************************************/
/**
	Get 32 bit hash of string.
	
	Based on:
	http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
var hash = hashtrie.hash = function (str) {
    if (typeof str === 'number') return str;

    var hash = 0;
    for (var i = 0, len = str.length; i < len; i = i + 1) {
        var c = str.charCodeAt(i);
        hash = (hash << 5) - hash + c | 0;
    }
    return hash;
};

/* Node Structures
 ******************************************************************************/
function Map(root) {
    this.root = root;
};

var LEAF = 1;
var COLLISION = 2;
var INTERNAL = 3;

/**
	Empty node.
 */
var empty = { __hashtrie_empty: true };

var isEmptyNode = function isEmptyNode(x) {
    return x === empty || x && x.__hashtrie_empty;
};

/**
	Leaf holding a value.
	
	@member hash Hash of key.
	@member key Key.
	@member value Value stored.
 */
function Leaf(hash, key, value) {
    this.type = LEAF;
    this.hash = hash;
    this.key = key;
    this.value = value;
};

/**
	Leaf holding multiple values with the same hash but different keys.
	
	@member hash Hash of key.
	@member children Array of collision nodes.
 */
function Collision(hash, children) {
    this.type = COLLISION;
    this.hash = hash;
    this.children = children;
};

/**
	Internal node
	
	@member count Number of children.
	@member children Array of child nodes.
 */
function InternalNode(count, children) {
    this.type = INTERNAL;
    this.count = count;
    this.children = children;
};

/* Array ops
 ******************************************************************************/
/**
	Set a value in an array.
	
	Returns copy of the array with value set.
	
	@param at Index to set.
	@param v Value.
	@param arr Array.
 */
var arrayUpdate = function arrayUpdate(at, v, arr) {
    var len = arr.length;
    var out = new Array(len);
    for (var i = 0; i < len; ++i) {
        out[i] = arr[i];
    }out[at] = v;
    return out;
};

/**
	Remove a value from an array.
	
	@param at Index to remove.
	@param arr Array.
 */
var arrayRemove = function arrayRemove(at, arr) {
    return arrayUpdate(at, undefined, arr);
};

/**
	Remove a value from an array.
	
	@param at Index to remove.
	@param arr Array.
*/
var arraySpliceOut = function arraySpliceOut(at, arr) {
    var len = arr.length;
    var out = new Array(len - 1);
    var i = 0,
        g = 0;
    while (i < at) {
        out[g++] = arr[i++];
    }++i;
    while (i < len) {
        out[g++] = arr[i++];
    }return out;
};
/* 
 ******************************************************************************/
/**
	Create an internal node with one child
 */
var create1Internal = function create1Internal(h, n) {
    var children = [];
    children[h] = n;
    return new InternalNode(1, children);
};

/**
	Create an internal node with two children
 */
var create2Internal = function create2Internal(h1, n1, h2, n2) {
    var children = [];
    children[h1] = n1;
    children[h2] = n2;
    return new InternalNode(2, children);
};

/**
	Merge two leaf nodes.
	
	@param shift Current shift.
	@param h1 Hash of node 1.
	@param n1 Node 1.
	@param h2 Hash of node 2.
	@param n2 Node 2.
 */
var mergeLeaves = function mergeLeaves(shift, h1, n1, h2, n2) {
    if (h1 === h2) return new Collision(h1, [n2, n1]);

    var subH1 = hashFragment(shift, h1);
    var subH2 = hashFragment(shift, h2);
    return subH1 === subH2 ? create1Internal(subH1, mergeLeaves(shift + SIZE, n1, n2)) : create2Internal(subH1, n1, subH2, n2);
};

/**
	Update an entry in a collision list.
 */
var updateCollisionList = function updateCollisionList(h, list, f, k) {
    var target = undefined;
    var i = 0;
    for (var len = list.length; i < len; ++i) {
        var child = list[i];
        if (child.key === k) {
            target = child;
            break;
        }
    }

    var v = target ? f(target.value) : f();
    return v === nothing ? arraySpliceOut(i, list) : arrayUpdate(i, new Leaf(h, k, v), list);
};

/* Lookups
 ******************************************************************************/
var _lookup = function _lookup(node, h, k) {
    var shift = 0;
    while (true) {
        switch (node.type) {
            case LEAF:
                {
                    return k === node.key ? node.value : nothing;
                }
            case COLLISION:
                {
                    if (h === node.hash) {
                        var children = node.children;
                        for (var i = 0, len = children.length; i < len; ++i) {
                            var child = children[i];
                            if (k === child.key) return child.value;
                        }
                    }
                    return nothing;
                }
            case INTERNAL:
                {
                    node = node.children[hashFragment(shift, h)];
                    if (node) {
                        shift += SIZE;
                        break;
                    } else {
                        return nothing;
                    }
                }
            default:
                return nothing;
        }
    }
};

/* Editing
 ******************************************************************************/
empty._modify = function (shift, f, h, k) {
    var v = f();
    return isNothing(v) ? empty : new Leaf(h, k, v);
};

Leaf.prototype._modify = function (shift, f, h, k) {
    if (k === this.key) {
        var _v = f(this.value);
        return _v === nothing ? empty : new Leaf(h, k, _v);
    }
    var v = f();
    return v === nothing ? this : mergeLeaves(shift, this.hash, this, h, new Leaf(h, k, v));
};

Collision.prototype._modify = function (shift, f, h, k) {
    if (h === this.hash) {
        var list = updateCollisionList(this.hash, this.children, f, k);
        return list.length > 1 ? new Collision(this.hash, list) : list[0]; // collapse single element collision list
    }
    var v = f();
    return v === nothing ? this : mergeLeaves(shift, this.hash, this, h, new Leaf(h, k, v));
};

InternalNode.prototype._modify = function (shift, f, h, k) {
    var frag = hashFragment(shift, h);
    var child = this.children[frag] || empty;
    var newChild = child._modify(shift + SIZE, f, h, k);

    if (isEmptyNode(child) && !isEmptyNode(newChild)) {
        // added
        return new InternalNode(this.count + 1, arrayUpdate(frag, newChild, this.children));
    }

    if (!isEmptyNode(child) && isEmptyNode(newChild)) {
        // removed
        return this.count - 1 <= 0 ? empty : new InternalNode(this.count - 1, arrayRemove(frag, this.children));
    }

    // modified
    return new InternalNode(this.count, arrayUpdate(frag, newChild, this.children));
};

/*
 ******************************************************************************/
/**
	Is an object a hashtrie?
 */
hashtrie.isHashTrie = function (m) {
    return m instanceof Map;
};

/* Queries
 ******************************************************************************/
/**
    Lookup the value for `key` in `map` using a custom `hash`.
    
    Returns the value or `alt` if none.
*/
var tryGetHash = hashtrie.tryGetHash = function (alt, hash, key, map) {
    var v = _lookup(map.root, hash, key);
    return v === nothing ? alt : v;
};

Map.prototype.tryGetHash = function (hash, key, alt) {
    return tryGetHash(alt, hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.
    
    @see `tryGetHash`
*/
var tryGet = hashtrie.tryGet = function (alt, key, map) {
    return tryGetHash(alt, hash(key), key, map);
};

Map.prototype.tryGet = function (key, alt) {
    return tryGet(alt, key, this);
};

/**
    Lookup the value for `key` in `map` using a custom `hash`.
    
    Returns the value or `undefined` if none.
*/
var getHash = hashtrie.getHash = function (hash, key, map) {
    return tryGetHash(undefined, hash, key, map);
};

Map.prototype.getHash = function (hash, key, alt) {
    return getHash(hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.
    
    @see `get`
*/
var get = hashtrie.get = function (key, map) {
    return tryGet(undefined, key, map);
};

Map.prototype.get = function (key, alt) {
    return tryGet(alt, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses custom `hash`.
*/
var hasHash = hashtrie.has = function (hash, key, map) {
    return tryGetHash(nothing, hash, key, map) !== nothing;
};

Map.prototype.hasHash = function (hash, key) {
    return hasHash(hash, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses internal hash function.
*/
var has = hashtrie.has = function (key, map) {
    return hasHash(hash(key), key, map);
};

Map.prototype.has = function (key) {
    return has(key, this);
};

/**
    Empty node.
*/
hashtrie.empty = new Map(empty);

/**
    Does `map` contain any elements?
*/
var isEmpty = hashtrie.isEmpty = function (map) {
    return !!isEmptyNode(map.root);
};

Map.prototype.isEmpty = function () {
    return isEmpty(this);
};

/* Updates
 ******************************************************************************/
/**
    Alter the value stored for `key` in `map` using function `f` using
    custom hash.
    
    `f` is invoked with the current value for `k` if it exists,
    or no arguments if no such value exists. `modify` will always either
    update or insert a value into the map.
    
    Returns a map with the modified value. Does not alter `map`.
*/
var modifyHash = hashtrie.modifyHash = function (f, hash, key, map) {
    return new Map(map.root._modify(0, f, hash, key));
};

Map.prototype.modifyHash = function (hash, key, f) {
    return modifyHash(f, hash, key, this);
};

/**
    Alter the value stored for `key` in `map` using function `f` using 
    internal hash function.
    
    @see `modifyHash`
*/
var modify = hashtrie.modify = function (f, key, map) {
    return modifyHash(f, hash(key), key, map);
};

Map.prototype.modify = function (key, f) {
    return modify(f, key, this);
};

/**
    Store `value` for `key` in `map` using custom `hash`.

    Returns a map with the modified value. Does not alter `map`.
*/
var setHash = hashtrie.setHash = function (value, hash, key, map) {
    return modifyHash(constant(value), hash, key, map);
};

Map.prototype.setHash = function (hash, key, value) {
    return setHash(value, hash, key, this);
};

/**
    Store `value` for `key` in `map` using internal hash function.
      
    @see `setHash`
*/
var set = hashtrie.set = function (value, key, map) {
    return setHash(value, hash(key), key, map);
};

Map.prototype.set = function (key, value) {
    return set(value, key, this);
};

/**
    Remove the entry for `key` in `map`.

    Returns a map with the value removed. Does not alter `map`.
*/
var del = constant(nothing);
var removeHash = hashtrie.removeHash = function (hash, key, map) {
    return modifyHash(del, hash, key, map);
};

Map.prototype.removeHash = Map.prototype.deleteHash = function (hash, key) {
    return removeHash(hash, key, this);
};

/**
    Remove the entry for `key` in `map` using internal hash function.
    
    @see `removeHash`
*/
var remove = hashtrie.remove = function (key, map) {
    return removeHash(hash(key), key, map);
};

Map.prototype.remove = Map.prototype.delete = function (key) {
    return remove(key, this);
};

/* Fold
 ******************************************************************************/
Leaf.prototype._fold = function (f, z) {
    return f(z, this.value, this.key);
};

Collision.prototype._fold = function (f, z) {
    return this.children.reduce(function (p, c) {
        return f(p, c.value, c.key);
    }, z);
};

InternalNode.prototype._fold = function (f, z) {
    var children = this.children;
    for (var i = 0, len = children.length; i < len; ++i) {
        var c = children[i];
        if (c && c._fold) z = c instanceof Leaf ? f(z, c.value, c.key) : c._fold(f, z);
    }
    return z;
};

/**
    Visit every entry in the map, aggregating data.

    Order of nodes is not guaranteed.
    
    @param f Function mapping previous value and key value object to new value.
    @param z Starting value.
    @param m HAMT
*/
var fold = hashtrie.fold = function (f, z, m) {
    return isEmptyNode(m.root) ? z : m.root._fold(f, z);
};

Map.prototype.fold = function (f, z) {
    return fold(f, z, this);
};

/* Aggregate
 ******************************************************************************/
/**
    Get the number of entries in `map`.
*/
var inc = function inc(x) {
    return x + 1;
};
var count = hashtrie.count = function (map) {
    return fold(inc, 0, map);
};

Map.prototype.count = function () {
    return count(this);
};

/**
    Get array of all key value pairs as arrays of [key, value] in `map`.
 
    Order is not guaranteed.
*/
var buildPairs = function buildPairs(p, value, key) {
    p.push([key, value]);return p;
};
var pairs = hashtrie.pairs = function (map) {
    return fold(buildPairs, [], m);
};

Map.prototype.pairs = function () {
    return count(this);
};

/**
    Get array of all keys in `map`.

    Order is not guaranteed.
*/
var buildKeys = function buildKeys(p, _, key) {
    p.push(key);return p;
};
var keys = hashtrie.keys = function (m) {
    return fold(buildKeys, [], m);
};

Map.prototype.keys = function () {
    return keys(this);
};

/**
    Get array of all values in `map`.

    Order is not guaranteed, duplicates are preserved.
*/
var buildValues = function buildValues(p, value) {
    p.push(value);return p;
};
var values = hashtrie.values = function (m) {
    return fold(buildValues, [], m);
};

Map.prototype.values = function () {
    return values(this);
};

/* Export
 ******************************************************************************/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = hashtrie;
} else if (typeof define === 'function' && define.amd) {
    define('hashtrie', [], function () {
        return hashtrie;
    });
} else {
    undefined.hashtrie = hashtrie;
}
//# sourceMappingURL=hashtrie.js.map
