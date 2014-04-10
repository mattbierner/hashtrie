/*
 * THIS FILE IS AUTO GENERATED from 'lib/hashtrie.kep'
 * DO NOT EDIT
*/"use strict";
var hash, empty, isHashTrie, tryGetHash, tryGet, getHash, get, hasHash, has, setHash, set, modifyHash, modify,
        removeHash, remove, fold, pairs, count, keys, values, BUCKET_SIZE = Math.pow(2, 4),
    mask = (BUCKET_SIZE - 1),
    nothing = ({});
(hash = (function(str) {
    if (((typeof str) === "number")) return str;
    var hash0 = 0;
    for (var i = 0, len = str.length;
        (i < len);
        (i = (i + 1))) {
        var char = str.charCodeAt(i);
        (hash0 = ((((hash0 << 5) - hash0) + char) | 0));
    }
    return hash0;
}));
(empty = null);
var Leaf = (function(hash0, key, value) {
    var self = this;
    (self.hash = hash0);
    (self.key = key);
    (self.value = value);
}),
    Collision = (function(hash0, children) {
        var self = this;
        (self.hash = hash0);
        (self.children = children);
    }),
    InternalNode = (function(count, children) {
        var self = this;
        (self.count = count);
        (self.children = children);
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
    create1Internal = (function(h, n) {
        var children = [];
        (children[h] = n);
        return new(InternalNode)(1, children);
    }),
    create2Internal = (function(h1, n1, h2, n2) {
        var children = [];
        (children[h1] = n1);
        (children[h2] = n2);
        return new(InternalNode)(2, children);
    }),
    mergeLeaves = (function(shift, n1, n2) {
        var h1 = n1.hash,
            subH1, subH2, h2 = n2.hash;
        return ((h1 === h2) ? new(Collision)(h1, [n2, n1]) : ((subH1 = ((h1 >>> shift) & mask)), (subH2 = ((h2 >>>
            shift) & mask)), ((subH1 === subH2) ? create1Internal(subH1, mergeLeaves((shift + 4), n1, n2)) :
            create2Internal(subH1, n1, subH2, n2))));
    }),
    updateCollisionList = (function(list, f, k) {
        var first, rest, v;
        return ((!list.length) ? [] : ((first = list[0]), (rest = list.slice(1)), ((first.key === k) ? ((v = f(
            first.value)), ((nothing === v) ? rest : [v].concat(rest))) : [first].concat(
            updateCollisionList(rest, f, k)))));
    }),
    lookup;
(Leaf.prototype.get = (function(_, _0, k) {
    var self = this;
    return ((k === self.key) ? self.value : nothing);
}));
(Collision.prototype.get = (function(_, _0, k) {
    var self = this;
    for (var i = 0, len = self.children.length;
        (i < len);
        (i = (i + 1))) {
        var __o = self.children[i],
            key = __o["key"],
            value = __o["value"];
        if ((k === key)) return value;
    }
    return nothing;
}));
(InternalNode.prototype.get = (function(shift, h, k) {
    var self = this,
        frag = ((h >>> shift) & mask),
        child = self.children[frag];
    return lookup((shift + 4), h, k, child);
}));
(lookup = (function(shift, h, k, n) {
    return ((!n) ? nothing : n.get(shift, h, k));
}));
var alter, alterEmpty = (function(_, f, h, k) {
        var v = f();
        return ((nothing === v) ? null : new(Leaf)(h, k, v));
    });
(Leaf.prototype.modify = (function(shift, f, h, k) {
    var v, v0, n2, h1, h2, subH1, subH2, self = this;
    return ((k === self.key) ? ((v = f(self.value)), ((nothing === v) ? null : new(Leaf)(h, k, v))) : ((v0 = f()), (
        (nothing === v0) ? self : ((n2 = new(Leaf)(h, k, v0)), (h1 = self.hash), (h2 = n2.hash), ((h1 ===
            h2) ? new(Collision)(h1, [n2, self]) : ((subH1 = ((h1 >>> shift) & mask)), (subH2 =
            ((h2 >>> shift) & mask)), ((subH1 === subH2) ? create1Internal(subH1,
            mergeLeaves((shift + 4), self, n2)) : create2Internal(subH1, self, subH2,
            n2))))))));
}));
(Collision.prototype.modify = (function(shift, f, h, k) {
    var self = this,
        first, rest, v, list = self.children,
        list0 = ((!list.length) ? [] : ((first = list[0]), (rest = list.slice(1)), ((first.key === k) ? ((v = f(
            first.value)), ((nothing === v) ? rest : [v].concat(rest))) : [first].concat(
            updateCollisionList(rest, f, k)))));
    return ((list0.length > 1) ? new(Collision)(self.hash, list0) : list0[0]);
}));
(InternalNode.prototype.modify = (function(shift, f, h, k) {
    var self = this,
        frag = ((h >>> shift) & mask),
        child = self.children[frag],
        newChild = alter((shift + 4), f, h, k, child);
    return (((!child) && (!(!newChild))) ? new(InternalNode)((self.count + 1), arrayUpdate(frag, newChild, self
        .children)) : (((!(!child)) && (!newChild)) ? (((self.count - 1) <= 0) ? newChild : new(
        InternalNode)((self.count - 1), arrayRemove(frag, self.children))) : new(InternalNode)(self.count,
        arrayUpdate(frag, newChild, self.children))));
}));
(alter = (function(shift, f, h, k, n) {
    return ((!n) ? alterEmpty(shift, f, h, k) : n.modify(shift, f, h, k));
}));
(isHashTrie = (function(m) {
    return ((((m === null) || (m instanceof Leaf)) || (m instanceof InternalNode)) || (m instanceof Collision));
}));
(tryGetHash = (function(alt, h, k, m) {
    var val = ((!m) ? nothing : m.get(0, h, k));
    return ((nothing === val) ? alt : val);
}));
(tryGet = (function(alt, k, m) {
    var h = hash(k),
        val = ((!m) ? nothing : m.get(0, h, k));
    return ((nothing === val) ? alt : val);
}));
(getHash = (function(h, k, m) {
    var val = ((!m) ? nothing : m.get(0, h, k));
    return ((nothing === val) ? null : val);
}));
(get = (function(k, m) {
    var h = hash(k),
        val = ((!m) ? nothing : m.get(0, h, k));
    return ((nothing === val) ? null : val);
}));
(hasHash = (function(h, k, m) {
    var y;
    return (!((y = ((!m) ? nothing : m.get(0, h, k))), (nothing === y)));
}));
(has = (function(k, m) {
    var y, h = hash(k);
    return (!((y = ((!m) ? nothing : m.get(0, h, k))), (nothing === y)));
}));
(modifyHash = (function(h, k, f, m) {
    return alter(0, f, h, k, m);
}));
(modify = (function(k, f, m) {
    var h = hash(k);
    return alter(0, f, h, k, m);
}));
(setHash = (function(h, k, v, m) {
    var f = (function() {
        return v;
    });
    return alter(0, f, h, k, m);
}));
(set = (function(k, v, m) {
    var h = hash(k),
        f = (function() {
            return v;
        });
    return alter(0, f, h, k, m);
}));
var del = (function() {
    return nothing;
});
(removeHash = (function(h, k, m) {
    return alter(0, del, h, k, m);
}));
(remove = (function(k, m) {
    return removeHash(hash(k), k, m);
}));
(Leaf.prototype.fold = (function(f, z) {
    var self = this;
    return f(z, self);
}));
(Collision.prototype.fold = (function(f, z) {
    var __o = this,
        children = __o["children"];
    return children.reduce(f, z);
}));
(InternalNode.prototype.fold = (function(f, z) {
    var __o = this,
        children = __o["children"],
        z1 = z;
    for (var i = 0, len = children.length;
        (i < len);
        (i = (i + 1))) {
        var c = children[i];
        if (c) {
            (z1 = ((c instanceof Leaf) ? f(z1, c) : c.fold(f, z1)));
        }
    }
    return z1;
}));
(fold = (function(f, z, m) {
    return ((!m) ? z : m.fold(f, z));
}));
var f = (function(y) {
    return (1 + y);
});
(count = (function(m) {
    return ((!m) ? 0 : m.fold(f, 0));
}));
var build = (function(p, __o) {
    var key = __o["key"],
        value = __o["value"];
    p.push([key, value]);
    return p;
});
(pairs = (function(m) {
    var z = [];
    return ((!m) ? z : m.fold(build, z));
}));
var build0 = (function(p, __o) {
    var key = __o["key"];
    p.push(key);
    return p;
});
(keys = (function(m) {
    var z = [];
    return ((!m) ? z : m.fold(build0, z));
}));
var build1 = (function(p, __o) {
    var value = __o["value"];
    p.push(value);
    return p;
});
(values = (function(m) {
    var z = [];
    return ((!m) ? z : m.fold(build1, z));
}));
(exports["hash"] = hash);
(exports["empty"] = empty);
(exports["isHashTrie"] = isHashTrie);
(exports["tryGetHash"] = tryGetHash);
(exports["tryGet"] = tryGet);
(exports["getHash"] = getHash);
(exports["get"] = get);
(exports["hasHash"] = hasHash);
(exports["has"] = has);
(exports["setHash"] = setHash);
(exports["set"] = set);
(exports["modifyHash"] = modifyHash);
(exports["modify"] = modify);
(exports["removeHash"] = removeHash);
(exports["remove"] = remove);
(exports["fold"] = fold);
(exports["pairs"] = pairs);
(exports["count"] = count);
(exports["keys"] = keys);
(exports["values"] = values);