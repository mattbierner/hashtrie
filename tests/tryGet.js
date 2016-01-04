"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('tryGet', () => {
    it('should return default for empty map', () => {
        assert.strictEqual(10, hashtrie.tryGet(10, 'a', hashtrie.empty));
        assert.strictEqual(10, hashtrie.empty.tryGet('a', 10));

        assert.strictEqual(10, hashtrie.tryGet(10, 'b', hashtrie.empty));
        assert.strictEqual(false, hashtrie.tryGet(false, 'a', hashtrie.empty));
        
        const a = {};
        assert.strictEqual(a, hashtrie.tryGet(a, 'b', hashtrie.empty));

    });
    
    it('should return default for non-existant value', () => {
        var h1 = hashtrie.empty.set('a', 3);
    
        assert.strictEqual(3, hashtrie.tryGet(10, 'a', h1));
        assert.strictEqual(10, hashtrie.tryGet(10, 'b', h1));
    });
    
    it('should work on array nodes correctly', () => {
        const insert = [
            "n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
            "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
            "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
            "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
            "u", "I", "O", "`", "X"];
    
        let h = hashtrie.empty;
        for (let i = 0; i < insert.length; ++i) {
            h = h.setHash(i, insert[i], insert[i]);
        }
        
        assert.strictEqual(insert.length, h.count());
        
        for (let i = 0; i < insert.length; ++i) {
            const x = insert[i];
            assert.strictEqual(x, h.tryGetHash(i, x, null));
            assert.strictEqual(null, h.tryGetHash(i, x + x, null));
        }
    });
});
