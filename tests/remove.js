"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('remove', () => {
    it('should noop on empty', () => {
        assert.strictEqual(0, hashtrie.count(hashtrie.remove('a', hashtrie.empty)));
        assert.strictEqual(0, hashtrie.count(hashtrie.remove('b', hashtrie.empty)));
    });
    
    it('should remove value from single map', () => {
        const h1 = hashtrie.empty.set('a', 3);
        const h2 = h1.remove('a');
        
        assert.strictEqual(0, hashtrie.count(h2));
        assert.strictEqual(undefined, hashtrie.get('a', h2));
        
        assert.strictEqual(1, hashtrie.count(h1));
        assert.strictEqual(3, hashtrie.get('a', h1));
    });
    
    it('should only remove a single entry', () => {
        const h1 = hashtrie.empty
            .set('a', 3)
            .set('b', 5);
        const h2 = hashtrie.remove('a', h1);
        
        assert.strictEqual(1, hashtrie.count(h2));
        assert.strictEqual(undefined, hashtrie.get('a', h2));
        assert.strictEqual(5, hashtrie.get('b', h2));

        assert.strictEqual(2, hashtrie.count(h1));
        assert.strictEqual(3, hashtrie.get('a', h1));
        assert.strictEqual(5, hashtrie.get('b', h1));
    });
    
    it('should remove collisions correctly a single entry', () => {
        const h1 = hashtrie.empty
            .setHash(0, 'a', 3)
            .setHash(0, 'b', 5);

        const h2 = h1.deleteHash(0, 'a');
        
        assert.strictEqual(1, hashtrie.count(h2));
        assert.strictEqual(undefined, h2.getHash(0, 'a'));
        assert.strictEqual(5, h2.getHash(0, 'b'));

        assert.strictEqual(2, hashtrie.count(h1));
        assert.strictEqual(3, h1.getHash(0, 'a'));
        assert.strictEqual(5, h1.getHash(0, 'b'));
    });
    
     it('should not remove for a collision that does not match key', () => {
        const h1 = hashtrie.empty
            .setHash(0, 'a', 3)
            .setHash(0, 'b', 5);
            
        const h2 = h1.removeHash(0, 'c');
    
        assert.strictEqual(3, h2.getHash(0, 'a'));
        assert.strictEqual(5, h2.getHash(0, 'b'));
        assert.strictEqual(undefined, h2.getHash(0, 'c'));
    });
    
    it('should remove correctly from large set', () => {
        const insert = [
            "n", "U", "p", "^", "h", "w", "W", "x", "S", "f", "H", "m", "g",
            "l", "b", "_", "V", "Z", "G", "o", "F", "Q", "a", "k", "j", "r",
            "B", "A", "y", "\\", "R", "D", "i", "c", "]", "C", "[", "e", "s",
            "t", "J", "E", "q", "v", "M", "T", "N", "L", "K", "Y", "d", "P",
            "u", "I", "O", "`", "X"];
    
        const remove = [
            "w", "m", "Q", "R", "i", "K", "P", "Y", "D", "g", "y", "L",
            "b", "[", "a", "t", "j", "W", "J", "G", "q", "r", "p", "U",
            "v", "h", "S", "_", "d", "x", "I", "F", "f", "n", "B", "\\",
            "k", "V", "N", "l", "X", "A", "]", "s", "Z", "O", "^", "o",
            "`", "H", "E", "e", "M", "u", "T", "c", "C"];
    
        let h = hashtrie.empty;
        insert.forEach(function(x) {
            h = hashtrie.set(x, x, h);
        });
    
        for (let i = 0; i < remove.length; ++i) {
            h = hashtrie.remove(remove[i], h);
        
            for (let g = 0; g <= i; ++g) {
                assert.strictEqual(
                    hashtrie.get(remove[g], h),
                    undefined);
            }
            for (let g = i + 1; g < remove.length; ++g) {
                assert.strictEqual(
                    hashtrie.get(remove[g], h),
                    remove[g]);
            }
        }
    });
});
