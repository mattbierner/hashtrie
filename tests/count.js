var ht = require('../dist_node/hashtrie');

exports.empty = function(test) {
    test.equal(ht.count(ht.empty), 0);

    test.done();
};

exports.simple_count = function(test) {
    var h1 = ht.set('b', 5, ht.set('a', 3, ht.empty));
    
    test.equal(ht.count(h1), 2);

    test.done();
};

exports.collision = function(test) {
    var h1 = ht.setHash(0, 'b', 5, ht.setHash(0, 'a', 3, ht.empty));
    
    test.equal(ht.count(h1), 2);
    
    test.done();
};

exports.many = function(test) {
    var insert = ["n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
               "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
               "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
               "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
               "u", "I", "O", "`", "X"];
    
    var remove = ["w", "m", "Q", "R", "i", "K", "P", "Y", "D", "g", "y", "L",
                  "b", "[", "a", "t", "j", "W", "J", "G", "q", "r", "p", "U",
                  "v", "h", "S", "_", "d", "x", "I", "F", "f", "n", "B", "\\",
                  "k", "V", "N", "l", "X", "A", "]", "s", "Z", "O", "^", "o",
                  "`", "H", "E", "e", "M", "u", "T", "c", "C"];
    
    var h = ht.empty;
    
    for (var i = 0; i < insert.length; ++i) {
        var x = insert[i];
        h = ht.set(x, x, h);
        test.equal(
            ht.count(h),
            i + 1);
    }
    ht.fold(console.log, null, h);
    
    for (var i = 0; i < remove.length; ++i) {
        h = ht.remove(remove[i], h);
        test.equal(
            ht.count(h),
            remove.length - i - 1);
    }
    test.done();
};
