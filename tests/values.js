"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('values', () => {
    it('should return empty for empty map', () => {
        assert.deepEqual([], hashtrie.values(hashtrie.empty));
    });
    
    it('should return single key for single element map', () => {
        assert.deepEqual([3], hashtrie.values(hashtrie.empty.set('a', 3)));
        assert.deepEqual([5], hashtrie.empty.set('b', 5).values());
    });
    
    it('should return all values for collision', () => {
        const h1 = hashtrie.empty
            .setHash(0, 'a', 3)
            .setHash(0, 'b', 5);
        
        assert.sameMembers([5, 3], hashtrie.values(h1));
    });
    
    it('should return duplicate values', () => {
        const h = hashtrie.empty.set('b', 3).set('a', 3);
        assert.deepEqual([3, 3], hashtrie.values(h));
    });
    
    it('return correct values while items are added', () => {
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
    
        assert.sameMembers(insert, hashtrie.values(h));
    });
});

