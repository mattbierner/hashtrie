/*
 * THIS FILE IS AUTO GENERATED from 'lib/hashtrie.kep'
 * DO NOT EDIT
*/
"use strict";
var hash, empty, isHashTrie, tryGetHash, tryGet, getHash, get, hasHash, has, setHash, set, modifyHash, modify,
        removeHash, remove, fold, pairs, count, keys, values, size = 4,
    BUCKET_SIZE = Math.pow(2, size),
    mask = (BUCKET_SIZE - 1),
    constant = (function(x) {
        return (function() {
            return x;
        });
    }),
    nothing = ({}),
    isNothing = (function(x) {
        return (x === nothing);
    }),
    maybe = (function(val, alt) {
        return (isNothing(val) ? alt : val);
    }),
    hashFragment = (function(shift, h) {
        return ((h >>> shift) & mask);
    });
(hash = (function(str) {
    if (((typeof str) === "number")) return str;
    var hash = 0;
    for (var i = 0, len = str.length;
        (i < len);
        (i = (i + 1))) {
        var char = str.charCodeAt(i);
        (hash = ((((hash << 5) - hash) + char) | 0));
    }
    return hash;
}));
(empty = null);
var Leaf = (function(hash, key, value) {
    var self = this;
    (self.hash = hash);
    (self.key = key);
    (self.value = value);
}),
    Collision = (function(hash, list) {
        var self = this;
        (self.hash = hash);
        (self.list = list);
    }),
    InternalNode = (function(count, children) {
        var self = this;
        (self.count = count);
        (self.children = children);
    }),
    isEmpty = (function(x) {
        return (!x);
    }),
    arrayUpdate = (function(at, v, arr) {
        var out = arr.slice();
        (out[at] = v);
        return out;
    }),
    arrayRemove = (function(at, arr) {
        var out = arr.slice();
        (delete out[at]);
        return out;
    }),
    createInternal = (function(pairs) {
        var children = [];
        for (var i = 0, len = pairs.length;
            (i < len);
            (i = (i + 2)))(children[pairs[i]] = pairs[(i + 1)]);
        return new(InternalNode)(pairs.length, children);
    }),
    mergeLeaves = (function(shift, n1, n2) {
        var subH1, subH2, h1 = n1.hash,
            h2 = n2.hash;
        return ((h1 === h2) ? new(Collision)(h1, [n2, n1]) : ((subH1 = hashFragment(shift, h1)), (subH2 =
            hashFragment(shift, h2)), createInternal(((subH1 === subH2) ? [subH1, mergeLeaves((shift + size),
            n1, n2)] : [subH1, n1, subH2, n2]))));
    }),
    updateCollisionList = (function(list, f, k) {
        var first, rest, v;
        return ((!list.length) ? [] : ((first = list[0]), (rest = list.slice(1)), ((first.key === k) ? ((v = f(
            first)), (isNothing(v) ? rest : [v].concat(rest))) : [first].concat(updateCollisionList(
            rest, f, k)))));
    }),
    lookup;
(Leaf.prototype.get = (function(_, _0, k) {
    var self = this;
    return ((k === self.key) ? self.value : nothing);
}));
(Collision.prototype.get = (function(_, _0, k) {
    var self = this;
    for (var i = 0, len = self.list.length;
        (i < len);
        (i = (i + 1))) {
        var __o = self.list[i],
            key = __o["key"],
            value = __o["value"];
        if ((k === key)) return value;
    }
    return nothing;
}));
(InternalNode.prototype.get = (function(shift, h, k) {
    var self = this,
        frag = hashFragment(shift, h),
        child = self.children[frag];
    return lookup((shift + size), h, k, child);
}));
(lookup = (function(shift, h, k, n) {
    return (isEmpty(n) ? nothing : n.get(shift, h, k));
}));
var alter, alterEmpty = (function(_, f, h, k) {
        var v = f();
        return (isNothing(v) ? empty : new(Leaf)(h, k, v));
    });
