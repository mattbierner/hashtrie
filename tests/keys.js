"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('keys', () => {
    it('should return empty for empty map', () => {
        assert.deepEqual([], hashtrie.keys(hashtrie.empty));
    });
    
    it('should return single key for single element map', () => {
        assert.deepEqual(['a'], hashtrie.keys(hashtrie.empty.set('a', 5)));
        assert.deepEqual(['b'], hashtrie.empty.set('b', 5).keys());
    });
    
    it('should return all keys for collision', () => {
        const h1 = hashtrie.empty
            .setHash(0, 'a', 3)
            .setHash(0, 'b', 5);
            
        assert.sameMembers(['a', 'b'], hashtrie.keys(h1));
    });
    
    it('return correct keys while items are added', () => {
        const insert = [
            "n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
            "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
            "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
            "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
            "u", "I", "O", "`", "X"];
    
        let h = hashtrie.empty;
        insert.forEach(x => {
            h = h.set(x, x);
        });
    
        assert.sameMembers(insert, hashtrie.keys(h));
    });
});

