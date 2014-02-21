var ht = require('../dist_node/hashtrie');


exports.single = function(test) {
    var h = ht.set('a', 3, ht.empty);
    test.equal(ht.get('a', h), 3);
    
    test.done();
};

exports.put_falsey = function(test) {
    var h = ht.set('a', null, ht.empty);
    test.equal(ht.get('a', h), null);
    
    test.done();
};

exports.get_non_existant_empty = function(test) {
    test.equal(ht.get('a', ht.empty), null);
    test.equal(ht.tryGet('def', 'a', ht.empty), 'def');

    test.done();
};

exports.multiple = function(test) {
    var h1 = ht.set('a', 3, ht.empty);
    var h2 = ht.set('b', 5, h1);
    
    test.equal(ht.get('a', h2), 3);
    test.equal(ht.get('b', h2), 5);
    
    test.done();
};

exports.set_does_not_alter_original = function(test) {
    var h1 = ht.set('a', 3, ht.empty);
    var h2 = ht.set('b', 5, h1);
    
    test.equal(ht.get('a', h1), 3);
    test.equal(ht.get('b', h1), null);
    
    test.equal(ht.get('a', h2), 3);
    test.equal(ht.get('b', h2), 5)
    ;
    test.done();
};


exports.collision = function(test) {
    var h1 = ht.setHash(0, 'a', 3, ht.empty);
    var h2 = ht.setHash(0, 'b', 5, h1);
    
    test.equal(ht.getHash(0, 'a', h2), 3);
    test.equal(ht.getHash(0, 'b', h2), 5);
    
    test.done();
};

exports.many_unorder = function(test) {
    var arr = ["n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
               "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
               "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
               "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
               "u", "I", "O", "`", "X"];
    
    var h = ht.empty;
    arr.forEach(function(x) {
        h = ht.set(x, x, h);
    });
    
    arr.forEach(function(x) {
        test.equal(
            ht.get(x, h),
            x);
    });

    
    test.done();
};

exports.many_ordered = function(test) {
    var h = ht.empty;
    for (var i = 'A'.charCodeAt(0); i < 'z'.charCodeAt(0); ++i) {
        h = ht.set(String.fromCharCode(i), i, h);
    }

    for (var i = 'A'.charCodeAt(0); i < 'z'.charCodeAt(0); ++i) {
        test.equal(
            ht.get(String.fromCharCode(i), h),
            i);
    }
    
    test.done();
};