(Leaf.prototype.modify = (function(shift, f, h, k) {
    var v, v0, self = this;
    return ((k === self.key) ? ((v = f(self.value)), (isNothing(v) ? empty : new(Leaf)(h, k, v))) : ((v0 = f()), (
        isNothing(v0) ? self : mergeLeaves(shift, self, new(Leaf)(h, k, v0)))));
}));
(Collision.prototype.modify = (function(shift, f, h, k) {
    var self = this,
        list = updateCollisionList(self.list, f, k);
    return ((list.length > 1) ? new(Collision)(self.hash, list) : list[0]);
}));
(InternalNode.prototype.modify = (function(shift, f, h, k) {
    var self = this,
        frag = hashFragment(shift, h),
        child = self.children[frag],
        newChild = alter((shift + size), f, h, k, child);
    return ((isEmpty(child) && (!isEmpty(newChild))) ? new(InternalNode)((self.count + 1), arrayUpdate(frag,
        newChild, self.children)) : (((!isEmpty(child)) && isEmpty(newChild)) ? (((self.count - 1) <= 0) ?
        newChild : new(InternalNode)((self.count - 1), arrayRemove(frag, self.children))) : new(
        InternalNode)(self.count, arrayUpdate(frag, newChild, self.children))));
}));
(alter = (function(shift, f, h, k, n) {
    return (isEmpty(n) ? alterEmpty(shift, f, h, k) : n.modify(shift, f, h, k));
}));
(isHashTrie = (function(m) {
    return ((((m === empty) || (m instanceof Leaf)) || (m instanceof InternalNode)) || (m instanceof Collision));
}));
(tryGetHash = (function(alt, h, k, m) {
    return maybe(lookup(0, h, k, m), alt);
}));
(tryGet = (function(alt, k, m) {
    return tryGetHash(alt, hash(k), k, m);
}));
(getHash = tryGetHash.bind(null, null));
(get = tryGet.bind(null, null));
(hasHash = (function(h, k, m) {
    return (!isNothing(lookup(0, h, k, m)));
}));
(has = (function(k, m) {
    return hasHash(hash(k), k, m);
}));
(modifyHash = (function(h, k, f, m) {
    return alter(0, f, h, k, m);
}));
(modify = (function(k, f, m) {
    return modifyHash(hash(k), k, f, m);
}));
(setHash = (function(h, k, v, m) {
    return modifyHash(h, k, constant(v), m);
}));
(set = (function(k, v, m) {
    return setHash(hash(k), k, v, m);
}));
var del = constant(nothing);
(removeHash = (function(h, k, m) {
    return modifyHash(h, k, del, m);
}));
(remove = (function(k, m) {
    return removeHash(hash(k), k, m);
}));
(Leaf.prototype.fold = (function(f, z) {
    var self = this;
    return f(z, self);
}));
(Collision.prototype.fold = (function(f, z) {
    var self = this;
    return self.list.reduce(f, z);
}));
(InternalNode.prototype.fold = (function(f, z) {
    var self = this;
    return self.children.reduce(fold.bind(null, f), z);
}));
(fold = (function(f, z, m) {
    return (isEmpty(m) ? z : m.fold(f, z));
}));
(count = fold.bind(null, (function(x, y) {
        return (x + y);
    })
    .bind(null, 1), 0));
var build = (function(p, __o) {
    var key = __o["key"],
        value = __o["value"];
    p.push([key, value]);
    return p;
});
(pairs = (function(m) {
    return fold(build, [], m);
}));
var build0 = (function(p, __o) {
    var key = __o["key"];
    p.push(key);
    return p;
});
(keys = (function(m) {
    return fold(build0, [], m);
}));
var build1 = (function(p, __o) {
    var value = __o["value"];
    p.push(value);
    return p;
});
(values = (function(m) {
    return fold(build1, [], m);
}));
(exports.hash = hash);
(exports.empty = empty);
(exports.isHashTrie = isHashTrie);
(exports.tryGetHash = tryGetHash);
(exports.tryGet = tryGet);
(exports.getHash = getHash);
(exports.get = get);
(exports.hasHash = hasHash);
(exports.has = has);
(exports.setHash = setHash);
(exports.set = set);
(exports.modifyHash = modifyHash);
(exports.modify = modify);
(exports.removeHash = removeHash);
(exports.remove = remove);
(exports.fold = fold);
(exports.pairs = pairs);
(exports.count = count);
(exports.keys = keys);
(exports.values = values);