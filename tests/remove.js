var ht = require('../dist_node/hashtrie');


exports.single = function(test) {
    var h = ht.set('a', 3, ht.empty);
    test.equal(ht.get('a', h), 3);
    
    var h1 = ht.remove('a', h);
    test.equal(ht.get('a', h1), null);

    test.done();
};

exports.remove_on_empty = function(test) {
    var h = ht.remove('x', ht.empty);
    test.done();
};

exports.delete_one_entry = function(test) {
    var h1 = ht.set('b', 5, ht.set('a', 3, ht.empty));
    
    var h2 = ht.remove('a', h1);
    test.equal(ht.get('a', h2), null);
    test.equal(ht.get('b', h2), 5);
    
    var h3 = ht.remove('b', h2);
    test.equal(ht.get('a', h3), null);
    test.equal(ht.get('b', h3), null);
    
    test.done();
};

exports.remove_does_not_alter_original = function(test) {
    var h1 = ht.set('b', 5,ht.set('a', 3, ht.empty));
    
    var h2 = ht.remove('a', h1);
    
    test.equal(ht.get('a', h1), 3);
    test.equal(ht.get('b', h1), 5);
    
    test.equal(ht.get('a', h2), null);
    test.equal(ht.get('b', h2), 5);
    
    test.done();
};

exports.delete_collision = function(test) {
    var h1 = ht.setHash(0, 'b', 5, ht.setHash(0, 'a', 3, ht.empty));
    var h2 = ht.removeHash(0, 'a', h1);
    
    test.equal(ht.getHash(0, 'a', h2), null);
    test.equal(ht.getHash(0, 'b', h2), 5);
    
    test.done();
};

exports.remove_many = function(test) {
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
    insert.forEach(function(x) {
        h = ht.set(x, x, h);
    });
    
    for (var i = 0; i < remove.length; ++i) {
        h = ht.remove(remove[i], h);
        
        for (var g = 0; g <= i; ++g) {
            test.equal(
                ht.get(remove[g], h),
                null);
        }
        for (var g = i + 1; g < remove.length; ++g) {
            test.equal(
                ht.get(remove[g], h),
                remove[g]);
        }
    } 
    
    

    test.done();
};
