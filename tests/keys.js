var ht = require('../dist_node/hashtrie');

var containsAll = function(test, arr, keys) {
    keys.forEach(function(k) {
        test.ok(arr.indexOf(k) >= 0, k);
    });
};


exports.empty = function(test) {
    test.deepEqual(
        ht.keys(ht.empty),
        []);

    test.done();
};

exports.simple_keys= function(test) {
    var h1 = ht.set('b', 5, ht.set('a', 3, ht.empty));
    
    containsAll(test,
        ht.keys(h1),
        ['b', 'a']);

    test.done();
};

exports.collision = function(test) {
    var h1 = ht.setHash(0, 'b', 5, ht.setHash(0, 'a', 3, ht.empty));
        
    containsAll(test,
        ht.keys(h1),
        ['b', 'a']);
    
    test.done();
};

exports.many = function(test) {
    var insert = ["n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
               "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
               "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
               "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
               "u", "I", "O", "`", "X"];
    
    var h = ht.empty;
    insert.forEach(function(x) {
        h = ht.set(x, x, h);
    });
    
    containsAll(test,
        ht.keys(h),
        insert);
    
    test.done();
};
