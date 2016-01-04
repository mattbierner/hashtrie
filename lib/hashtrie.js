var hashtrie = {};

var constant = x => () => x;

/* Configuration
 ******************************************************************************/
var SIZE = 4;

var BUCKET_SIZE = Math.pow(2, SIZE);

var mask = BUCKET_SIZE - 1;

/* Nothing
 ******************************************************************************/
var nothing = ({});

var isNothing = x => x === nothing;

var maybe = (val, alt) =>
    isNothing(val) ? alt : val;

/* Bit Ops
 ******************************************************************************/
var hashFragment = (shift, h) =>
    (h >>> shift) & mask;

/* Hashing
 ******************************************************************************/
/**
	Get 32 bit hash of string.
	
	Based on:
	http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
 */
const hash = hashtrie.hash = str => {
    if (typeof str === 'number')
        return str;
    
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i = i + 1) {
        const c = str.charCodeAt(i);
        hash = (((hash << 5) - hash) + c) | 0;
    }
    return hash;
};

/* Node Structures
 ******************************************************************************/
function Map(root) {
    this.root = root;
};

const LEAF = 1;
const COLLISION = 2;
const INTERNAL = 3;

/**
	Empty node.
 */
const empty = { __hashtrie_empty: true };

const isEmptyNode = x =>
    x === empty || (x && x.__hashtrie_empty);

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
const arrayUpdate = (at, v, arr) => {
    const len = arr.length;
    const out = new Array(len);
    for (let i = 0; i < len; ++i) 
        out[i] = arr[i];
    out[at] = v;
    return out;
};

/**
	Remove a value from an array.
	
	@param at Index to remove.
	@param arr Array.
 */
var arrayRemove = (at, arr) =>
    arrayUpdate(at, undefined, arr);

/**
	Remove a value from an array.
	
	@param at Index to remove.
	@param arr Array.
*/
const arraySpliceOut = (at, arr) => {
    const len = arr.length;
    const out = new Array(len - 1);
    let i = 0, g = 0;
    while (i < at)
        out[g++] = arr[i++];
    ++i;
    while (i < len)
        out[g++] = arr[i++];
    return out;
};
/* 
 ******************************************************************************/
/**
	Create an internal node with one child
 */
var create1Internal = (h, n) => {
    var children = [];
    children[h] = n;
    return new InternalNode(1, children);
};

/**
	Create an internal node with two children
 */
var create2Internal = (h1, n1, h2, n2) => {
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
var mergeLeaves = (shift, h1, n1, h2, n2) => {
    if (h1 === h2)
        return new Collision(h1, [n2, n1]);
        
    const subH1 = hashFragment(shift, h1);
    const subH2 = hashFragment(shift, h2);
    return subH1 === subH2
        ?create1Internal(subH1, mergeLeaves(shift + SIZE, n1, n2))
        :create2Internal(subH1, n1, subH2, n2);
};

/**
	Update an entry in a collision list.
 */
const updateCollisionList = (h, list, f, k) => {
    let target;
    let i = 0;
    for (const len = list.length; i < len; ++i) {
        const child = list[i];
        if (child.key === k) {
            target = child;
            break;
        }
    }
    
    const v = target ? f(target.value) : f();
    return v === nothing
        ?arraySpliceOut(i, list)
        :arrayUpdate(i, new Leaf(h, k, v), list);
};

/* Lookups
 ******************************************************************************/
var _lookup = (node, h, k) => {
    let shift = 0;
    while (true) switch (node.type) {
    case LEAF:
    {
        return k === node.key ? node.value : nothing;
    }   
    case COLLISION:
    {
        if (h === node.hash) {
            const children = node.children;
            for (let i = 0, len = children.length; i < len; ++i) {
                const child = children[i];
                if (k === child.key)
                    return child.value;
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
};

/* Editing
 ******************************************************************************/
empty._modify = function(shift, f, h, k) {
    const v = f()
    return isNothing(v) ? empty : new Leaf(h, k, v);
};


Leaf.prototype._modify = function(shift, f, h, k) {
   if (k === this.key) {
        const v = f(this.value);
        return v === nothing ? empty : new Leaf(h, k, v);
    }
    const v = f();
    return v === nothing
        ?this
        :mergeLeaves(shift, this.hash, this, h, new Leaf(h, k, v));
};

Collision.prototype._modify = function(shift, f, h, k) {
    if (h === this.hash) {
        const list = updateCollisionList(this.hash, this.children, f, k);
        return list.length > 1
            ?new Collision(this.hash, list)
            :list[0]; // collapse single element collision list
    }
    const v = f();
    return v === nothing
        ?this
        :mergeLeaves(shift, this.hash, this, h, new Leaf(h, k, v));
};

InternalNode.prototype._modify = function(shift, f, h, k) {
    var frag = hashFragment(shift, h);
    var child = this.children[frag] || empty;
    var newChild = child._modify(shift + SIZE, f, h, k);
    
    if (isEmptyNode(child) && !isEmptyNode(newChild)) { // added
        return new InternalNode(
            this.count + 1,
            arrayUpdate(frag, newChild, this.children))
    }
    
    if (!isEmptyNode(child) && isEmptyNode(newChild)) { // removed
        return this.count - 1 <= 0
            ?empty
            :new InternalNode(
                this.count - 1,
                arrayRemove(frag, this.children));
    }
            
    // modified
    return new InternalNode(
        this.count,
        arrayUpdate(frag, newChild, this.children));
};

/*
 ******************************************************************************/
/**
	Is an object a hashtrie?
 */
hashtrie.isHashTrie = m =>
    (m instanceof Map);

/* Queries
 ******************************************************************************/
/**
    Lookup the value for `key` in `map` using a custom `hash`.
    
    Returns the value or `alt` if none.
*/
const tryGetHash = hashtrie.tryGetHash = (alt, hash, key, map) => {
    const v = _lookup(map.root, hash, key);
    return v === nothing ? alt : v;
};

Map.prototype.tryGetHash = function(hash, key, alt) {
    return tryGetHash(alt, hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.
    
    @see `tryGetHash`
*/
const tryGet = hashtrie.tryGet = (alt, key, map) =>
    tryGetHash(alt, hash(key), key, map);

Map.prototype.tryGet = function(key, alt) {
    return tryGet(alt, key, this);
};

/**
    Lookup the value for `key` in `map` using a custom `hash`.
    
    Returns the value or `undefined` if none.
*/
const getHash = hashtrie.getHash = (hash, key, map) =>
    tryGetHash(undefined, hash, key, map);

Map.prototype.getHash = function(hash, key, alt) {
    return getHash(hash, key, this);
};

/**
    Lookup the value for `key` in `map` using internal hash function.
    
    @see `get`
*/
const get = hashtrie.get = (key, map) =>
    tryGet(undefined, key, map);

Map.prototype.get = function(key, alt) {
    return tryGet(alt, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses custom `hash`.
*/
const hasHash = hashtrie.has = (hash, key, map) =>
    tryGetHash(nothing, hash, key, map) !== nothing;

Map.prototype.hasHash = function(hash, key) {
    return hasHash(hash, key, this);
};

/**
    Does an entry exist for `key` in `map`? Uses internal hash function.
*/
const has = hashtrie.has = (key, map) =>
    hasHash(hash(key), key, map);
    
Map.prototype.has = function(key) {
    return has(key, this);
};

/**
    Empty node.
*/
hashtrie.empty = new Map(empty);

/**
    Does `map` contain any elements?
*/
const isEmpty = hashtrie.isEmpty = (map) =>
    !!isEmptyNode(map.root);
    
Map.prototype.isEmpty = function() {
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
const modifyHash = hashtrie.modifyHash = (f, hash, key, map) =>
    new Map(map.root._modify(0, f, hash, key));

Map.prototype.modifyHash = function(hash, key, f) {
    return modifyHash(f, hash, key, this);
};

/**
    Alter the value stored for `key` in `map` using function `f` using 
    internal hash function.
    
    @see `modifyHash`
*/
const modify = hashtrie.modify = (f, key, map) =>
    modifyHash(f, hash(key), key, map);

Map.prototype.modify = function(key, f) {
    return modify(f, key, this);
};

/**
    Store `value` for `key` in `map` using custom `hash`.

    Returns a map with the modified value. Does not alter `map`.
*/
const setHash = hashtrie.setHash = (value, hash, key, map) =>
    modifyHash(constant(value), hash, key, map);

Map.prototype.setHash = function(hash, key, value) {
    return setHash(value, hash, key, this);
};

/**
    Store `value` for `key` in `map` using internal hash function.
      
    @see `setHash`
*/
const set = hashtrie.set = (value, key, map) =>
    setHash(value, hash(key), key, map);

Map.prototype.set = function(key, value) {
    return set(value, key, this);
};

/**
    Remove the entry for `key` in `map`.

    Returns a map with the value removed. Does not alter `map`.
*/
const del = constant(nothing);
const removeHash = hashtrie.removeHash = (hash, key, map) =>
    modifyHash(del, hash, key, map);

Map.prototype.removeHash = Map.prototype.deleteHash = function(hash, key) {
    return removeHash(hash, key, this);
};

/**
    Remove the entry for `key` in `map` using internal hash function.
    
    @see `removeHash`
*/
const remove = hashtrie.remove = (key, map) =>
    removeHash(hash(key), key, map);

Map.prototype.remove = Map.prototype.delete = function(key) {
    return remove(key, this);
};

/* Fold
 ******************************************************************************/
Leaf.prototype._fold = function(f, z) {
    return f(z, this.value, this.key);
};

Collision.prototype._fold = function(f, z) {
    return this.children.reduce((p, c) => f(p, c.value, c.key), z);
};

InternalNode.prototype._fold = function(f, z) {
    const children = this.children;
    for (let i = 0, len = children.length; i < len; ++i) {
        const c = children[i];
        if (c && c._fold)
            z = c instanceof Leaf
                ?f(z, c.value, c.key)
                :c._fold(f, z);
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
const fold = hashtrie.fold = (f, z, m) =>
    isEmptyNode(m.root) ? z : m.root._fold(f, z);

Map.prototype.fold = function(f, z) {
    return fold(f, z, this);
};

/* Aggregate
 ******************************************************************************/
/**
    Get the number of entries in `map`.
*/
let inc = x => x + 1;
const count = hashtrie.count = map =>
    fold(inc, 0, map);

Map.prototype.count = function() {
    return count(this);
};

/**
    Get array of all key value pairs as arrays of [key, value] in `map`.
 
    Order is not guaranteed.
*/
const buildPairs = (p, value, key) => { p.push([key, value]); return p; };
const pairs = hashtrie.pairs = map =>
    fold(buildPairs, [], m);

Map.prototype.pairs = function() {
    return count(this);
};

/**
    Get array of all keys in `map`.

    Order is not guaranteed.
*/
const buildKeys = (p, _, key) => { p.push(key); return p; };
const keys = hashtrie.keys = m =>
    fold(buildKeys, [], m);

Map.prototype.keys = function() {
    return keys(this);
};

/**
    Get array of all values in `map`.

    Order is not guaranteed, duplicates are preserved.
*/
const buildValues = (p, value) => { p.push(value); return p; };
const values = hashtrie.values = m =>
    fold(buildValues, [], m);

Map.prototype.values = function() {
    return values(this);
};


/* Export
 ******************************************************************************/
if (typeof module !== 'undefined' && module.exports) {
    module.exports = hashtrie;
} else if (typeof define === 'function' && define.amd) {
    define('hashtrie', [], () => hashtrie);
} else {
    this.hashtrie = hashtrie;
}
